import express from 'express';
import * as aiController from '../controllers/ai.controller';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();

// Public AI diagnosis (with optional auth)
router.post('/diagnose', aiController.diagnoseProblem);

// AI status check (for debugging)
router.get('/status', aiController.getAIStatus);

export default router;
