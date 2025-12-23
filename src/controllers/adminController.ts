import { Response } from 'express';
import pool from '../config/database';

/**
 * GET ALL USERS (Residents and Helpers)
 */
export const getAllUsers = async (req: any, res: Response) => {
  try {
    const [users] = await pool.query(
      `SELECT id, name, contact_info, location, role, is_blocked, created_at 
       FROM users 
       WHERE role IN ('Resident', 'Helper')
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET USER STATISTICS
 */
export const getUserStats = async (req: any, res: Response) => {
  try {
    const [stats] = await pool.query(
      `SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'Resident' THEN 1 ELSE 0 END) as total_residents,
        SUM(CASE WHEN role = 'Helper' THEN 1 ELSE 0 END) as total_helpers
       FROM users 
       WHERE role IN ('Resident', 'Helper')`
    );

    res.json({
      success: true,
      stats: Array.isArray(stats) && stats.length > 0 ? stats[0] : {
        total_users: 0,
        total_residents: 0,
        total_helpers: 0
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET REQUEST STATISTICS
 */
export const getRequestStats = async (req: any, res: Response) => {
  try {
    const [stats] = await pool.query(
      `SELECT 
        COUNT(*) as total_requests,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'Accepted' THEN 1 ELSE 0 END) as accepted,
        SUM(CASE WHEN status = 'In-progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed
       FROM help_requests`
    );

    res.json({
      success: true,
      stats: Array.isArray(stats) && stats.length > 0 ? stats[0] : {
        total_requests: 0,
        pending: 0,
        accepted: 0,
        in_progress: 0,
        completed: 0
      }
    });
  } catch (error) {
    console.error('Get request stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET ANALYTICS DATA
 */
export const getAnalytics = async (req: any, res: Response) => {
  try {
    // Category distribution
    const [categoryStats] = await pool.query(
      `SELECT category, COUNT(*) as count 
       FROM help_requests 
       GROUP BY category 
       ORDER BY count DESC`
    );

    // Requests per day (last 7 days)
    const [dailyStats] = await pool.query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
       FROM help_requests
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );

    // Helper performance
    const [helperStats] = await pool.query(
      `SELECT 
        u.name as helper_name,
        COUNT(hr.id) as total_tasks,
        SUM(CASE WHEN hr.status = 'Completed' THEN 1 ELSE 0 END) as completed_tasks
       FROM users u
       LEFT JOIN help_requests hr ON u.id = hr.helper_id
       WHERE u.role = 'Helper'
       GROUP BY u.id, u.name
       HAVING total_tasks > 0
       ORDER BY completed_tasks DESC
       LIMIT 10`
    );

    res.json({
      success: true,
      analytics: {
        categoryDistribution: categoryStats,
        dailyRequests: dailyStats,
        topHelpers: helperStats
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * BLOCK USER
 */
export const blockUser = async (req: any, res: Response) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const [users] = await pool.query(
      'SELECT * FROM users WHERE id = ? AND role IN ("Resident", "Helper")',
      [userId]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Block user
    await pool.query(
      'UPDATE users SET is_blocked = TRUE WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'User blocked successfully'
    });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * UNBLOCK USER
 */
export const unblockUser = async (req: any, res: Response) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const [users] = await pool.query(
      'SELECT * FROM users WHERE id = ? AND role IN ("Resident", "Helper")',
      [userId]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Unblock user
    await pool.query(
      'UPDATE users SET is_blocked = FALSE WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'User unblocked successfully'
    });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
