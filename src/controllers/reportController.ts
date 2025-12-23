import { Response } from 'express';
import pool from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * SUBMIT A REPORT
 */
export const submitReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reporter_id = req.user?.id;
    const { reported_user_id, request_id, issue_type, description } = req.body;

    if (!reporter_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate inputs
    if (!reported_user_id || !issue_type || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Insert report
    await pool.query(
      `INSERT INTO user_reports (reporter_id, reported_user_id, request_id, issue_type, description, status) 
       VALUES (?, ?, ?, ?, ?, 'Pending')`,
      [reporter_id, reported_user_id, request_id || null, issue_type, description]
    );

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Admin will review it soon.'
    });
  } catch (error) {
    console.error('Submit report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET MY REPORTS (for users)
 */
export const getMyReports = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const [reports] = await pool.query(
      `SELECT r.*, 
              u.name as reported_user_name,
              u.role as reported_user_role
       FROM user_reports r
       JOIN users u ON r.reported_user_id = u.id
       WHERE r.reporter_id = ?
       ORDER BY r.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      reports: reports
    });
  } catch (error) {
    console.error('Get my reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET ALL REPORTS (Admin only)
 */
export const getAllReports = async (req: any, res: Response) => {
  try {
    const [reports] = await pool.query(
      `SELECT r.*, 
              reporter.name as reporter_name,
              reporter.role as reporter_role,
              reported.name as reported_user_name,
              reported.role as reported_user_role
       FROM user_reports r
       JOIN users reporter ON r.reporter_id = reporter.id
       JOIN users reported ON r.reported_user_id = reported.id
       ORDER BY r.created_at DESC`
    );

    res.json({
      success: true,
      reports: reports
    });
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * UPDATE REPORT STATUS (Admin only)
 */
export const updateReportStatus = async (req: any, res: Response) => {
  try {
    const { reportId } = req.params;
    const { status, admin_notes } = req.body;

    const validStatuses = ['Pending', 'Under Review', 'Resolved', 'Dismissed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await pool.query(
      'UPDATE user_reports SET status = ?, admin_notes = ? WHERE id = ?',
      [status, admin_notes || null, reportId]
    );

    res.json({
      success: true,
      message: 'Report status updated successfully'
    });
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET REPORT STATISTICS (Admin)
 */
export const getReportStats = async (req: any, res: Response) => {
  try {
    const [stats] = await pool.query(
      `SELECT 
        COUNT(*) as total_reports,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'Under Review' THEN 1 ELSE 0 END) as under_review,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN status = 'Dismissed' THEN 1 ELSE 0 END) as dismissed
       FROM user_reports`
    );

    res.json({
      success: true,
      stats: Array.isArray(stats) && stats.length > 0 ? stats[0] : {
        total_reports: 0,
        pending: 0,
        under_review: 0,
        resolved: 0,
        dismissed: 0
      }
    });
  } catch (error) {
    console.error('Get report stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
