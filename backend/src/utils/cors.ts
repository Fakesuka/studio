import { CorsOptions } from 'cors';

export const getAllowedOrigins = (): string[] => {
  const origins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
    : [];

  if (process.env.NODE_ENV !== 'production') {
    origins.push('http://localhost:3000');
    origins.push('http://localhost:5173');
    origins.push('http://127.0.0.1:3000');
    origins.push('http://127.0.0.1:5173');
  }

  return origins;
};

export const getCorsOrigin = (): CorsOptions['origin'] => {
  const allowedOrigins = getAllowedOrigins();

  return (origin: string | undefined, callback: (err: Error | null, origin?: boolean | string | RegExp | (string | RegExp)[]) => void) => {
    if (!origin) {
      // Allow requests with no origin (like mobile apps or curl requests)
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  };
};

export const getCorsOptions = (): CorsOptions => {
  return {
    origin: getCorsOrigin(),
    credentials: true,
    allowedHeaders: ['Content-Type', 'X-Telegram-Init-Data', 'Authorization'],
    exposedHeaders: ['Content-Type'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };
};
