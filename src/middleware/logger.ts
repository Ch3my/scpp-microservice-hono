import { createMiddleware } from 'hono/factory';
import { env } from '../config/env';
import type { AppEnv } from '../types/context';

/**
 * Request/Response logging middleware
 * Controlled by LOG_ENDPOINTS and DEBUG_RESPONSES environment variables
 */
export const requestLogger = createMiddleware<AppEnv>(async (c, next) => {
  // Skip logging if disabled
  if (!env.LOG_ENDPOINTS && !env.DEBUG_RESPONSES) {
    return next();
  }

  const startTime = c.get('startTime') || Date.now();
  const requestId = c.get('requestId') || 'unknown';

  await next();

  // Log request info
  if (env.LOG_ENDPOINTS) {
    const duration = Date.now() - startTime;
    console.log(
      `[${new Date().toISOString()}] ${c.req.method} ${c.req.path} - ${c.res.status} (${duration}ms) [${requestId}]`
    );
  }

  // Log response body
  if (env.DEBUG_RESPONSES) {
    try {
      const clonedResponse = c.res.clone();
      const body = await clonedResponse.text();
      console.log(`[RESPONSE BODY] ${c.req.method} ${c.req.path}`);
      try {
        console.log(JSON.stringify(JSON.parse(body), null, 2));
      } catch {
        console.log(body);
      }
    } catch (error) {
      console.log('[RESPONSE BODY] Unable to read response body');
    }
  }
});
