import { Router } from 'express';
import { SupportController } from './supportController.js';
import { authenticate, requireRole } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/', SupportController.createTicket);
router.get('/my-tickets', SupportController.getMyTickets);
router.post('/:ticketId/messages', SupportController.addMessage);

// Admin Routes
router.get('/admin/all', requireRole(['admin', 'super_admin']), SupportController.adminGetAllTickets);
router.put('/admin/:ticketId/status', requireRole(['admin', 'super_admin']), SupportController.adminUpdateTicketStatus);

export default router;
