import { createMiddleware } from 'hono/factory';
import { InvalidSessionError } from '../errors/http';
import { sessionService } from '../services/session.service';
import type { AppEnv } from '../types/context';

/**
 * Middleware to validate session hash from Authorization header
 * Expects: Authorization: Bearer <sessionHash>
 */
export const requireSession = createMiddleware<AppEnv>(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  const sessionHash = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!sessionHash) {
    throw new InvalidSessionError();
  }

  const isValid = await sessionService.validate(sessionHash);
  if (!isValid) {
    throw new InvalidSessionError();
  }

  c.set('sessionHash', sessionHash);
  await next();
});

