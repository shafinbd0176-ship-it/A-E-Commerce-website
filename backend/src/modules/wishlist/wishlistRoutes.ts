import { Router } from 'express';
import { WishlistController } from './wishlistController.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', WishlistController.getWishlist);
router.post('/toggle', WishlistController.toggle);

export default router;
