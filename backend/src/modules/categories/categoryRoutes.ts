import { Router } from 'express';
import { CategoryController } from './categoryController.js';
import { authenticate, requireRole } from '../../middleware/auth.js';

const router = Router();

router.get('/', CategoryController.getAll);
router.get('/:slug', CategoryController.getBySlug);
router.post('/', authenticate, requireRole(['admin', 'super_admin']), CategoryController.create);

export default router;
