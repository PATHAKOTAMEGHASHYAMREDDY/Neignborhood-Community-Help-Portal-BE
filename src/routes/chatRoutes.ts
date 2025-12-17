import express from 'express';
import { getChatMessages, getChatInfo } from '../controllers/chatController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get chat info (request details and participants)
router.get('/:requestId/info', authenticateToken, getChatInfo);

// Get chat messages for a request
router.get('/:requestId/messages', authenticateToken, getChatMessages);

export default router;
