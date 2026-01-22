import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import * as usersController from '../controllers/users.controller';

const router = Router();

// All routes require authentication
router.use(authenticateUser);

router.get('/profile', usersController.getProfile);
router.put('/profile', usersController.updateProfile);
router.get('/balance', usersController.getBalance);
router.post('/register-driver', usersController.registerAsDriver);
router.post('/register-seller', usersController.registerAsSeller);

export default router;
