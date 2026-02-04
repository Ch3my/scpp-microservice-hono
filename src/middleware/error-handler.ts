import type { Context, ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';
import { ApiError } from '../errors/http';
import { createErrorResponse } from '../types/api';
import { env } from '../config/env';

/**
 * Global error handler
 * Transforms all errors to the standard API error format
 */
export const errorHandler: ErrorHandler = (err: Error, c: Context) => {
  const requestId = c.get('requestId') || 'unknown';

  // Log error details
  console.error({
    timestamp: new Date().toISOString(),
    requestId,
    method: c.req.method,
    path: c.req.path,
    error: err.message,
    stack: env.IS_PRODUCTION ? undefined : err.stack,
  });

  // Handle our custom API errors
  if (err instanceof ApiError) {
    return err.getResponse();
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    return c.json(createErrorResponse(messages), 422);
  }

  // Handle generic HTTP exceptions
  if (err instanceof HTTPException) {
    return c.json(createErrorResponse([err.message || 'HTTP Error']), err.status);
  }

  // Handle unknown errors
  const message = env.IS_PRODUCTION ? 'Internal server error' : err.message;
  return c.json(createErrorResponse([message]), 500);
};
