import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import * as adminController from '../controllers/admin.controller';

const router = Router();

// All routes require authentication and admin privileges
router.use(authenticateUser);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);

// Users
router.get('/users', adminController.getUsers);
router.get('/users/find/:username', adminController.findUserByUsername);
router.post('/users/:userId/make-admin', adminController.makeAdmin);
router.post('/users/:userId/remove-admin', adminController.removeAdmin);
router.post('/users/:oderId/add-balance', adminController.addBalance);

// Driver verification
router.get('/drivers/pending', adminController.getPendingDrivers);
router.post('/drivers/:id/verify', adminController.verifyDriver);
router.post('/drivers/:id/unverify', adminController.unverifyDriver);

// Seller verification
router.get('/sellers/pending', adminController.getPendingSellers);
router.post('/sellers/:id/verify', adminController.verifySeller);
router.post('/sellers/:id/unverify', adminController.unverifySeller);

// Product approval
router.get('/products/pending', adminController.getPendingProducts);
router.post('/products/:id/approve', adminController.approveProduct);
router.post('/products/:id/unapprove', adminController.unapproveProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Orders
router.get('/orders', adminController.getAllOrders);

export default router;
