import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import usersRoutes from './routes/users.routes';
import ordersRoutes from './routes/orders.routes';
import marketplaceRoutes from './routes/marketplace.routes';
import adminRoutes from './routes/admin.routes';
import paymentsRoutes from './routes/payments.routes';
import reviewsRoutes from './routes/reviews.routes';
import chatRoutes from './routes/chat.routes';
import analyticsRoutes from './routes/analytics.routes';
import bonusesRoutes from './routes/bonuses.routes';
import healthRoutes from './routes/health.routes';
import prisma from './utils/prisma';
import { startBot, stopBot } from './bot';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  allowedHeaders: ['Content-Type', 'X-Telegram-Init-Data'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.use(express.json());

// Log all requests in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.use('/', healthRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/bonuses', bonusesRoutes);

// WebSocket for real-time driver tracking
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Driver sends location updates
  socket.on('driver:location', async (data: { driverId: string; latitude: number; longitude: number }) => {
    try {
      const { driverId, latitude, longitude } = data;

      // Update driver location in database
      await prisma.driverLocation.upsert({
        where: { driverId },
        update: { latitude, longitude },
        create: { driverId, latitude, longitude },
      });

      // Find active order for this driver
      const activeOrder = await prisma.order.findFirst({
        where: {
          driverId,
          status: 'В процессе',
        },
      });

      if (activeOrder) {
        // Broadcast location to the client who ordered
        io.to(`order:${activeOrder.id}`).emit('driver:location:update', {
          orderId: activeOrder.id,
          latitude,
          longitude,
        });
      }
    } catch (error) {
      console.error('Error updating driver location:', error);
    }
  });

  // Client subscribes to order updates
  socket.on('order:subscribe', (orderId: string) => {
    socket.join(`order:${orderId}`);
    console.log(`Client subscribed to order: ${orderId}`);
  });

  // Client unsubscribes from order updates
  socket.on('order:unsubscribe', (orderId: string) => {
    socket.leave(`order:${orderId}`);
    console.log(`Client unsubscribed from order: ${orderId}`);
  });

  // Chat: Join chat room
  socket.on('chat:join', (orderId: string) => {
    socket.join(`chat:${orderId}`);
    console.log(`Socket ${socket.id} joined chat: ${orderId}`);
  });

  // Chat: Leave chat room
  socket.on('chat:leave', (orderId: string) => {
    socket.leave(`chat:${orderId}`);
    console.log(`Socket ${socket.id} left chat: ${orderId}`);
  });

  // Chat: Send message
  socket.on('chat:send', async (data: { orderId: string; senderId: string; receiverId: string; content: string }) => {
    try {
      const { orderId, senderId, receiverId, content } = data;

      // Save message to database
      const message = await prisma.message.create({
        data: {
          orderId,
          senderId,
          receiverId,
          content,
        },
      });

      // Broadcast message to chat room
      io.to(`chat:${orderId}`).emit('chat:message', {
        id: message.id,
        orderId,
        senderId,
        receiverId,
        content,
        createdAt: message.createdAt,
        read: false,
      });

      console.log(`Message sent in order ${orderId} from ${senderId}`);
    } catch (error) {
      console.error('Error sending chat message:', error);
      socket.emit('chat:error', { message: 'Failed to send message' });
    }
  });

  // Chat: Mark messages as read
  socket.on('chat:mark-read', async (data: { orderId: string; userId: string }) => {
    try {
      const { orderId, userId } = data;

      await prisma.message.updateMany({
        where: {
          orderId,
          receiverId: userId,
          read: false,
        },
        data: { read: true },
      });

      // Notify other participants
      io.to(`chat:${orderId}`).emit('chat:messages-read', { orderId, userId });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 WebSocket server is running`);

  // Start Telegram bot
  try {
    startBot();
  } catch (error) {
    console.error('⚠️ Failed to start Telegram bot:', error);
    console.log('💡 The API will continue running without the bot');
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  stopBot();
  await prisma.$disconnect();
  httpServer.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('\n👋 Shutting down gracefully...');
  stopBot();
  await prisma.$disconnect();
  httpServer.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
