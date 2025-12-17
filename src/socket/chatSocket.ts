import { Server, Socket } from 'socket.io';
import pool from '../config/database';

interface ChatMessage {
  requestId: number;
  senderId: number;
  senderRole: 'Resident' | 'Helper';
  messageText: string;
  timestamp: Date;
}

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a chat room for a specific request
    socket.on('joinRoom', async (data: { requestId: number; userId: number }) => {
      const { requestId, userId } = data;
      
      try {
        // Verify user is part of this request
        const [requests] = await pool.query(
          'SELECT * FROM help_requests WHERE id = ? AND (resident_id = ? OR helper_id = ?)',
          [requestId, userId, userId]
        );

        if (Array.isArray(requests) && requests.length > 0) {
          const roomName = `request_${requestId}`;
          socket.join(roomName);
          console.log(`User ${userId} joined room: ${roomName}`);
          
          socket.emit('joinedRoom', { 
            success: true, 
            message: 'Successfully joined chat room',
            requestId 
          });
        } else {
          socket.emit('joinedRoom', { 
            success: false, 
            message: 'Not authorized to join this chat' 
          });
        }
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('joinedRoom', { 
          success: false, 
          message: 'Error joining chat room' 
        });
      }
    });

    // Handle sending messages
    socket.on('sendMessage', async (data: ChatMessage) => {
      const { requestId, senderId, senderRole, messageText } = data;

      try {
        // Save message to database
        const [result] = await pool.query(
          'INSERT INTO chat_messages (request_id, sender_id, sender_role, message_text) VALUES (?, ?, ?, ?)',
          [requestId, senderId, senderRole, messageText]
        );

        const insertResult = result as any;
        const messageId = insertResult.insertId;

        // Get the saved message with timestamp
        const [messages] = await pool.query(
          'SELECT * FROM chat_messages WHERE id = ?',
          [messageId]
        );

        if (Array.isArray(messages) && messages.length > 0) {
          const savedMessage = messages[0] as any;
          
          // Broadcast to room
          const roomName = `request_${requestId}`;
          io.to(roomName).emit('receiveMessage', {
            id: savedMessage.id,
            requestId: savedMessage.request_id,
            senderId: savedMessage.sender_id,
            senderRole: savedMessage.sender_role,
            messageText: savedMessage.message_text,
            timestamp: savedMessage.created_at
          });
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('messageError', { 
          message: 'Failed to send message' 
        });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data: { requestId: number; userId: number; isTyping: boolean }) => {
      const roomName = `request_${data.requestId}`;
      socket.to(roomName).emit('userTyping', {
        userId: data.userId,
        isTyping: data.isTyping
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
