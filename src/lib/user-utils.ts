import { getTelegramUser } from './telegram';

/**
 * Get current user ID
 * In dev mode, returns 'self' for testing
 * In production, returns actual Telegram user ID
 */
export function getCurrentUserId(): string {
  const isDevMode = typeof window !== 'undefined' &&
                    (localStorage.getItem('devMode') === 'true' ||
                     process.env.NODE_ENV === 'development');

  if (isDevMode) {
    return 'self'; // Dev mode - for testing with seed data
  }

  const telegramUser = getTelegramUser();
  return telegramUser?.id?.toString() || 'self';
}

/**
 * Get current user phone number
 */
export function getCurrentUserPhone(): string | null {
  const telegramUser = getTelegramUser();
  return telegramUser?.phone_number || null;
}

/**
 * Get current user name
 */
export function getCurrentUserName(): string {
  const telegramUser = getTelegramUser();
  if (telegramUser) {
    return `${telegramUser.first_name || ''} ${telegramUser.last_name || ''}`.trim() || 'User';
  }
  return 'User';
}
