import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import * as ordersController from '../controllers/orders.controller';

const router = Router();

// All routes require authentication
router.use(authenticateUser);

router.post('/', ordersController.createOrder);
router.get('/my-orders', ordersController.getMyOrders);
router.get('/available', ordersController.getAvailableOrders);
router.get('/driver-orders', ordersController.getDriverOrders);
router.post('/:id/accept', ordersController.acceptOrder);
router.post('/:id/complete', ordersController.completeOrder);
router.post('/:id/cancel', ordersController.cancelOrder);

export default router;
