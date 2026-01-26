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

/**
 * Get current user avatar URL from Telegram
 * Returns real photo URL or undefined if not available
 */
export function getCurrentUserAvatar(): string | undefined {
  const telegramUser = getTelegramUser();
  return telegramUser?.photo_url;
}

/**
 * Get user initials for avatar fallback
 * @param name - User name (optional, will use current user if not provided)
 * @returns Initials (up to 2 characters)
 */
export function getUserInitials(name?: string): string {
  if (!name) {
    name = getCurrentUserName();
  }

  if (!name || name === 'User') return 'U';

  return name
    .split(' ')
    .map(n => n[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .substring(0, 2);
}
