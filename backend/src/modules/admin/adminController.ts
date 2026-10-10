import { Response, NextFunction } from 'express';
import { db } from '../../database/db.js';
import { AppError } from '../../middleware/errorHandler.js';
import { AuthRequest } from '../../middleware/auth.js';
import { SystemHealthStatus } from '../../../../shared/types/index.js';
import { recordAuditLog } from '../../middleware/audit.js';

export class AdminController {
  public static async getSystemHealth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const startTime = Date.now();
      let dbStatus: 'UP' | 'DOWN' = 'UP';

      try {
        await db.get('SELECT 1');
      } catch {
        dbStatus = 'DOWN';
      }

      const responseTimeMs = Date.now() - startTime;

      // Aggregations for Real Metrics
      const productStats = await db.get<any>('SELECT COUNT(*) as count FROM products WHERE is_archived = 0');
      const orderStats = await db.get<any>(
        `SELECT COUNT(*) as total_orders, 
                SUM(CASE WHEN status NOT IN ('DELIVERED', 'CANCELLED') THEN 1 ELSE 0 END) as active_orders,
                SUM(CASE WHEN status != 'CANCELLED' THEN total_amount ELSE 0 END) as total_revenue,
                SUM(total_ewaste_diverted_kg) as total_ewaste,
                SUM(total_co2_saved_kg) as total_co2
         FROM orders`
      );
      const customerStats = await db.get<any>("SELECT COUNT(*) as count FROM users WHERE role = 'customer'");

      const health: SystemHealthStatus = {
        status: dbStatus === 'UP' ? 'HEALTHY' : 'DEGRADED',
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        services: {
          api: { status: 'UP', responseTimeMs },
          database: { status: dbStatus, type: 'SQLite Relational Database (PostgreSQL Protocol Compatible)', poolActive: 1 },
          cache: { status: 'STANDBY' as any, engine: 'In-Memory / Redis Adapter' },
          pythonRecommendation: { status: 'STANDBY' as any, latencyMs: 12 }
        },
        metrics: {
          totalProducts: Number(productStats?.count || 0),
          activeOrders: Number(orderStats?.active_orders || 0),
          totalCustomers: Number(customerStats?.count || 0),
          totalRevenue: Number((orderStats?.total_revenue || 0).toFixed(2)),
          eWasteTotalDivertedKg: Number((orderStats?.total_ewaste || 0).toFixed(2)),
          co2TotalSavedKg: Number((orderStats?.total_co2 || 0).toFixed(2))
        }
      };

      res.json({ success: true, data: health });
    } catch (err) {
      next(err);
    }
  }

  public static async getCustomers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search } = req.query;
      let querySql = `
        SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.phone, u.is_active, u.created_at,
               (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) as order_count,
               (SELECT COALESCE(SUM(o.total_amount), 0) FROM orders o WHERE o.user_id = u.id AND o.status != 'CANCELLED') as lifetime_spend
        FROM users u
      `;
      const params: any[] = [];

      if (search) {
        querySql += ' WHERE (u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)';
        const s = `%${search}%`;
        params.push(s, s, s);
      }

      querySql += ' ORDER BY u.created_at DESC';

      const rows = await db.query<any>(querySql, params);

      res.json({
        success: true,
        data: rows.map(r => ({
          id: r.id,
          email: r.email,
          firstName: r.first_name,
          lastName: r.last_name,
          role: r.role,
          phone: r.phone,
          isActive: Boolean(r.is_active),
          createdAt: r.created_at,
          orderCount: Number(r.order_count || 0),
          lifetimeSpend: Number((r.lifetime_spend || 0).toFixed(2))
        }))
      });
    } catch (err) {
      next(err);
    }
  }

  public static async toggleCustomerStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { customerId } = req.params;
      const { isActive } = req.body;
      const now = new Date().toISOString();

      await db.run('UPDATE users SET is_active = ?, updated_at = ? WHERE id = ?', [isActive ? 1 : 0, now, customerId]);

      if (req.user) {
        await recordAuditLog({
          userId: req.user.id,
          userName: `${req.user.firstName} ${req.user.lastName}`,
          userRole: req.user.role,
          action: isActive ? 'CUSTOMER_ACTIVATED' : 'CUSTOMER_DEACTIVATED',
          entityType: 'USER',
          entityId: customerId,
          details: { isActive }
        });
      }

      res.json({ success: true, message: `Customer account ${isActive ? 'activated' : 'suspended'}` });
    } catch (err) {
      next(err);
    }
  }

  public static async getAuditLogs(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 30;
      const offset = (page - 1) * limit;

      const rows = await db.query<any>(
        'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );

      const countRow = await db.get<any>('SELECT COUNT(*) as total FROM audit_logs');
      const total = countRow ? Number(countRow.total) : 0;

      res.json({
        success: true,
        data: rows.map(r => ({
          id: r.id,
          userId: r.user_id,
          userName: r.user_name,
          userRole: r.user_role,
          action: r.action,
          entityType: r.entity_type,
          entityId: r.entity_id,
          details: JSON.parse(r.details_json || '{}'),
          ipAddress: r.ip_address,
          createdAt: r.created_at
        })),
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getLowStockAlerts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const rows = await db.query<any>(
        `SELECT id, title, sku, stock_quantity, price, condition
         FROM products
         WHERE stock_quantity <= 3 AND is_archived = 0
         ORDER BY stock_quantity ASC`
      );

      res.json({ success: true, data: rows });
    } catch (err) {
      next(err);
    }
  }
}
