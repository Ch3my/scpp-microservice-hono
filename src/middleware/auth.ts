import { createMiddleware } from 'hono/factory';
import { InvalidSessionError } from '../errors/http';
import { sessionService } from '../services/session.service';
import type { AppEnv } from '../types/context';

/**
 * Middleware to validate session hash from query parameters
 * Use for GET requests where sessionHash comes from query string
 */
export const requireSessionQuery = createMiddleware<AppEnv>(async (c, next) => {
  const sessionHash = c.req.query('sessionHash');

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

