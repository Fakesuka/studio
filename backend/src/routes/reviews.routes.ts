import express from 'express';
import * as reviewsController from '../controllers/reviews.controller';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

router.post('/', reviewsController.createReview);
router.get('/user/:userId', reviewsController.getUserReviews);
router.get('/my-reviews', reviewsController.getMyReviews);
router.get('/can-review/:orderId', reviewsController.canReviewOrder);

export default router;
