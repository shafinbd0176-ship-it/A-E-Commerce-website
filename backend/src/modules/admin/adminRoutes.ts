import { Router } from 'express';
import { AdminController } from './adminController.js';
import { authenticate, requireRole } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.use(requireRole(['admin', 'super_admin']));

router.get('/health', AdminController.getSystemHealth);
router.get('/customers', AdminController.getCustomers);
router.put('/customers/:customerId/status', AdminController.toggleCustomerStatus);
router.get('/audit-logs', AdminController.getAuditLogs);
router.get('/low-stock', AdminController.getLowStockAlerts);

export default router;
