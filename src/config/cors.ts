/**
 * Allowed origins for CORS
 * Must match exactly with the old-app configuration
 */
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:1420',
  'https://scppdesktop.lezora.cl',
  'https://scppapp.lezora.cl',
];

/**
 * CORS configuration for Hono
 */
export const corsConfig = {
  origin: (origin: string | undefined) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return '*';

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return origin;
    }

    // Reject other origins
    return null;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['X-Request-ID'],
  credentials: true,
  maxAge: 3600,
};
