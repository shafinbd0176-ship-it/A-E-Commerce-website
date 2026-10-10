import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../database/db.js';
import { AppError } from '../../middleware/errorHandler.js';
import { AuthRequest } from '../../middleware/auth.js';
import { Review } from '../../../../shared/types/index.js';

export class ReviewController {
  public static async getProductReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { productId } = req.params;
      const rows = await db.query<any>(
        `SELECT r.*, u.first_name, u.last_name, u.avatar_url
         FROM reviews r
         JOIN users u ON r.user_id = u.id
         WHERE r.product_id = ? AND r.is_approved = 1
         ORDER BY r.created_at DESC`,
        [productId]
      );

      const reviews: Review[] = rows.map((r) => ({
        id: r.id,
        productId: r.product_id,
        userId: r.user_id,
        user: {
          firstName: r.first_name,
          lastName: r.last_name,
          avatarUrl: r.avatar_url
        },
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        isVerifiedPurchase: Boolean(r.is_verified_purchase),
        isApproved: Boolean(r.is_approved),
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }));

      res.json({ success: true, data: reviews });
    } catch (err) {
      next(err);
    }
  }

  public static async addReview(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Authentication required', 401);
      const { productId } = req.params;
      const { rating, title, comment } = req.body;

      if (!rating || rating < 1 || rating > 5 || !title || !comment) {
        throw new AppError('Valid rating (1-5), review title and comments are required', 400);
      }

      // Check verified purchase
      const hasPurchased = await db.get<any>(
        `SELECT oi.id FROM order_items oi
         JOIN orders o ON oi.order_id = o.id
         WHERE o.user_id = ? AND oi.product_id = ? AND o.status != 'CANCELLED'`,
        [req.user.id, productId]
      );

      const id = `rev-${uuidv4()}`;
      const now = new Date().toISOString();

      await db.run(
        `INSERT INTO reviews (id, product_id, user_id, rating, title, comment, is_verified_purchase, is_approved, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
        [id, productId, req.user.id, rating, title, comment, hasPurchased ? 1 : 0, now, now]
      );

      // Recompute average rating and review count on product
      const stats = await db.get<any>(
        `SELECT AVG(rating) as avg_rating, COUNT(*) as cnt FROM reviews WHERE product_id = ? AND is_approved = 1`,
        [productId]
      );

      if (stats) {
        await db.run(
          'UPDATE products SET average_rating = ?, review_count = ?, updated_at = ? WHERE id = ?',
          [Number(Number(stats.avg_rating || 5.0).toFixed(1)), Number(stats.cnt || 0), now, productId]
        );
      }

      res.status(201).json({
        success: true,
        message: 'Thank you for reviewing this reconstructed device!'
      });
    } catch (err) {
      next(err);
    }
  }
}
