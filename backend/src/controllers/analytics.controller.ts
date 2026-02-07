import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

/**
 * Аналитика для водителя
 * GET /api/analytics/driver
 */
export async function getDriverAnalytics(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { period = 'month' } = req.query; // day, week, month, year

    // Проверяем, что пользователь - водитель
    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!driverProfile) {
      res.status(403).json({ error: 'Not a driver' });
      return;
    }

    // Определяем период
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Получаем статистику по услугам (оптимизировано через groupBy)
    const serviceStatsGrouped = await prisma.order.groupBy({
      by: ['service'],
      where: {
        driverId: req.user!.id,
        status: 'Завершен',
        createdAt: {
          gte: startDate,
        },
      },
      _count: {
        service: true,
      },
      _sum: {
        price: true,
      },
    });

    // Получаем данные для графика по дням (оптимизировано: выбираем только нужные поля)
    const ordersForDailyStats = await prisma.order.findMany({
      where: {
        driverId: req.user!.id,
        status: 'Завершен',
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
        price: true,
      },
    });

    // Подсчитываем общую статистику из сгруппированных данных
    let totalOrders = 0;
    let totalRevenue = 0;

    const serviceStats: Record<string, { count: number; revenue: number }> = {};

    serviceStatsGrouped.forEach((group) => {
      const count = group._count.service;
      const revenue = group._sum.price || 0;

      totalOrders += count;
      totalRevenue += revenue;

      serviceStats[group.service] = { count, revenue };
    });

    const earnings = totalRevenue * 0.9; // 10% комиссия
    const commission = totalRevenue * 0.1;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Заказы по дням (для графика)
    const ordersByDay = ordersForDailyStats.reduce((acc: any, order) => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { count: 0, revenue: 0 };
      }
      acc[date].count++;
      acc[date].revenue += order.price;
      return acc;
    }, {});

    // Получаем агрегированный рейтинг и количество отзывов (оптимизировано)
    const reviewsAggregate = await prisma.review.aggregate({
      where: {
        toUserId: req.user!.id,
        type: 'driver_review',
        createdAt: {
          gte: startDate,
        },
      },
      _avg: {
        rating: true,
      },
      _count: {
        _all: true,
      },
    });

    const avgRating = reviewsAggregate._avg.rating || 0;
    const reviewsCount = reviewsAggregate._count._all;

    res.json({
      period,
      summary: {
        totalOrders,
        totalRevenue,
        earnings,
        commission,
        averageOrderValue,
        rating: Math.round(avgRating * 10) / 10,
        reviewsCount,
      },
      serviceBreakdown: Object.entries(serviceStats).map(([service, stats]: any) => ({
        service,
        count: stats.count,
        revenue: stats.revenue,
        percentage: totalOrders > 0 ? (stats.count / totalOrders) * 100 : 0,
      })),
      dailyStats: Object.entries(ordersByDay).map(([date, stats]: any) => ({
        date,
        count: stats.count,
        revenue: stats.revenue,
      })),
    });
  } catch (error: any) {
    console.error('Get driver analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
}

/**
 * Аналитика для продавца
 * GET /api/analytics/seller
 */
export async function getSellerAnalytics(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { period = 'month' } = req.query;

    // Проверяем, что пользователь - продавец
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!sellerProfile) {
      res.status(403).json({ error: 'Not a seller' });
      return;
    }

    // Определяем период
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Получаем магазины продавца
    // This part can also be optimized to select only product IDs, but we need active products count later.
    // Keeping it as is but making sure we only fetch necessary data could be good, but shops + products is probably not huge compared to orders.
    const shops = await prisma.shop.findMany({
      where: { userId: req.user!.id },
      include: {
        products: true,
      },
    });

    const productIds = shops.flatMap((shop) => shop.products.map((p) => p.id));

    // Получаем заказы с товарами продавца
    const orderItems = await prisma.marketplaceOrderItem.findMany({
      where: {
        productId: { in: productIds },
        order: {
          createdAt: {
            gte: startDate,
          },
        },
      },
      select: {
        productId: true,
        quantity: true,
        price: true,
        orderId: true,
        order: {
          select: {
            createdAt: true,
          }
        }
      }
    });

    // Подсчитываем статистику
    const totalOrders = new Set(orderItems.map((item) => item.orderId)).size;
    const totalRevenue = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalItemsSold = orderItems.reduce((sum, item) => sum + item.quantity, 0);

    // Топ товаров
    const productStats = orderItems.reduce((acc: any, item) => {
      if (!acc[item.productId]) {
        acc[item.productId] = {
          productId: item.productId,
          quantity: 0,
          revenue: 0,
        };
      }
      acc[item.productId].quantity += item.quantity;
      acc[item.productId].revenue += item.price * item.quantity;
      return acc;
    }, {});

    const topProductStats = Object.values(productStats)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10);

    // Fetch details for top products
    const topProductIds = topProductStats.map((p: any) => p.productId);
    const productsDetails = await prisma.product.findMany({
       where: { id: { in: topProductIds as string[] } }
    });

    const topProducts = topProductStats.map((stat: any) => {
        const product = productsDetails.find(p => p.id === stat.productId);
        return {
            product,
            quantity: stat.quantity,
            revenue: stat.revenue
        };
    });

    // Заказы по дням
    const ordersByDay = orderItems.reduce((acc: any, item) => {
      const date = new Date(item.order.createdAt).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { orders: new Set(), revenue: 0, items: 0 };
      }
      acc[date].orders.add(item.orderId);
      acc[date].revenue += item.price * item.quantity;
      acc[date].items += item.quantity;
      return acc;
    }, {});

    res.json({
      period,
      summary: {
        totalOrders,
        totalRevenue,
        totalItemsSold,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        activeProducts: shops.flatMap((s) => s.products).length,
      },
      topProducts,
      dailyStats: Object.entries(ordersByDay).map(([date, stats]: any) => ({
        date,
        orderCount: stats.orders.size,
        revenue: stats.revenue,
        itemsSold: stats.items,
      })),
    });
  } catch (error: any) {
    console.error('Get seller analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
}

/**
 * Топ водителей (для публичного рейтинга)
 * GET /api/analytics/top-drivers
 */
export async function getTopDrivers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { limit = '10' } = req.query;

    const drivers = await prisma.driverProfile.findMany({
      where: {
        verified: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        rating: 'desc',
      },
      take: parseInt(limit as string),
    });

    res.json({ drivers });
  } catch (error: any) {
    console.error('Get top drivers error:', error);
    res.status(500).json({ error: 'Failed to get top drivers' });
  }
}
