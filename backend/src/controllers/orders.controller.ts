import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { generateOrderId } from '../utils/telegram';

// Create new service order
export async function createOrder(req: AuthRequest, res: Response) {
  try {
    const { service, location, latitude, longitude, description, photo, price } = req.body;

    if (!service || !location || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const orderId = generateOrderId('SAHA');

    const order = await prisma.order.create({
      data: {
        orderId,
        userId: req.user!.id,
        service,
        location,
        latitude,
        longitude,
        description: description || '',
        photo,
        price,
        status: 'Ищет исполнителя',
      },
    });

    return res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ error: 'Failed to create order' });
  }
}

// Get all orders for current user
export async function getMyOrders(req: AuthRequest, res: Response) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: {
        driver: {
          include: {
            driverProfile: true,
          },
        },
      },
    });

    return res.json(orders);
  } catch (error) {
    console.error('Error getting orders:', error);
    return res.status(500).json({ error: 'Failed to get orders' });
  }
}

// Get available orders for drivers
export async function getAvailableOrders(req: AuthRequest, res: Response) {
  try {
    // Check if user is a driver
    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!driverProfile) {
      return res.status(403).json({ error: 'Not registered as driver' });
    }

    const orders = await prisma.order.findMany({
      where: {
        status: 'Ищет исполнителя',
        service: { in: driverProfile.services },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return res.json(orders);
  } catch (error) {
    console.error('Error getting available orders:', error);
    return res.status(500).json({ error: 'Failed to get available orders' });
  }
}

// Get driver's orders
export async function getDriverOrders(req: AuthRequest, res: Response) {
  try {
    const orders = await prisma.order.findMany({
      where: { driverId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
    });

    return res.json(orders);
  } catch (error) {
    console.error('Error getting driver orders:', error);
    return res.status(500).json({ error: 'Failed to get driver orders' });
  }
}

// Accept order (driver)
export async function acceptOrder(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    // Check if user is a driver
    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!driverProfile) {
      return res.status(403).json({ error: 'Not registered as driver' });
    }

    // Check if order exists and is available
    const order = await prisma.order.findUnique({
      where: { id: id as string },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'Ищет исполнителя') {
      return res.status(400).json({ error: 'Order is not available' });
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: id as string },
      data: {
        status: 'В процессе',
        driverId: req.user!.id,
        arrivalTime: Math.floor(Math.random() * 10) + 5, // Random 5-15 minutes
      },
      include: {
        user: true,
        driver: {
          include: {
            driverProfile: true,
          },
        },
      },
    });

    return res.json(updatedOrder);
  } catch (error) {
    console.error('Error accepting order:', error);
    return res.status(500).json({ error: 'Failed to accept order' });
  }
}

// Complete order (driver)
export async function completeOrder(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    // Check if order exists and belongs to driver
    const order = await prisma.order.findUnique({
      where: { id: id as string },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.driverId !== req.user!.id) {
      return res.status(403).json({ error: 'Not your order' });
    }

    if (order.status !== 'В процессе') {
      return res.status(400).json({ error: 'Order is not in progress' });
    }

    // Calculate earnings (90% to driver, 10% commission)
    const COMMISSION_RATE = 0.1;
    const earnings = order.price * (1 - COMMISSION_RATE);

    // Update order and driver balance in transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: id as string },
        data: { status: 'Завершен' },
      });

      const user = await tx.user.update({
        where: { id: req.user!.id },
        data: {
          balance: {
            increment: earnings,
          },
        },
      });

      const driverProfile = await tx.driverProfile.update({
        where: { userId: req.user!.id },
        data: {
          totalOrders: {
            increment: 1,
          },
        },
      });

      return { order: updatedOrder, balance: user.balance };
    });

    return res.json(result);
  } catch (error) {
    console.error('Error completing order:', error);
    return res.status(500).json({ error: 'Failed to complete order' });
  }
}

// Cancel order
export async function cancelOrder(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: id as string },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Only order creator or assigned driver can cancel
    if (order.userId !== req.user!.id && order.driverId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized to cancel this order' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: id as string },
      data: { status: 'Отменен' },
    });

    return res.json(updatedOrder);
  } catch (error) {
    console.error('Error canceling order:', error);
    return res.status(500).json({ error: 'Failed to cancel order' });
  }
}
