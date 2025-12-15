import { Response } from 'express';
import pool from '../config/database';
import { HelpRequest } from '../types';
import { AuthenticatedRequest } from '../middleware/auth';

export const createHelpRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, category, attachments } = req.body;
    const resident_id = req.user?.id;

    if (!resident_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [result] = await pool.query(
      'INSERT INTO help_requests (resident_id, title, description, category, attachments, status) VALUES (?, ?, ?, ?, ?, ?)',
      [resident_id, title, description, category, attachments || null, 'Pending']
    );

    const insertResult = result as any;

    res.status(201).json({
      message: 'Help request created successfully',
      requestId: insertResult.insertId
    });
  } catch (error) {
    console.error('Create help request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllHelpRequests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [requests] = await pool.query(`
      SELECT hr.*, u.name as resident_name, u.location as resident_location
      FROM help_requests hr
      JOIN users u ON hr.resident_id = u.id
      ORDER BY hr.created_at DESC
    `);

    res.json({ requests });
  } catch (error) {
    console.error('Get help requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAvailableRequests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [requests] = await pool.query(`
      SELECT hr.*, u.name as resident_name, u.location as resident_location
      FROM help_requests hr
      JOIN users u ON hr.resident_id = u.id
      WHERE hr.status = 'Pending'
      ORDER BY hr.created_at DESC
    `);

    res.json({ requests });
  } catch (error) {
    console.error('Get available requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyRequests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    let query = '';
    if (userRole === 'Resident') {
      query = `
        SELECT hr.*, h.name as helper_name
        FROM help_requests hr
        LEFT JOIN users h ON hr.helper_id = h.id
        WHERE hr.resident_id = ?
        ORDER BY hr.created_at DESC
      `;
    } else {
      query = `
        SELECT hr.*, u.name as resident_name, u.location as resident_location
        FROM help_requests hr
        JOIN users u ON hr.resident_id = u.id
        WHERE hr.helper_id = ?
        ORDER BY hr.created_at DESC
      `;
    }

    const [requests] = await pool.query(query, [userId]);

    res.json({ requests });
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const acceptHelpRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const helper_id = req.user?.id;

    // Check if request exists and is pending
    const [requests] = await pool.query(
      'SELECT * FROM help_requests WHERE id = ? AND status = ?',
      [id, 'Pending']
    );

    if (!Array.isArray(requests) || requests.length === 0) {
      return res.status(404).json({ error: 'Request not found or already accepted' });
    }

    // Update request
    await pool.query(
      'UPDATE help_requests SET helper_id = ?, status = ? WHERE id = ?',
      [helper_id, 'Accepted', id]
    );

    res.json({ message: 'Help request accepted successfully' });
  } catch (error) {
    console.error('Accept help request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateRequestStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    const validStatuses = ['Pending', 'Accepted', 'In-progress', 'Completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if user is authorized to update this request
    const [requests] = await pool.query(
      'SELECT * FROM help_requests WHERE id = ? AND (resident_id = ? OR helper_id = ?)',
      [id, userId, userId]
    );

    if (!Array.isArray(requests) || requests.length === 0) {
      return res.status(403).json({ error: 'Not authorized to update this request' });
    }

    await pool.query(
      'UPDATE help_requests SET status = ? WHERE id = ?',
      [status, id]
    );

    res.json({ message: 'Request status updated successfully' });
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
