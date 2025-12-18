import { Response } from 'express';
import pool from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * Get all pending help requests (Admin only)
 */
export const getPendingRequests = async (
  _req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const [requests] = await pool.query(`
      SELECT 
        hr.*, 
        u.name AS resident_name, 
        u.location AS resident_location
      FROM help_requests hr
      JOIN users u ON hr.resident_id = u.id
      WHERE hr.status = 'Pending'
      ORDER BY hr.created_at DESC
    `);

    res.json({ requests });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Approve help request (Admin only)
 * Status change: Pending → Accepted
 */
export const approveHelpRequest = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'UPDATE help_requests SET status = ? WHERE id = ? AND status = ?',
      ['Accepted', id, 'Pending']
    );

    const updateResult = result as any;

    if (updateResult.affectedRows === 0) {
      return res.status(400).json({
        error: 'Request not found or already processed'
      });
    }

    res.json({ message: 'Help request accepted successfully' });
  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Reject help request (Admin only)
 * Status change: Pending → Rejected
 */
export const rejectHelpRequest = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'UPDATE help_requests SET status = ? WHERE id = ? AND status = ?',
      ['Rejected', id, 'Pending']
    );

    const updateResult = result as any;

    if (updateResult.affectedRows === 0) {
      return res.status(400).json({
        error: 'Request not found or already processed'
      });
    }

    res.json({ message: 'Help request rejected successfully' });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
