import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../database/db.js';
import { AppError } from '../../middleware/errorHandler.js';
import { AuthRequest } from '../../middleware/auth.js';
import { Address } from '../../../../shared/types/index.js';

export class AddressController {
  public static async getMyAddresses(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Authentication required', 401);

      const rows = await db.query<any>(
        'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
        [req.user.id]
      );

      const addresses: Address[] = rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        recipientName: r.recipient_name,
        streetAddress1: r.street_address1,
        streetAddress2: r.street_address2,
        city: r.city,
        stateOrProvince: r.state_or_province,
        postalCode: r.postal_code,
        country: r.country,
        phone: r.phone,
        isDefault: Boolean(r.is_default),
        createdAt: r.created_at
      }));

      res.json({ success: true, data: addresses });
    } catch (err) {
      next(err);
    }
  }

  public static async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Authentication required', 401);

      const { recipientName, streetAddress1, streetAddress2, city, stateOrProvince, postalCode, country, phone, isDefault } = req.body;
      if (!recipientName || !streetAddress1 || !city || !postalCode || !country || !phone) {
        throw new AppError('Missing required address fields', 400);
      }

      const id = `addr-${uuidv4()}`;
      const now = new Date().toISOString();

      if (isDefault) {
        await db.run('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
      }

      await db.run(
        `INSERT INTO addresses (id, user_id, recipient_name, street_address1, street_address2, city, state_or_province, postal_code, country, phone, is_default, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, req.user.id, recipientName, streetAddress1, streetAddress2 || null, city, stateOrProvince || '', postalCode, country, phone, isDefault ? 1 : 0, now]
      );

      res.status(201).json({
        success: true,
        message: 'Address saved successfully',
        data: { id, recipientName, streetAddress1, city, postalCode, country, isDefault }
      });
    } catch (err) {
      next(err);
    }
  }

  public static async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Authentication required', 401);
      const { id } = req.params;
      await db.run('DELETE FROM addresses WHERE id = ? AND user_id = ?', [id, req.user.id]);
      res.json({ success: true, message: 'Address deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}
