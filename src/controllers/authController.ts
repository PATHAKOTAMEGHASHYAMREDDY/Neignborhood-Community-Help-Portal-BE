import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { User, AuthRequest } from '../types';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, contact_info, location, password, role }: User = req.body;

    // Check if user already exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE contact_info = ?',
      [contact_info]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return res.status(400).json({ error: 'User with this contact info already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (name, contact_info, location, password, role) VALUES (?, ?, ?, ?, ?)',
      [name, contact_info, location, hashedPassword, role]
    );

    const insertResult = result as any;
    const userId = insertResult.insertId;

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, role },
      process.env.JWT_SECRET || 'secret'
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        name,
        contact_info,
        location,
        role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { contact_info, password, role }: AuthRequest = req.body;

    // Find user
    const [users] = await pool.query(
      'SELECT * FROM users WHERE contact_info = ?',
      [contact_info]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0] as User;

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify role
    if (user.role !== role) {
      return res.status(403).json({ error: 'Selected role does not match your registered role' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret'
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        contact_info: user.contact_info,
        location: user.location,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, contact_info, location } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if new contact_info is already taken by another user
    if (contact_info) {
      const [existingUsers] = await pool.query(
        'SELECT * FROM users WHERE contact_info = ? AND id != ?',
        [contact_info, userId]
      );

      if (Array.isArray(existingUsers) && existingUsers.length > 0) {
        return res.status(400).json({ error: 'Contact info already in use by another user' });
      }
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (contact_info) {
      updates.push('contact_info = ?');
      values.push(contact_info);
    }
    if (location) {
      updates.push('location = ?');
      values.push(location);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(userId);

    // Update user
    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Get updated user
    const [users] = await pool.query(
      'SELECT id, name, contact_info, location, role FROM users WHERE id = ?',
      [userId]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = users[0] as any;

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        contact_info: updatedUser.contact_info,
        location: updatedUser.location,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
