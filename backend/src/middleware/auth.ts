import { Request, Response, NextFunction } from 'express';
import { validateTelegramWebAppData } from '../utils/telegram';
import prisma from '../utils/prisma';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    telegramId: string;
    name: string;
  };
}

export async function authenticateUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const initData = req.headers['x-telegram-init-data'] as string;

    if (!initData) {
      res.status(401).json({ error: 'No authorization data provided' });
      return;
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      res.status(500).json({ error: 'Server configuration error' });
      return;
    }

    // Validate Telegram data
    const telegramData = validateTelegramWebAppData(initData, botToken);

    if (!telegramData || !telegramData.user) {
      res.status(401).json({ error: 'Invalid authorization data' });
      return;
    }

    // Find or create user
    const telegramId = telegramData.user.id.toString();
    let user = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          telegramId,
          name: `${telegramData.user.first_name} ${telegramData.user.last_name || ''}`.trim(),
          avatarUrl: telegramData.user.photo_url,
        },
      });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      telegramId: user.telegramId,
      name: user.name,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}
