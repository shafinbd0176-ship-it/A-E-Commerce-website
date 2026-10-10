import { Router } from 'express';
import { ReviewController } from './reviewController.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.get('/products/:productId', ReviewController.getProductReviews);
router.post('/products/:productId', authenticate, ReviewController.addReview);

export default router;
