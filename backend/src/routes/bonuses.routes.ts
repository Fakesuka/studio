import express from 'express';
import * as bonusesController from '../controllers/bonuses.controller';
import { authenticateUser } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';

const router = express.Router();

// Public routes (with auth)
router.use(authenticateUser);

router.post('/apply-promocode', bonusesController.applyPromocode);
router.post('/confirm-promocode-usage', bonusesController.confirmPromocodeUsage);
router.get('/referral-link', bonusesController.getReferralLink);
router.post('/register-referral', bonusesController.registerReferral);

// Admin only routes
router.post('/promocodes', requireAdmin, bonusesController.createPromocode);
router.get('/promocodes', requireAdmin, bonusesController.getAllPromocodes);

export default router;
