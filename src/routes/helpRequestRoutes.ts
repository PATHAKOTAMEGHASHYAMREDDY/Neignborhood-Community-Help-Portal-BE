import express from 'express';
import {
  createHelpRequest,
  getAllHelpRequests,
  getAvailableRequests,
  getMyRequests,
  acceptHelpRequest,
  startRequest,
  completeRequest,
  updateRequestStatus
} from '../controllers/helpRequestController';

import { authenticateToken, authorizeRole } from '../middleware/auth';
import { validateHelpRequest } from '../middleware/validation';

const router = express.Router();

/**
 * Create help request (Resident only)
 */
router.post(
  '/',
  authenticateToken,
  authorizeRole('Resident'),
  validateHelpRequest,
  createHelpRequest
);

/**
 * Get all help requests (Admin / Resident / Helper)
 */
router.get(
  '/',
  authenticateToken,
  getAllHelpRequests
);

/**
 * Get available requests (Helper only)
 */
router.get(
  '/available',
  authenticateToken,
  authorizeRole('Helper'),
  getAvailableRequests
);

/**
 * Get my requests (Resident or Helper)
 */
router.get(
  '/my-requests',
  authenticateToken,
  getMyRequests
);

/**
 * Helper accepts a request
 * Status: Pending → Accepted
 */
router.put(
  '/:id/accept',
  authenticateToken,
  authorizeRole('Helper'),
  acceptHelpRequest
);

/**
 * Helper starts working
 * Status: Accepted → In-progress
 */
router.put(
  '/:id/start',
  authenticateToken,
  authorizeRole('Helper'),
  startRequest
);

/**
 * Helper completes work
 * Status: In-progress → Completed
 */
router.put(
  '/:id/complete',
  authenticateToken,
  authorizeRole('Helper'),
  completeRequest
);

/**
 * Update request status (generic endpoint)
 * Used by helpers to update status
 */
router.put(
  '/:id/status',
  authenticateToken,
  updateRequestStatus
);

export default router;
