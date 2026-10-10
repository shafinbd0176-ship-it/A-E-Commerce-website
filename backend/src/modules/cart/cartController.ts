import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../database/db.js';
import { AppError } from '../../middleware/errorHandler.js';
import { AuthRequest } from '../../middleware/auth.js';
import { Cart, CartItem, ProductCondition } from '../../../../shared/types/index.js';
import { DISCOUNT_CODES, SUSTAINABILITY_FACTORS } from '../../../../shared/constants/index.js';

export class CartController {
  public static async getCart(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const discountCode = (req.query.discountCode as string)?.toUpperCase();

      const rows = await db.query<any>(
        `SELECT ci.*, p.title, p.slug, p.short_description, p.price, p.stock_quantity, p.condition,
                p.rebuild_info_json, p.specs_json,
                (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
         FROM cart_items ci
         JOIN products p ON ci.product_id = p.id
         WHERE ci.user_id = ? AND p.is_archived = 0`,
        [req.user.id]
      );

      let subtotal = 0;
      let totalEWaste = 0;
      let totalCO2 = 0;

      const items: CartItem[] = rows.map((r) => {
        let rebuildInfo = { eWasteDivertedKg: 1.5, co2SavedKg: 25 };
        try {
          rebuildInfo = JSON.parse(r.rebuild_info_json || '{}');
        } catch {}

        const itemSubtotal = r.price * r.quantity;
        subtotal += itemSubtotal;
        totalEWaste += (rebuildInfo.eWasteDivertedKg || 1.5) * r.quantity;
        totalCO2 += (rebuildInfo.co2SavedKg || 25) * r.quantity;

        return {
          id: r.id,
          productId: r.product_id,
          quantity: r.quantity,
          unitPrice: r.price,
          product: {
            id: r.product_id,
            title: r.title,
            slug: r.slug,
            shortDescription: r.short_description,
            description: '',
            price: r.price,
            categoryId: '',
            condition: r.condition as ProductCondition,
            stockQuantity: r.stock_quantity,
            sku: '',
            images: r.primary_image ? [{ id: '1', url: r.primary_image, alt: r.title, isPrimary: true, sortOrder: 0 }] : [],
            specs: [],
            rebuildInfo: rebuildInfo as any,
            isFeatured: false,
            isArchived: false,
            averageRating: 5.0,
            reviewCount: 0,
            createdAt: '',
            updatedAt: ''
          }
        };
      });

      const shipping = subtotal > 150 ? 0 : (items.length > 0 ? 15 : 0);
      let discountAmount = 0;
      if (discountCode && DISCOUNT_CODES[discountCode]) {
        discountAmount = Number(((subtotal * DISCOUNT_CODES[discountCode].percent) / 100).toFixed(2));
      }

      const total = Math.max(0, subtotal - discountAmount + shipping);

      const cart: Cart = {
        items,
        subtotal: Number(subtotal.toFixed(2)),
        estimatedShipping: shipping,
        discountAmount,
        discountCode,
        total: Number(total.toFixed(2)),
        totalEWasteDivertedKg: Number(totalEWaste.toFixed(2)),
        totalCO2SavedKg: Number(totalCO2.toFixed(2))
      };

      res.json({
        success: true,
        data: cart
      });
    } catch (err) {
      next(err);
    }
  }

  public static async addItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { productId, quantity = 1, selectedSpecs } = req.body;
      if (!productId) {
        throw new AppError('Product ID is required', 400);
      }

      // Check product and stock
      const product = await db.get<any>('SELECT * FROM products WHERE id = ? AND is_archived = 0', [productId]);
      if (!product) {
        throw new AppError('Product not found or unavailable', 404);
      }

      if (product.stock_quantity < quantity) {
        throw new AppError(`Only ${product.stock_quantity} unit(s) available in inventory`, 400);
      }

      const existingItem = await db.get<any>(
        'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
        [req.user.id, productId]
      );

      const now = new Date().toISOString();

      if (existingItem) {
        const newQty = existingItem.quantity + quantity;
        if (newQty > product.stock_quantity) {
          throw new AppError(`Cannot exceed available stock of ${product.stock_quantity} units`, 400);
        }
        await db.run(
          'UPDATE cart_items SET quantity = ?, updated_at = ? WHERE id = ?',
          [newQty, now, existingItem.id]
        );
      } else {
        const id = `cart-item-${uuidv4()}`;
        await db.run(
          `INSERT INTO cart_items (id, user_id, product_id, quantity, selected_specs_json, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [id, req.user.id, productId, quantity, JSON.stringify(selectedSpecs || {}), now, now]
        );
      }

      res.status(200).json({
        success: true,
        message: 'Product added to your sustainable cart'
      });
    } catch (err) {
      next(err);
    }
  }

  public static async updateQuantity(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { itemId } = req.params;
      const { quantity } = req.body;

      if (quantity <= 0) {
        await db.run('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [itemId, req.user.id]);
        res.json({ success: true, message: 'Item removed from cart' });
        return;
      }

      const item = await db.get<any>(
        `SELECT ci.*, p.stock_quantity FROM cart_items ci 
         JOIN products p ON ci.product_id = p.id 
         WHERE ci.id = ? AND ci.user_id = ?`,
        [itemId, req.user.id]
      );

      if (!item) {
        throw new AppError('Cart item not found', 404);
      }

      if (quantity > item.stock_quantity) {
        throw new AppError(`Cannot exceed available stock of ${item.stock_quantity} units`, 400);
      }

      const now = new Date().toISOString();
      await db.run(
        'UPDATE cart_items SET quantity = ?, updated_at = ? WHERE id = ? AND user_id = ?',
        [quantity, now, itemId, req.user.id]
      );

      res.json({
        success: true,
        message: 'Cart quantity updated'
      });
    } catch (err) {
      next(err);
    }
  }

  public static async removeItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { itemId } = req.params;
      await db.run('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [itemId, req.user.id]);

      res.json({
        success: true,
        message: 'Item removed from cart'
      });
    } catch (err) {
      next(err);
    }
  }

  public static async clearCart(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      await db.run('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);

      res.json({
        success: true,
        message: 'Cart cleared'
      });
    } catch (err) {
      next(err);
    }
  }
}
