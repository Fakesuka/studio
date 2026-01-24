import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

/**
 * Создать отзыв после завершения заказа
 * POST /api/reviews
 */
export async function createReview(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { orderId, rating, comment } = req.body;

    if (!orderId || !rating) {
      res.status(400).json({ error: 'OrderId and rating are required' });
      return;
    }

    if (rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Rating must be between 1 and 5' });
      return;
    }

    // Проверяем, что заказ существует и завершен
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.status !== 'Завершен') {
      res.status(400).json({ error: 'Can only review completed orders' });
      return;
    }

    // Проверяем, что пользователь участвовал в заказе
    const isCustomer = order.userId === req.user!.id;
    const isDriver = order.driverId === req.user!.id;

    if (!isCustomer && !isDriver) {
      res.status(403).json({ error: 'You can only review orders you participated in' });
      return;
    }

    // Определяем кого оцениваем
    const toUserId = isCustomer ? order.driverId : order.userId;
    const type = isCustomer ? 'driver_review' : 'customer_review';

    if (!toUserId) {
      res.status(400).json({ error: 'Invalid order state' });
      return;
    }

    // Проверяем, что отзыв еще не был оставлен
    const existingReview = await prisma.review.findUnique({
      where: { orderId },
    });

    if (existingReview) {
      res.status(400).json({ error: 'Review already exists for this order' });
      return;
    }

    // Создаем отзыв
    const review = await prisma.review.create({
      data: {
        orderId,
        fromUserId: req.user!.id,
        toUserId,
        rating,
        comment: comment || null,
        type,
      },
    });

    // Обновляем рейтинг водителя
    if (type === 'driver_review') {
      const driverProfile = await prisma.driverProfile.findUnique({
        where: { userId: toUserId },
      });

      if (driverProfile) {
        const allReviews = await prisma.review.findMany({
          where: {
            toUserId,
            type: 'driver_review',
          },
        });

        const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = totalRating / allReviews.length;

        await prisma.driverProfile.update({
          where: { userId: toUserId },
          data: { rating: Math.round(avgRating * 10) / 10 }, // Round to 1 decimal
        });
      }
    }

    res.status(201).json({
      review,
      message: 'Thank you for your feedback!',
    });
  } catch (error: any) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
}

/**
 * Получить отзывы о пользователе (водителе/продавце)
 * GET /api/reviews/user/:userId
 */
export async function getUserReviews(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { userId } = req.params;
    const { type, limit = '20', offset = '0' } = req.query;

    const where: any = { toUserId: userId };
    if (type) {
      where.type = type;
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const totalReviews = await prisma.review.count({ where });

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({
      reviews,
      stats: {
        total: totalReviews,
        averageRating: Math.round(avgRating * 10) / 10,
        ratingsDistribution: {
          5: reviews.filter(r => r.rating === 5).length,
          4: reviews.filter(r => r.rating === 4).length,
          3: reviews.filter(r => r.rating === 3).length,
          2: reviews.filter(r => r.rating === 2).length,
          1: reviews.filter(r => r.rating === 1).length,
        },
      },
    });
  } catch (error: any) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
}

/**
 * Получить отзывы, оставленные пользователем
 * GET /api/reviews/my-reviews
 */
export async function getMyReviews(req: AuthRequest, res: Response): Promise<void> {
  try {
    const reviews = await prisma.review.findMany({
      where: { fromUserId: req.user!.id },
      include: {
        toUser: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ reviews });
  } catch (error: any) {
    console.error('Get my reviews error:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
}

/**
 * Проверить, можно ли оставить отзыв на заказ
 * GET /api/reviews/can-review/:orderId
 */
export async function canReviewOrder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId as string },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const isParticipant = order.userId === req.user!.id || order.driverId === req.user!.id;
    const isCompleted = order.status === 'Завершен';

    const existingReview = await prisma.review.findUnique({
      where: { orderId: orderId as string },
    });

    res.json({
      canReview: isParticipant && isCompleted && !existingReview,
      reason: !isParticipant
        ? 'Not a participant'
        : !isCompleted
        ? 'Order not completed'
        : existingReview
        ? 'Already reviewed'
        : null,
    });
  } catch (error: any) {
    console.error('Can review order error:', error);
    res.status(500).json({ error: 'Failed to check review status' });
  }
}
