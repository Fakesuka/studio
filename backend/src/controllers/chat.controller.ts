import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

/**
 * Получить историю сообщений по заказу
 * GET /api/chat/:orderId/messages
 */
export async function getMessages(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { orderId } = req.params;
    const { limit = '50', offset = '0' } = req.query;

    // Проверяем, что пользователь участвует в заказе
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.userId !== req.user.id && order.driverId !== req.user.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const messages = await prisma.message.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    // Отмечаем сообщения как прочитанные
    await prisma.message.updateMany({
      where: {
        orderId,
        receiverId: req.user.id,
        read: false,
      },
      data: { read: true },
    });

    res.json({ messages });
  } catch (error: any) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
}

/**
 * Отправить сообщение
 * POST /api/chat/:orderId/send
 */
export async function sendMessage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { orderId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      res.status(400).json({ error: 'Message content is required' });
      return;
    }

    if (content.length > 1000) {
      res.status(400).json({ error: 'Message is too long (max 1000 characters)' });
      return;
    }

    // Проверяем заказ
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.userId !== req.user.id && order.driverId !== req.user.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Определяем получателя
    const receiverId = order.userId === req.user.id ? order.driverId : order.userId;

    if (!receiverId) {
      res.status(400).json({ error: 'No receiver for this message' });
      return;
    }

    // Создаем сообщение
    const message = await prisma.message.create({
      data: {
        orderId,
        senderId: req.user.id,
        receiverId,
        content: content.trim(),
      },
    });

    res.status(201).json({ message });
  } catch (error: any) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
}

/**
 * Получить количество непрочитанных сообщений
 * GET /api/chat/unread-count
 */
export async function getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
  try {
    const count = await prisma.message.count({
      where: {
        receiverId: req.user.id,
        read: false,
      },
    });

    res.json({ unreadCount: count });
  } catch (error: any) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
}

/**
 * Получить список чатов пользователя
 * GET /api/chat/conversations
 */
export async function getConversations(req: AuthRequest, res: Response): Promise<void> {
  try {
    // Находим все заказы, где пользователь участвует
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          { driverId: req.user.id },
        ],
        status: {
          in: ['В процессе', 'Завершен'],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Для каждого заказа получаем последнее сообщение и количество непрочитанных
    const conversations = await Promise.all(
      orders.map(async (order) => {
        const lastMessage = await prisma.message.findFirst({
          where: { orderId: order.id },
          orderBy: { createdAt: 'desc' },
        });

        const unreadCount = await prisma.message.count({
          where: {
            orderId: order.id,
            receiverId: req.user.id,
            read: false,
          },
        });

        // Определяем собеседника
        const otherUser = order.userId === req.user.id ? order.driver : order.user;

        return {
          orderId: order.id,
          orderService: order.service,
          orderStatus: order.status,
          otherUser,
          lastMessage,
          unreadCount,
          updatedAt: order.updatedAt,
        };
      })
    );

    res.json({ conversations: conversations.filter((c) => c.otherUser) });
  } catch (error: any) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
}
