import { Socket } from 'socket.io';
import { validateTelegramWebAppData } from '../utils/telegram';
import prisma from '../utils/prisma';
import { sanitizeName, sanitizeUrl, sanitizeTelegramId } from '../utils/sanitize';

export interface AuthenticatedSocket extends Socket {
  data: {
    user?: {
      id: string;
      telegramId: string;
      name: string;
    };
    [key: string]: any;
  };
}

// Allow dependency injection for testing
export const authenticateSocket = (
  prismaClient: any = prisma,
  validator: any = validateTelegramWebAppData
) => {
  return async (socket: Socket, next: (err?: Error) => void) => {
    try {
      // 1. Extract initData from handshake
      // Check auth.token, headers['x-telegram-init-data'], or query.token
      const initData =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.['x-telegram-init-data'] ||
        socket.handshake.query?.token;

      if (!initData || typeof initData !== 'string') {
        console.error('[SocketAuth] No init data provided for socket:', socket.id);
        return next(new Error('Authentication error: No init data'));
      }

      // 2. Validate Telegram data
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!botToken) {
        console.error('[SocketAuth] Bot token not configured');
        return next(new Error('Server configuration error'));
      }

      const telegramData = validator(initData, botToken);

      if (!telegramData || !telegramData.user) {
        console.error('[SocketAuth] Invalid Telegram data for socket:', socket.id);
        return next(new Error('Authentication error: Invalid data'));
      }

      // 3. Find or create user (similar to auth.ts)
      const telegramId = sanitizeTelegramId(telegramData.user.id);

      let user = await prismaClient.user.findUnique({
        where: { telegramId },
      });

      if (!user) {
        console.log('[SocketAuth] Creating new user for Telegram ID:', telegramId);
        // Sanitize user inputs
        const rawName = `${telegramData.user.first_name} ${telegramData.user.last_name || ''}`.trim();
        const sanitizedName = sanitizeName(rawName) || 'User';
        const sanitizedAvatarUrl = sanitizeUrl(telegramData.user.photo_url);

        user = await prismaClient.user.create({
          data: {
            telegramId,
            name: sanitizedName,
            avatarUrl: sanitizedAvatarUrl,
          },
        });
      }

      // 4. Attach user to socket
      // Cast socket to AuthenticatedSocket to access .data
      (socket as AuthenticatedSocket).data.user = {
        id: user.id,
        telegramId: user.telegramId,
        name: user.name,
      };

      console.log(`[SocketAuth] User ${user.id} authenticated on socket ${socket.id}`);
      next();
    } catch (error) {
      console.error('[SocketAuth] Authentication error:', error);
      next(new Error('Authentication failed'));
    }
  };
};
