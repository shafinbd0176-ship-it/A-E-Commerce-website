import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../database/db.js';
import { AppError } from '../../middleware/errorHandler.js';
import { AuthRequest } from '../../middleware/auth.js';
import { Order, OrderItem, OrderStatus, PaymentStatus } from '../../../../shared/types/index.js';
import { getPaymentProvider } from '../payments/paymentProvider.js';
import { recordAuditLog } from '../../middleware/audit.js';
import { DISCOUNT_CODES } from '../../../../shared/constants/index.js';

export class OrderController {
  public static async checkout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required to complete checkout', 401);
      }

      const {
        shippingAddress,
        paymentMethod = 'Credit Card / Digital Pay',
        paymentMethodToken,
        discountCode,
        notes
      } = req.body;

      if (!shippingAddress || !shippingAddress.recipientName || !shippingAddress.streetAddress1 || !shippingAddress.city) {
        throw new AppError('Valid shipping address is required', 400);
      }

      // Fetch active user cart items
      const cartRows = await db.query<any>(
        `SELECT ci.*, p.title, p.price, p.stock_quantity, p.condition, p.rebuild_info_json,
                (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
         FROM cart_items ci
         JOIN products p ON ci.product_id = p.id
         WHERE ci.user_id = ? AND p.is_archived = 0`,
        [req.user.id]
      );

      if (cartRows.length === 0) {
        throw new AppError('Your cart is empty', 400);
      }

      // Verify stock for all items
      for (const item of cartRows) {
        if (item.stock_quantity < item.quantity) {
          throw new AppError(`Item "${item.title}" is out of stock or requested quantity exceeds available stock (${item.stock_quantity} available)`, 400);
        }
      }

      let subtotal = 0;
      let totalEWaste = 0;
      let totalCO2 = 0;

      const orderItems: OrderItem[] = [];

      for (const row of cartRows) {
        let rebuildInfo = { eWasteDivertedKg: 1.5, co2SavedKg: 25 };
        try {
          rebuildInfo = JSON.parse(row.rebuild_info_json || '{}');
        } catch {}

        const itemTotal = row.price * row.quantity;
        subtotal += itemTotal;
        totalEWaste += (rebuildInfo.eWasteDivertedKg || 1.5) * row.quantity;
        totalCO2 += (rebuildInfo.co2SavedKg || 25) * row.quantity;

        orderItems.push({
          id: `item-${uuidv4()}`,
          orderId: '', // set after order creation
          productId: row.product_id,
          productTitle: row.title,
          productImage: row.primary_image || '/placeholder-device.png',
          unitPrice: row.price,
          quantity: row.quantity,
          totalPrice: itemTotal,
          condition: row.condition,
          rebuildNotes: `Certified rebuild: ${rebuildInfo.eWasteDivertedKg || 1.5}kg e-waste diverted`
        });
      }

      const shippingFee = subtotal > 150 ? 0 : 15;
      let discount = 0;
      const normalizedCode = discountCode?.toUpperCase();
      if (normalizedCode && DISCOUNT_CODES[normalizedCode]) {
        discount = Number(((subtotal * DISCOUNT_CODES[normalizedCode].percent) / 100).toFixed(2));
      }

      const totalAmount = Number((subtotal - discount + shippingFee).toFixed(2));

      // Execute Payment through PaymentProvider Abstraction
      const paymentProvider = getPaymentProvider();
      const tempOrderId = `SL-${Date.now().toString().slice(-6)}`;
      const intent = await paymentProvider.createPaymentIntent(tempOrderId, totalAmount);
      const verification = await paymentProvider.verifyAndCapture(intent.paymentId, paymentMethodToken);

      if (verification.status === 'FAILED') {
        throw new AppError(verification.errorMessage || 'Payment failed to process', 402);
      }

      const orderId = `ord-${uuidv4()}`;
      const orderNumber = `SL-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const now = new Date().toISOString();

      // Decrement inventory stock
      for (const item of cartRows) {
        await db.run(
          'UPDATE products SET stock_quantity = stock_quantity - ?, updated_at = ? WHERE id = ?',
          [item.quantity, now, item.product_id]
        );
      }

      // Insert Order
      await db.run(
        `INSERT INTO orders (
          id, order_number, user_id, status, shipping_address_json, subtotal, shipping_fee,
          discount, tax, total_amount, total_ewaste_diverted_kg, total_co2_saved_kg,
          payment_method, payment_status, payment_id, notes, created_at, updated_at
        ) VALUES (?, ?, ?, 'CONFIRMED', ?, ?, ?, ?, 0.0, ?, ?, ?, ?, 'CAPTURED', ?, ?, ?, ?)`,
        [
          orderId,
          orderNumber,
          req.user.id,
          JSON.stringify(shippingAddress),
          subtotal,
          shippingFee,
          discount,
          totalAmount,
          totalEWaste,
          totalCO2,
          paymentMethod,
          verification.transactionReference,
          notes || 'Placed via SecondLife Circular Checkout',
          now,
          now
        ]
      );

      // Insert Order Items
      for (const item of orderItems) {
        await db.run(
          `INSERT INTO order_items (id, order_id, product_id, product_title, product_image, unit_price, quantity, total_price, condition, rebuild_notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            item.id,
            orderId,
            item.productId,
            item.productTitle,
            item.productImage,
            item.unitPrice,
            item.quantity,
            item.totalPrice,
            item.condition,
            item.rebuildNotes
          ]
        );
      }

      // Clear Cart after successful checkout
      await db.run('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);

      await recordAuditLog({
        userId: req.user.id,
        userName: `${req.user.firstName} ${req.user.lastName}`,
        userRole: req.user.role,
        action: 'ORDER_PLACED',
        entityType: 'ORDER',
        entityId: orderId,
        details: {
          orderNumber,
          totalAmount,
          totalEWasteDivertedKg: totalEWaste,
          transactionRef: verification.transactionReference
        }
      });

      res.status(201).json({
        success: true,
        message: 'Order placed and confirmed successfully! Circular rebuild pipeline initiated.',
        data: {
          orderId,
          orderNumber,
          totalAmount,
          status: 'CONFIRMED',
          paymentStatus: 'CAPTURED',
          transactionReference: verification.transactionReference,
          eWasteDivertedKg: totalEWaste,
          co2SavedKg: totalCO2
        }
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getMyOrders(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const rows = await db.query<any>(
        'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
        [req.user.id]
      );

      const orderIds = rows.map(r => r.id);
      let itemsMap: Record<string, OrderItem[]> = {};

      if (orderIds.length > 0) {
        const placeholders = orderIds.map(() => '?').join(',');
        const itemRows = await db.query<any>(
          `SELECT * FROM order_items WHERE order_id IN (${placeholders})`,
          orderIds
        );
        for (const item of itemRows) {
          if (!itemsMap[item.order_id]) itemsMap[item.order_id] = [];
          itemsMap[item.order_id].push({
            id: item.id,
            orderId: item.order_id,
            productId: item.product_id,
            productTitle: item.product_title,
            productImage: item.product_image,
            unitPrice: item.unit_price,
            quantity: item.quantity,
            totalPrice: item.total_price,
            condition: item.condition,
            rebuildNotes: item.rebuild_notes
          });
        }
      }

      const orders: Order[] = rows.map((r) => ({
        id: r.id,
        orderNumber: r.order_number,
        userId: r.user_id,
        status: r.status as OrderStatus,
        items: itemsMap[r.id] || [],
        shippingAddress: JSON.parse(r.shipping_address_json || '{}'),
        subtotal: r.subtotal,
        shippingFee: r.shipping_fee,
        discount: r.discount,
        tax: r.tax,
        totalAmount: r.total_amount,
        totalEWasteDivertedKg: r.total_ewaste_diverted_kg,
        totalCO2SavedKg: r.total_co2_saved_kg,
        paymentMethod: r.payment_method,
        paymentStatus: r.payment_status as PaymentStatus,
        paymentId: r.payment_id,
        trackingNumber: r.tracking_number,
        carrier: r.carrier,
        notes: r.notes,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }));

      res.json({
        success: true,
        data: orders
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getOrderById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { idOrNumber } = req.params;
      const order = await db.get<any>(
        'SELECT * FROM orders WHERE id = ? OR order_number = ?',
        [idOrNumber, idOrNumber]
      );

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      // Check ownership or admin role
      if (order.user_id !== req.user.id && req.user.role === 'customer') {
        throw new AppError('Unauthorized to view this order', 403);
      }

      const itemRows = await db.query<any>(
        'SELECT * FROM order_items WHERE order_id = ?',
        [order.id]
      );

      const customer = await db.get<any>(
        'SELECT id, email, first_name, last_name, phone FROM users WHERE id = ?',
        [order.user_id]
      );

      const fullOrder: Order = {
        id: order.id,
        orderNumber: order.order_number,
        userId: order.user_id,
        user: customer ? {
          id: customer.id,
          email: customer.email,
          firstName: customer.first_name,
          lastName: customer.last_name,
          role: 'customer',
          phone: customer.phone,
          isEmailVerified: true,
          isActive: true,
          createdAt: '',
          updatedAt: ''
        } : undefined,
        status: order.status as OrderStatus,
        items: itemRows.map(i => ({
          id: i.id,
          orderId: i.order_id,
          productId: i.product_id,
          productTitle: i.product_title,
          productImage: i.product_image,
          unitPrice: i.unit_price,
          quantity: i.quantity,
          totalPrice: i.total_price,
          condition: i.condition,
          rebuildNotes: i.rebuild_notes
        })),
        shippingAddress: JSON.parse(order.shipping_address_json || '{}'),
        subtotal: order.subtotal,
        shippingFee: order.shipping_fee,
        discount: order.discount,
        tax: order.tax,
        totalAmount: order.total_amount,
        totalEWasteDivertedKg: order.total_ewaste_diverted_kg,
        totalCO2SavedKg: order.total_co2_saved_kg,
        paymentMethod: order.payment_method,
        paymentStatus: order.payment_status as PaymentStatus,
        paymentId: order.payment_id,
        trackingNumber: order.tracking_number,
        carrier: order.carrier,
        notes: order.notes,
        createdAt: order.created_at,
        updatedAt: order.updated_at
      };

      res.json({
        success: true,
        data: fullOrder
      });
    } catch (err) {
      next(err);
    }
  }

  public static async adminGetAllOrders(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, search } = req.query;
      const where: string[] = [];
      const params: any[] = [];

      if (status) {
        where.push('o.status = ?');
        params.push(status);
      }

      if (search) {
        where.push('(o.order_number LIKE ? OR u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)');
        const s = `%${search}%`;
        params.push(s, s, s, s);
      }

      const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

      const rows = await db.query<any>(
        `SELECT o.*, u.email as user_email, u.first_name as user_first_name, u.last_name as user_last_name
         FROM orders o
         JOIN users u ON o.user_id = u.id
         ${whereSql}
         ORDER BY o.created_at DESC`,
        params
      );

      const orders = rows.map((r) => ({
        id: r.id,
        orderNumber: r.order_number,
        userId: r.user_id,
        customerName: `${r.user_first_name} ${r.user_last_name}`,
        customerEmail: r.user_email,
        status: r.status as OrderStatus,
        totalAmount: r.total_amount,
        paymentStatus: r.payment_status as PaymentStatus,
        trackingNumber: r.tracking_number,
        carrier: r.carrier,
        createdAt: r.created_at
      }));

      res.json({
        success: true,
        data: orders
      });
    } catch (err) {
      next(err);
    }
  }

  public static async adminUpdateOrderStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, trackingNumber, carrier } = req.body;

      const order = await db.get<any>('SELECT * FROM orders WHERE id = ?', [id]);
      if (!order) {
        throw new AppError('Order not found', 404);
      }

      const now = new Date().toISOString();

      await db.run(
        `UPDATE orders SET
          status = COALESCE(?, status),
          tracking_number = COALESCE(?, tracking_number),
          carrier = COALESCE(?, carrier),
          updated_at = ?
         WHERE id = ?`,
        [status, trackingNumber, carrier, now, id]
      );

      if (req.user) {
        await recordAuditLog({
          userId: req.user.id,
          userName: `${req.user.firstName} ${req.user.lastName}`,
          userRole: req.user.role,
          action: 'ORDER_STATUS_UPDATED',
          entityType: 'ORDER',
          entityId: id,
          details: { oldStatus: order.status, newStatus: status || order.status, trackingNumber, carrier }
        });
      }

      res.json({
        success: true,
        message: 'Order status updated successfully'
      });
    } catch (err) {
      next(err);
    }
  }
}
