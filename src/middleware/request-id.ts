import { createMiddleware } from 'hono/factory';
import type { AppEnv } from '../types/context';

/**
 * Middleware to inject a unique request ID into the context and response headers
 */
export const requestId = createMiddleware<AppEnv>(async (c, next) => {
  const id = crypto.randomUUID();

  c.set('requestId', id);
  c.set('startTime', Date.now());
  c.header('X-Request-ID', id);

  await next();
});
