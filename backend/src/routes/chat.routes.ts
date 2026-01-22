import express from 'express';
import * as chatController from '../controllers/chat.controller';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

router.get('/conversations', chatController.getConversations);
router.get('/unread-count', chatController.getUnreadCount);
router.get('/:orderId/messages', chatController.getMessages);
router.post('/:orderId/send', chatController.sendMessage);

export default router;
