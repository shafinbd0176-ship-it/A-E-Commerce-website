import { Router } from 'express';
import { ProductController } from './productController.js';
import { authenticate, requireRole } from '../../middleware/auth.js';

const router = Router();

router.get('/', ProductController.getAll);
router.get('/:slugOrId', ProductController.getBySlug);
router.post('/', authenticate, requireRole(['admin', 'super_admin']), ProductController.create);
router.put('/:id', authenticate, requireRole(['admin', 'super_admin']), ProductController.update);
router.delete('/:id', authenticate, requireRole(['admin', 'super_admin']), ProductController.deleteOrArchive);

export default router;
