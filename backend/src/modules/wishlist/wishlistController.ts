import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../database/db.js';
import { AppError } from '../../middleware/errorHandler.js';
import { AuthRequest } from '../../middleware/auth.js';

export class WishlistController {
  public static async getWishlist(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Authentication required', 401);

      const rows = await db.query<any>(
        `SELECT w.id, w.product_id, w.created_at, p.title, p.slug, p.price, p.condition, p.stock_quantity,
                (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
         FROM wishlist_items w
         JOIN products p ON w.product_id = p.id
         WHERE w.user_id = ? AND p.is_archived = 0
         ORDER BY w.created_at DESC`,
        [req.user.id]
      );

      const items = rows.map(r => ({
        id: r.id,
        productId: r.product_id,
        addedAt: r.created_at,
        product: {
          id: r.product_id,
          title: r.title,
          slug: r.slug,
          price: r.price,
          condition: r.condition,
          stockQuantity: r.stock_quantity,
          primaryImage: r.primary_image || '/placeholder-device.png'
        }
      }));

      res.json({ success: true, data: items });
    } catch (err) {
      next(err);
    }
  }

  public static async toggle(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Authentication required', 401);
      const { productId } = req.body;

      if (!productId) throw new AppError('Product ID is required', 400);

      const existing = await db.get<any>(
        'SELECT id FROM wishlist_items WHERE user_id = ? AND product_id = ?',
        [req.user.id, productId]
      );

      if (existing) {
        await db.run('DELETE FROM wishlist_items WHERE id = ?', [existing.id]);
        res.json({ success: true, message: 'Removed from wishlist', inWishlist: false });
      } else {
        const id = `wish-${uuidv4()}`;
        const now = new Date().toISOString();
        await db.run(
          'INSERT INTO wishlist_items (id, user_id, product_id, created_at) VALUES (?, ?, ?, ?)',
          [id, req.user.id, productId, now]
        );
        res.json({ success: true, message: 'Added to wishlist', inWishlist: true });
      }
    } catch (err) {
      next(err);
    }
  }
}
