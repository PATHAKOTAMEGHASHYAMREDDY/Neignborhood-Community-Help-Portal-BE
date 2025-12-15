import express from 'express';
import {
  createHelpRequest,
  getAllHelpRequests,
  getAvailableRequests,
  getMyRequests,
  acceptHelpRequest,
  updateRequestStatus
} from '../controllers/helpRequestController';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { validateHelpRequest } from '../middleware/validation';

const router = express.Router();

// Create help request (Resident only)
router.post(
  '/',
  authenticateToken,
  authorizeRole('Resident'),
  validateHelpRequest,
  createHelpRequest
);

// Get all help requests (Admin or authenticated users)
router.get('/', authenticateToken, getAllHelpRequests);

// Get available requests (Helper)
router.get('/available', authenticateToken, authorizeRole('Helper'), getAvailableRequests);

// Get my requests (Resident or Helper)
router.get('/my-requests', authenticateToken, getMyRequests);

// Accept help request (Helper only)
router.put('/:id/accept', authenticateToken, authorizeRole('Helper'), acceptHelpRequest);

// Update request status
router.put('/:id/status', authenticateToken, updateRequestStatus);

export default router;
