import crypto from 'crypto';

export interface TelegramInitData {
  query_id?: string;
  user?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
    photo_url?: string;
  };
  auth_date: number;
  hash: string;
}

/**
 * Validates Telegram Mini App initData
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateTelegramWebAppData(initData: string, botToken: string): TelegramInitData | null {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');

    if (!hash) {
      return null;
    }

    // Remove hash from params
    urlParams.delete('hash');

    // Sort params alphabetically
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Create secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Compare hashes
    if (calculatedHash !== hash) {
      return null;
    }

    // Parse user data
    const userParam = urlParams.get('user');
    const authDate = parseInt(urlParams.get('auth_date') || '0', 10);

    // Check if auth_date is not too old (e.g., 24 hours)
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) {
      return null;
    }

    return {
      query_id: urlParams.get('query_id') || undefined,
      user: userParam ? JSON.parse(userParam) : undefined,
      auth_date: authDate,
      hash,
    };
  } catch (error) {
    console.error('Error validating Telegram data:', error);
    return null;
  }
}

export function generateOrderId(prefix: 'SAHA' | 'MARKET'): string {
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}-${randomNum}`;
}
