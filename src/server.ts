import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database';
import authRoutes from './routes/authRoutes';
import helpRequestRoutes from './routes/helpRequestRoutes';
import adminRoutes from './routes/adminRoutes';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/admin', adminRoutes);


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/help-requests', helpRequestRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('⚠️  Server starting without database connection');
      console.error('⚠️  Please check your database configuration in .env file');
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
      
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
