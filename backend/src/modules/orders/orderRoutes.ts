import { Router } from 'express';
import { OrderController } from './orderController.js';
import { authenticate, requireRole } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/checkout', OrderController.checkout);
router.get('/my-orders', OrderController.getMyOrders);
router.get('/:idOrNumber', OrderController.getOrderById);

// Admin Order Management
router.get('/admin/all', requireRole(['admin', 'super_admin']), OrderController.adminGetAllOrders);
router.put('/admin/:id/status', requireRole(['admin', 'super_admin']), OrderController.adminUpdateOrderStatus);

export default router;
