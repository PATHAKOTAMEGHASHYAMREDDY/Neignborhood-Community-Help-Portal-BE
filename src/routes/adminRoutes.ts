import express from 'express';
import { getAllUsers, getUserStats, getRequestStats, getAnalytics, blockUser, unblockUser } from '../controllers/adminController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All admin routes require authentication
router.use(authenticateToken);

// Get all users
router.get('/users', getAllUsers);

// Get user statistics
router.get('/stats/users', getUserStats);

// Get request statistics
router.get('/stats/requests', getRequestStats);

// Get analytics data
router.get('/analytics', getAnalytics);

// Block user
router.put('/users/:userId/block', blockUser);

// Unblock user
router.put('/users/:userId/unblock', unblockUser);

export default router;
