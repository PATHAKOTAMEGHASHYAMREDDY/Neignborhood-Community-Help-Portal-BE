import express from 'express';
import {
  approveHelpRequest,
  rejectHelpRequest,
  getPendingRequests
} from '../controllers/adminController';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = express.Router();

// Get all pending help requests (Admin only)
router.get(
  '/requests/pending',
  authenticateToken,
  authorizeRole('Admin'),
  getPendingRequests
);

// Approve help request (Admin only)
router.put(
  '/requests/:id/approve',
  authenticateToken,
  authorizeRole('Admin'),
  approveHelpRequest
);

// Reject help request (Admin only)
router.put(
  '/requests/:id/reject',
  authenticateToken,
  authorizeRole('Admin'),
  rejectHelpRequest
);

export default router;
