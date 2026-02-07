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
      where: { id: orderId as string },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.userId !== req.user!.id && order.driverId !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const messages = await prisma.message.findMany({
      where: { orderId: orderId as string },
      orderBy: { createdAt: 'asc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    // Отмечаем сообщения как прочитанные
    await prisma.message.updateMany({
      where: {
        orderId: orderId as string,
        receiverId: req.user!.id,
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
      where: { id: orderId as string },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.userId !== req.user!.id && order.driverId !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Определяем получателя
    const receiverId = order.userId === req.user!.id ? order.driverId : order.userId;

    if (!receiverId) {
      res.status(400).json({ error: 'No receiver for this message' });
      return;
    }

    // Создаем сообщение
    const message = await prisma.message.create({
      data: {
        orderId: orderId as string,
        senderId: req.user!.id,
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
        receiverId: req.user!.id,
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
          { userId: req.user!.id },
          { driverId: req.user!.id },
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

    // Для каждого заказа получаем последнее сообщение и количество непрочитанных (оптимизировано)
    const orderIds = orders.map((o) => o.id);

    // Получаем последние сообщения для всех заказов одним запросом
    const lastMessages = await prisma.message.findMany({
      where: { orderId: { in: orderIds } },
      orderBy: [
        { orderId: 'asc' },
        { createdAt: 'desc' },
      ],
      distinct: ['orderId'],
    });

    // Получаем количество непрочитанных сообщений для всех заказов одним запросом
    const unreadCounts = await prisma.message.groupBy({
      by: ['orderId'],
      where: {
        orderId: { in: orderIds },
        receiverId: req.user!.id,
        read: false,
      },
      _count: {
        _all: true,
      },
    });

    const lastMessageMap = new Map(lastMessages.map((m) => [m.orderId, m]));
    const unreadCountMap = new Map(unreadCounts.map((c) => [c.orderId, c._count._all]));

    const conversations = orders.map((order) => {
      const lastMessage = lastMessageMap.get(order.id) || null;
      const unreadCount = unreadCountMap.get(order.id) || 0;

      // Определяем собеседника
      const otherUser = order.userId === req.user!.id ? order.driver : order.user;

      return {
        orderId: order.id,
        orderService: order.service,
        orderStatus: order.status,
        otherUser,
        lastMessage,
        unreadCount,
        updatedAt: order.updatedAt,
      };
    });

    res.json({ conversations: conversations.filter((c) => c.otherUser) });
  } catch (error: any) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
}
