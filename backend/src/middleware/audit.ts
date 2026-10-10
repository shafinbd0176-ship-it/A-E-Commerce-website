import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db.js';
import { UserRole } from '../../../shared/types/index.js';

export async function recordAuditLog(params: {
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: 'PRODUCT' | 'ORDER' | 'USER' | 'INVENTORY' | 'SUPPORT' | 'SYSTEM';
  entityId: string;
  details: Record<string, unknown>;
  ipAddress?: string;
}): Promise<void> {
  try {
    const id = `audit-${uuidv4()}`;
    const now = new Date().toISOString();
    await db.run(
      `INSERT INTO audit_logs (id, user_id, user_name, user_role, action, entity_type, entity_id, details_json, ip_address, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        params.userId,
        params.userName,
        params.userRole,
        params.action,
        params.entityType,
        params.entityId,
        JSON.stringify(params.details),
        params.ipAddress || '127.0.0.1',
        now
      ]
    );
  } catch (err) {
    console.error('[AuditLog] Failed to record audit log:', err);
  }
}
