import express from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

router.get('/driver', analyticsController.getDriverAnalytics);
router.get('/seller', analyticsController.getSellerAnalytics);
router.get('/top-drivers', analyticsController.getTopDrivers);

export default router;
