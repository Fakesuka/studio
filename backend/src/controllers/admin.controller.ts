import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

// Get dashboard stats
export async function getDashboardStats(req: AuthRequest, res: Response) {
  try {
    const [
      totalUsers,
      totalDrivers,
      totalSellers,
      totalOrders,
      totalProducts,
      pendingDrivers,
      pendingSellers,
      pendingProducts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.driverProfile.count(),
      prisma.sellerProfile.count(),
      prisma.order.count(),
      prisma.product.count(),
      prisma.driverProfile.count({ where: { verified: false } }),
      prisma.sellerProfile.count({ where: { verified: false } }),
      prisma.product.count({ where: { approved: false } }),
    ]);

    return res.json({
      totalUsers,
      totalDrivers,
      totalSellers,
      totalOrders,
      totalProducts,
      pendingDrivers,
      pendingSellers,
      pendingProducts,
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return res.status(500).json({ error: 'Failed to get stats' });
  }
}

// Get all users with filters
export async function getUsers(req: AuthRequest, res: Response) {
  try {
    const { isDriver, isSeller, isAdmin, limit = 50, offset = 0 } = req.query;

    const where: any = {};
    if (isDriver === 'true') where.driverProfile = { isNot: null };
    if (isSeller === 'true') where.sellerProfile = { isNot: null };
    if (isAdmin === 'true') where.isAdmin = true;

    const users = await prisma.user.findMany({
      where,
      include: {
        driverProfile: true,
        sellerProfile: true,
        _count: {
          select: {
            orders: true,
            marketplaceOrders: true,
          },
        },
      },
      take: Number(limit),
      skip: Number(offset),
      orderBy: { createdAt: 'desc' },
    });

    return res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    return res.status(500).json({ error: 'Failed to get users' });
  }
}

// Get pending drivers for verification
export async function getPendingDrivers(req: AuthRequest, res: Response) {
  try {
    const drivers = await prisma.driverProfile.findMany({
      where: { verified: false },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            telegramId: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(drivers);
  } catch (error) {
    console.error('Error getting pending drivers:', error);
    return res.status(500).json({ error: 'Failed to get pending drivers' });
  }
}

// Verify driver
export async function verifyDriver(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const driver = await prisma.driverProfile.update({
      where: { id: id as string },
      data: {
        verified: true,
        verifiedAt: new Date(),
      },
      include: {
        user: true,
      },
    });

    return res.json(driver);
  } catch (error) {
    console.error('Error verifying driver:', error);
    return res.status(500).json({ error: 'Failed to verify driver' });
  }
}

// Reject/Unverify driver
export async function unverifyDriver(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const driver = await prisma.driverProfile.update({
      where: { id: id as string },
      data: {
        verified: false,
        verifiedAt: null,
      },
    });

    return res.json(driver);
  } catch (error) {
    console.error('Error unverifying driver:', error);
    return res.status(500).json({ error: 'Failed to unverify driver' });
  }
}

// Get pending sellers for verification
export async function getPendingSellers(req: AuthRequest, res: Response) {
  try {
    const sellers = await prisma.sellerProfile.findMany({
      where: { verified: false },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            telegramId: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(sellers);
  } catch (error) {
    console.error('Error getting pending sellers:', error);
    return res.status(500).json({ error: 'Failed to get pending sellers' });
  }
}

// Verify seller
export async function verifySeller(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const seller = await prisma.sellerProfile.update({
      where: { id: id as string },
      data: {
        verified: true,
        verifiedAt: new Date(),
      },
      include: {
        user: true,
      },
    });

    return res.json(seller);
  } catch (error) {
    console.error('Error verifying seller:', error);
    return res.status(500).json({ error: 'Failed to verify seller' });
  }
}

// Unverify seller
export async function unverifySeller(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const seller = await prisma.sellerProfile.update({
      where: { id: id as string },
      data: {
        verified: false,
        verifiedAt: null,
      },
    });

    return res.json(seller);
  } catch (error) {
    console.error('Error unverifying seller:', error);
    return res.status(500).json({ error: 'Failed to unverify seller' });
  }
}

// Get pending products for approval
export async function getPendingProducts(req: AuthRequest, res: Response) {
  try {
    const products = await prisma.product.findMany({
      where: { approved: false },
      include: {
        shop: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(products);
  } catch (error) {
    console.error('Error getting pending products:', error);
    return res.status(500).json({ error: 'Failed to get pending products' });
  }
}

// Approve product
export async function approveProduct(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const product = await prisma.product.update({
      where: { id: id as string },
      data: {
        approved: true,
        approvedAt: new Date(),
      },
      include: {
        shop: true,
      },
    });

    return res.json(product);
  } catch (error) {
    console.error('Error approving product:', error);
    return res.status(500).json({ error: 'Failed to approve product' });
  }
}

// Unapprove product
export async function unapproveProduct(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const product = await prisma.product.update({
      where: { id: id as string },
      data: {
        approved: false,
        approvedAt: null,
      },
    });

    return res.json(product);
  } catch (error) {
    console.error('Error unapproving product:', error);
    return res.status(500).json({ error: 'Failed to unapprove product' });
  }
}

// Delete product
export async function deleteProduct(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id: id as string },
    });

    return res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ error: 'Failed to delete product' });
  }
}

// Get all orders with filters
export async function getAllOrders(req: AuthRequest, res: Response) {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    const where: any = {};
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      take: Number(limit),
      skip: Number(offset),
      orderBy: { createdAt: 'desc' },
    });

    return res.json(orders);
  } catch (error) {
    console.error('Error getting orders:', error);
    return res.status(500).json({ error: 'Failed to get orders' });
  }
}

// Make user admin
export async function makeAdmin(req: AuthRequest, res: Response) {
  try {
    const { userId } = req.params;

    const user = await prisma.user.update({
      where: { id: userId as string },
      data: { isAdmin: true },
    });

    return res.json(user);
  } catch (error) {
    console.error('Error making user admin:', error);
    return res.status(500).json({ error: 'Failed to make user admin' });
  }
}

// Remove admin
export async function removeAdmin(req: AuthRequest, res: Response) {
  try {
    const { userId } = req.params;

    const user = await prisma.user.update({
      where: { id: userId as string },
      data: { isAdmin: false },
    });

    return res.json(user);
  } catch (error) {
    console.error('Error removing admin:', error);
    return res.status(500).json({ error: 'Failed to remove admin' });
  }
}
