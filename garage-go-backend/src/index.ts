import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { Database } from '@/utils/database';
import { Redis } from '@/utils/redis';
import { Logger } from '@/utils/logger';
import { SocketService } from '@/services/socketService';
import { errorHandler } from '@/middleware/errorHandler';
import { rateLimiter } from '@/middleware/rateLimiter';
import { authRoutes } from '@/routes/auth';
import { userRoutes } from '@/routes/users';
import { garageRoutes } from '@/routes/garages';
import { bookingRoutes } from '@/routes/bookings';
import { vehicleRoutes } from '@/routes/vehicles';
import { serviceRoutes } from '@/routes/services';
import { inventoryRoutes } from '@/routes/inventory';
import { maintenanceRoutes } from '@/routes/maintenance';
import { notificationRoutes } from '@/routes/notifications';
import { reportRoutes } from '@/routes/reports';
import { additionalServiceRoutes } from '@/routes/additionalServices';
import { mechanicSpecializationRoutes } from '@/routes/mechanicSpecializations';
import { timeLogRoutes } from '@/routes/timeLogs';

// Load environment variables
dotenv.config();

// Initialize services
const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST'],
  },
});

// Initialize Socket.IO service
SocketService.getInstance(io);

// Middleware
app.use(helmet());
const corsOrigin = process.env.CORS_ORIGIN;
app.use(cors({
  origin: corsOrigin === '*' ? true : (corsOrigin?.split(',') || ['http://localhost:3000']),
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(rateLimiter);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const [dbHealth, redisHealth] = await Promise.all([
      Database.healthCheck(),
      Redis.healthCheck(),
    ]);

    const health = {
      status: dbHealth ? 'OK' : 'ERROR',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: dbHealth ? 'OK' : 'ERROR',
        redis: redisHealth ? 'OK' : 'OPTIONAL_UNAVAILABLE',
        socket: 'OK',
      },
    };

    res.status(health.status === 'OK' ? 200 : 503).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      error: 'Health check failed',
    });
  }
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/garages', garageRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/vehicles', vehicleRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/maintenance', maintenanceRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/additional-services', additionalServiceRoutes);
app.use('/api/v1/mechanic-specializations', mechanicSpecializationRoutes);
app.use('/api/v1/time-logs', timeLogRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
  });
});

// Initialize database and Redis connections
async function initializeServices() {
  try {
    await Database.connect();
    await Redis.connect();
    Logger.info('All services initialized successfully');
  } catch (error) {
    Logger.error('Failed to initialize services', error);
    process.exit(1);
  }
}

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Start server
async function startServer() {
  await initializeServices();
  
  server.listen(Number(PORT), HOST, () => {
    Logger.info(`🚀 Server running on http://${HOST}:${PORT}`);
    Logger.info(`📚 API Base URL: http://localhost:${PORT}/api/v1`);
    Logger.info(`🔌 Socket.IO server ready`);
    Logger.info(`🌐 Network Access: http://0.0.0.0:${PORT}`);
    Logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  Logger.info('SIGTERM received, shutting down gracefully');
  
  try {
    await Database.disconnect();
    await Redis.disconnect();
    process.exit(0);
  } catch (error) {
    Logger.error('Error during shutdown', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  Logger.info('SIGINT received, shutting down gracefully');
  
  try {
    await Database.disconnect();
    await Redis.disconnect();
    process.exit(0);
  } catch (error) {
    Logger.error('Error during shutdown', error);
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  Logger.error('Uncaught Exception', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  Logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

// Start the server
startServer();

export { app, io };
