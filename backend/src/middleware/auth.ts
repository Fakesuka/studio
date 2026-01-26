import { Request, Response, NextFunction } from 'express';
import { validateTelegramWebAppData } from '../utils/telegram';
import prisma from '../utils/prisma';
import { sanitizeName, sanitizeUrl, sanitizeTelegramId } from '../utils/sanitize';

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
    console.log('[Auth] Authenticating request:', {
      path: req.path,
      method: req.method,
      hasInitData: !!req.headers['x-telegram-init-data'],
    });

    const initData = req.headers['x-telegram-init-data'] as string;

    if (!initData) {
      console.error('[Auth] No init data provided');
      res.status(401).json({ error: 'No authorization data provided' });
      return;
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error('[Auth] Bot token not configured');
      res.status(500).json({ error: 'Server configuration error' });
      return;
    }

    // Validate Telegram data
    console.log('[Auth] Validating Telegram data');
    const telegramData = validateTelegramWebAppData(initData, botToken);

    if (!telegramData || !telegramData.user) {
      console.error('[Auth] Invalid Telegram data');
      res.status(401).json({ error: 'Invalid authorization data' });
      return;
    }

    console.log('[Auth] Telegram data validated:', {
      userId: telegramData.user.id,
      username: telegramData.user.username,
      firstName: telegramData.user.first_name,
    });

    // Find or create user - with input sanitization
    const telegramId = sanitizeTelegramId(telegramData.user.id);
    let user = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      console.log('[Auth] Creating new user for Telegram ID:', telegramId);
      // Sanitize user inputs before storing
      const rawName = `${telegramData.user.first_name} ${telegramData.user.last_name || ''}`.trim();
      const sanitizedName = sanitizeName(rawName) || 'User';
      const sanitizedAvatarUrl = sanitizeUrl(telegramData.user.photo_url);

      // Create new user
      user = await prisma.user.create({
        data: {
          telegramId,
          name: sanitizedName,
          avatarUrl: sanitizedAvatarUrl,
        },
      });
      console.log('[Auth] New user created:', user.id);
    } else {
      console.log('[Auth] Existing user found:', user.id);
    }

    // Attach user to request
    req.user = {
      id: user.id,
      telegramId: user.telegramId,
      name: user.name,
    };

    console.log('[Auth] Authentication successful for user:', user.id);
    next();
  } catch (error) {
    console.error('[Auth] Authentication error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
