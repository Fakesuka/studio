/**
 * Input Sanitization Utilities
 * Protects against XSS, injection attacks, and malicious input
 */

/**
 * Sanitize user name - remove HTML, scripts, and dangerous characters
 */
export function sanitizeName(name: string): string {
  if (!name || typeof name !== 'string') {
    return '';
  }

  return name
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>\"']/g, '') // Remove dangerous characters
    .substring(0, 100); // Limit length
}

/**
 * Validate and sanitize URL - prevent javascript: and data: URIs
 */
export function sanitizeUrl(url: string | undefined): string | undefined {
  if (!url || typeof url !== 'string') {
    return undefined;
  }

  const trimmed = url.trim();

  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = trimmed.toLowerCase();

  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      console.warn(`[Security] Blocked dangerous URL protocol: ${protocol}`);
      return undefined;
    }
  }

  // Only allow http, https, and telegram URLs
  if (!/^https?:\/\//i.test(trimmed) && !/^tg:\/\//i.test(trimmed)) {
    console.warn(`[Security] Blocked non-HTTP(S) URL: ${trimmed}`);
    return undefined;
  }

  // Limit URL length
  if (trimmed.length > 2048) {
    console.warn(`[Security] URL too long, truncating`);
    return trimmed.substring(0, 2048);
  }

  return trimmed;
}

/**
 * Sanitize phone number - keep only digits and + sign
 */
export function sanitizePhone(phone: string | undefined): string | undefined {
  if (!phone || typeof phone !== 'string') {
    return undefined;
  }

  const sanitized = phone.trim().replace(/[^0-9+]/g, '');

  // Basic phone validation
  if (sanitized.length < 10 || sanitized.length > 15) {
    console.warn(`[Security] Invalid phone length: ${sanitized.length}`);
    return undefined;
  }

  return sanitized;
}

/**
 * Sanitize generic text input - remove scripts and dangerous content
 */
export function sanitizeText(text: string, maxLength: number = 1000): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // Remove iframes
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .substring(0, maxLength);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Sanitize filename - prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return 'file';
  }

  return filename
    .trim()
    .replace(/\.\./g, '') // Remove parent directory references
    .replace(/[\/\\]/g, '') // Remove path separators
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
    .substring(0, 255); // Limit length
}

/**
 * Validate and sanitize Telegram ID
 */
export function sanitizeTelegramId(id: string | number): string {
  const idStr = String(id).trim();

  // Telegram IDs are numeric and positive
  if (!/^\d+$/.test(idStr)) {
    throw new Error('Invalid Telegram ID format');
  }

  const idNum = parseInt(idStr, 10);
  if (idNum <= 0 || idNum > Number.MAX_SAFE_INTEGER) {
    throw new Error('Invalid Telegram ID range');
  }

  return idStr;
}

/**
 * Sanitize JSON string - prevent injection
 */
export function sanitizeJSON(jsonString: string): any {
  try {
    const parsed = JSON.parse(jsonString);

    // Recursively sanitize strings in object
    return sanitizeObject(parsed);
  } catch (error) {
    console.error('[Security] Invalid JSON:', error);
    return null;
  }
}

function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeText(obj);
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
}

/**
 * Rate limiting helper - track requests by user
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  userId: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const userLimit = requestCounts.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or create new limit
    requestCounts.set(userId, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    console.warn(`[Security] Rate limit exceeded for user: ${userId}`);
    return false;
  }

  userLimit.count++;
  return true;
}

/**
 * Clean up old rate limit entries
 */
setInterval(() => {
  const now = Date.now();
  for (const [userId, limit] of requestCounts.entries()) {
    if (now > limit.resetTime) {
      requestCounts.delete(userId);
    }
  }
}, 300000); // Clean up every 5 minutes
