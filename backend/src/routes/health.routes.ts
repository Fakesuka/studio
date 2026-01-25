import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';

const router = Router();

// Basic health check
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    // Check environment variables
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      TELEGRAM_BOT_TOKEN: !!process.env.TELEGRAM_BOT_TOKEN,
      FRONTEND_URL: !!process.env.FRONTEND_URL,
      PORT: process.env.PORT,
      NODE_ENV: process.env.NODE_ENV,
    };

    // Count users
    const userCount = await prisma.user.count();

    res.json({
      status: 'ok',
      message: 'YakGo API is running',
      timestamp: new Date().toISOString(),
      database: 'connected',
      userCount,
      environment: envCheck,
      version: '1.0.0',
    });
  } catch (error) {
    console.error('[Health] Health check failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Detailed health check (admin only in production)
router.get('/health/detailed', async (req: Request, res: Response) => {
  try {
    // Database checks
    const dbChecks = {
      connection: false,
      users: 0,
      drivers: 0,
      sellers: 0,
      orders: 0,
    };

    try {
      await prisma.$queryRaw`SELECT 1`;
      dbChecks.connection = true;
      dbChecks.users = await prisma.user.count();
      dbChecks.drivers = await prisma.driverProfile.count();
      dbChecks.sellers = await prisma.sellerProfile.count();
      dbChecks.orders = await prisma.order.count();
    } catch (error) {
      console.error('[Health] Database check failed:', error);
    }

    // Environment checks
    const envVars = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      TELEGRAM_BOT_TOKEN: !!process.env.TELEGRAM_BOT_TOKEN,
      FRONTEND_URL: process.env.FRONTEND_URL || 'not set',
      PORT: process.env.PORT || '3001',
      NODE_ENV: process.env.NODE_ENV || 'development',
    };

    res.json({
      status: dbChecks.connection ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      database: dbChecks,
      environment: envVars,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  } catch (error) {
    console.error('[Health] Detailed health check failed:', error);
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
