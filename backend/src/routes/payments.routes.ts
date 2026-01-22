import express from 'express';
import * as paymentsController from '../controllers/payments.controller';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();

// Protected routes (require authentication)
router.post('/create', authenticateUser, paymentsController.createTopUpPayment);
router.get('/:paymentId/status', authenticateUser, paymentsController.checkPaymentStatus);
router.get('/transactions', authenticateUser, paymentsController.getTransactions);
router.post('/withdraw', authenticateUser, paymentsController.requestWithdrawal);

// Webhook (no authentication needed - verified by YooKassa signature)
router.post('/webhook/yookassa', paymentsController.handleYooKassaWebhook);

export default router;
