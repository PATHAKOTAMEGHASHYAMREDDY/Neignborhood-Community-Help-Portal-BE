import { Response } from 'express';
import pool from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth';

export const getChatMessages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { requestId } = req.params;
    const userId = req.user?.id;

    // Verify user is part of this request
    const [requests] = await pool.query(
      'SELECT * FROM help_requests WHERE id = ? AND (resident_id = ? OR helper_id = ?)',
      [requestId, userId, userId]
    );

    if (!Array.isArray(requests) || requests.length === 0) {
      return res.status(403).json({ error: 'Not authorized to view this chat' });
    }

    // Get all messages for this request
    const [messages] = await pool.query(
      `SELECT cm.*, u.name as sender_name 
       FROM chat_messages cm
       JOIN users u ON cm.sender_id = u.id
       WHERE cm.request_id = ?
       ORDER BY cm.created_at ASC`,
      [requestId]
    );

    // Format messages to match frontend interface
    const formattedMessages = Array.isArray(messages) ? messages.map((msg: any) => ({
      id: msg.id,
      requestId: msg.request_id,
      senderId: msg.sender_id,
      senderRole: msg.sender_role,
      messageText: msg.message_text,
      timestamp: new Date(msg.created_at).toISOString(),
      senderName: msg.sender_name
    })) : [];

    res.json({ messages: formattedMessages });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getChatInfo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { requestId } = req.params;
    const userId = req.user?.id;

    // Get request details with participant info
    const [requests] = await pool.query(
      `SELECT hr.*, 
              r.name as resident_name, r.id as resident_id,
              h.name as helper_name, h.id as helper_id
       FROM help_requests hr
       JOIN users r ON hr.resident_id = r.id
       LEFT JOIN users h ON hr.helper_id = h.id
       WHERE hr.id = ? AND (hr.resident_id = ? OR hr.helper_id = ?)`,
      [requestId, userId, userId]
    );

    if (!Array.isArray(requests) || requests.length === 0) {
      return res.status(403).json({ error: 'Not authorized to view this chat' });
    }

    const request = requests[0] as any;

    // Check if chat is allowed - must have a helper assigned (not just Pending)
    if (!request.helper_id) {
      return res.status(400).json({ 
        error: 'Chat is only available after a helper accepts the request' 
      });
    }

    res.json({ 
      request: {
        id: request.id,
        title: request.title,
        category: request.category,
        status: request.status,
        residentId: request.resident_id,
        residentName: request.resident_name,
        helperId: request.helper_id,
        helperName: request.helper_name
      }
    });
  } catch (error) {
    console.error('Get chat info error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
