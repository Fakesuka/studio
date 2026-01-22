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
import prisma from './utils/prisma';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
}));
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'YakGo API is running' });
});

app.use('/api/users', usersRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/reviews', reviewsRoutes);

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
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await prisma.$disconnect();
  httpServer.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
