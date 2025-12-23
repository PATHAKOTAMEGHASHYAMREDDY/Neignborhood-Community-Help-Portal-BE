import express from 'express';
import { submitReport, getMyReports, getAllReports, updateReportStatus, getReportStats } from '../controllers/reportController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Submit a report (Resident or Helper)
router.post('/', submitReport);

// Get my submitted reports
router.get('/my-reports', getMyReports);

// Get all reports (Admin only)
router.get('/all', getAllReports);

// Get report statistics (Admin only)
router.get('/stats', getReportStats);

// Update report status (Admin only)
router.put('/:reportId/status', updateReportStatus);

export default router;
