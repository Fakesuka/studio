import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

// Get current user profile
export async function getProfile(req: AuthRequest, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        driverProfile: true,
        sellerProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      id: user.id,
      name: user.name,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      balance: user.balance,
      isDriver: !!user.driverProfile,
      isSeller: !!user.sellerProfile,
      driverProfile: user.driverProfile,
      sellerProfile: user.sellerProfile,
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    return res.status(500).json({ error: 'Failed to get profile' });
  }
}

// Update user profile
export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const { name, phone } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
      },
    });

    return res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
}

// Register as driver
export async function registerAsDriver(req: AuthRequest, res: Response) {
  try {
    const { name, vehicle, services, legalStatus } = req.body;

    if (!name || !vehicle || !services || !legalStatus) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if already registered as driver
    const existingDriver = await prisma.driverProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (existingDriver) {
      return res.status(400).json({ error: 'Already registered as driver' });
    }

    const driverProfile = await prisma.driverProfile.create({
      data: {
        userId: req.user!.id,
        name,
        vehicle,
        services,
        legalStatus,
      },
    });

    return res.status(201).json(driverProfile);
  } catch (error) {
    console.error('Error registering as driver:', error);
    return res.status(500).json({ error: 'Failed to register as driver' });
  }
}

// Register as seller
export async function registerAsSeller(req: AuthRequest, res: Response) {
  try {
    const { type, storeName, storeDescription, address, workingHours } = req.body;

    if (!type || !storeName || !storeDescription) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if already registered as seller
    const existingSeller = await prisma.sellerProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (existingSeller) {
      return res.status(400).json({ error: 'Already registered as seller' });
    }

    // Create seller profile and shop in transaction
    const result = await prisma.$transaction(async (tx) => {
      const sellerProfile = await tx.sellerProfile.create({
        data: {
          userId: req.user!.id,
          type,
          storeName,
          storeDescription,
          address,
          workingHours,
        },
      });

      const shop = await tx.shop.create({
        data: {
          userId: req.user!.id,
          name: storeName,
          description: storeDescription,
          type,
          address,
          workingHours,
          imageUrl: 'https://picsum.photos/seed/newshop/200/200',
          imageHint: 'store front',
          bannerUrl: 'https://picsum.photos/seed/newshop-banner/800/200',
          bannerHint: 'store banner',
        },
      });

      return { sellerProfile, shop };
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error('Error registering as seller:', error);
    return res.status(500).json({ error: 'Failed to register as seller' });
  }
}

// Get user balance
export async function getBalance(req: AuthRequest, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { balance: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ balance: user.balance });
  } catch (error) {
    console.error('Error getting balance:', error);
    return res.status(500).json({ error: 'Failed to get balance' });
  }
}
