import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../database/db.js';
import { AppError } from '../../middleware/errorHandler.js';
import { AuthRequest } from '../../middleware/auth.js';
import { SupportTicket, SupportMessage, TicketStatus, TicketPriority } from '../../../../shared/types/index.js';
import { recordAuditLog } from '../../middleware/audit.js';

export class SupportController {
  public static async createTicket(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Authentication required', 401);

      const { subject, category, priority = 'MEDIUM', message, orderId } = req.body;
      if (!subject || !category || !message) {
        throw new AppError('Subject, category and initial message are required', 400);
      }

      const ticketId = `tkt-${uuidv4()}`;
      const ticketNumber = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
      const now = new Date().toISOString();

      await db.run(
        `INSERT INTO support_tickets (id, ticket_number, user_id, order_id, subject, category, priority, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'OPEN', ?, ?)`,
        [ticketId, ticketNumber, req.user.id, orderId || null, subject, category, priority, now, now]
      );

      const msgId = `msg-${uuidv4()}`;
      await db.run(
        `INSERT INTO support_messages (id, ticket_id, sender_id, sender_role, sender_name, message, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [msgId, ticketId, req.user.id, req.user.role, `${req.user.firstName} ${req.user.lastName}`, message, now]
      );

      res.status(201).json({
        success: true,
        message: 'Support ticket submitted to our engineering and repair specialists',
        data: { ticketId, ticketNumber }
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getMyTickets(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Authentication required', 401);

      const rows = await db.query<any>(
        'SELECT * FROM support_tickets WHERE user_id = ? ORDER BY updated_at DESC',
        [req.user.id]
      );

      const ticketIds = rows.map(r => r.id);
      let msgMap: Record<string, SupportMessage[]> = {};
      if (ticketIds.length > 0) {
        const placeholders = ticketIds.map(() => '?').join(',');
        const msgs = await db.query<any>(
          `SELECT * FROM support_messages WHERE ticket_id IN (${placeholders}) ORDER BY created_at ASC`,
          ticketIds
        );
        for (const m of msgs) {
          if (!msgMap[m.ticket_id]) msgMap[m.ticket_id] = [];
          msgMap[m.ticket_id].push({
            id: m.id,
            ticketId: m.ticket_id,
            senderId: m.sender_id,
            senderRole: m.sender_role,
            senderName: m.sender_name,
            message: m.message,
            createdAt: m.created_at
          });
        }
      }

      const tickets: SupportTicket[] = rows.map((r) => ({
        id: r.id,
        ticketNumber: r.ticket_number,
        userId: r.user_id,
        orderId: r.order_id,
        subject: r.subject,
        category: r.category,
        priority: r.priority as TicketPriority,
        status: r.status as TicketStatus,
        messages: msgMap[r.id] || [],
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }));

      res.json({ success: true, data: tickets });
    } catch (err) {
      next(err);
    }
  }

  public static async addMessage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Authentication required', 401);
      const { ticketId } = req.params;
      const { message } = req.body;

      if (!message || message.trim().length === 0) {
        throw new AppError('Message cannot be empty', 400);
      }

      const ticket = await db.get<any>('SELECT * FROM support_tickets WHERE id = ?', [ticketId]);
      if (!ticket) throw new AppError('Ticket not found', 404);

      if (ticket.user_id !== req.user.id && req.user.role === 'customer') {
        throw new AppError('Unauthorized to reply to this ticket', 403);
      }

      const msgId = `msg-${uuidv4()}`;
      const now = new Date().toISOString();

      await db.run(
        `INSERT INTO support_messages (id, ticket_id, sender_id, sender_role, sender_name, message, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [msgId, ticketId, req.user.id, req.user.role, `${req.user.firstName} ${req.user.lastName}`, message, now]
      );

      // Auto-update ticket status
      const newStatus = req.user.role === 'customer' ? 'OPEN' : 'WAITING_ON_CUSTOMER';
      await db.run('UPDATE support_tickets SET status = ?, updated_at = ? WHERE id = ?', [newStatus, now, ticketId]);

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: {
          id: msgId,
          ticketId,
          senderId: req.user.id,
          senderRole: req.user.role,
          senderName: `${req.user.firstName} ${req.user.lastName}`,
          message,
          createdAt: now
        }
      });
    } catch (err) {
      next(err);
    }
  }

  public static async adminGetAllTickets(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const rows = await db.query<any>(
        `SELECT t.*, u.email as user_email, u.first_name, u.last_name,
                (SELECT COUNT(*) FROM support_messages WHERE ticket_id = t.id) as message_count
         FROM support_tickets t
         JOIN users u ON t.user_id = u.id
         ORDER BY t.updated_at DESC`
      );

      res.json({ success: true, data: rows });
    } catch (err) {
      next(err);
    }
  }

  public static async adminUpdateTicketStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ticketId } = req.params;
      const { status, priority } = req.body;
      const now = new Date().toISOString();

      await db.run(
        `UPDATE support_tickets SET status = COALESCE(?, status), priority = COALESCE(?, priority), updated_at = ? WHERE id = ?`,
        [status, priority, now, ticketId]
      );

      if (req.user) {
        await recordAuditLog({
          userId: req.user.id,
          userName: `${req.user.firstName} ${req.user.lastName}`,
          userRole: req.user.role,
          action: 'TICKET_STATUS_UPDATED',
          entityType: 'SUPPORT',
          entityId: ticketId,
          details: { status, priority }
        });
      }

      res.json({ success: true, message: 'Ticket status updated' });
    } catch (err) {
      next(err);
    }
  }
}
