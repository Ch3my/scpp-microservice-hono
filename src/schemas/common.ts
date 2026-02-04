import { z } from '@hono/zod-openapi';

/**
 * Standard success response for mutations
 */
export const successResponseSchema = z
  .object({
    success: z.literal(true),
    successDescription: z.array(z.string()),
  })
  .openapi('SuccessResponse');

/**
 * Login success response (includes sessionHash)
 */
export const loginSuccessResponseSchema = z
  .object({
    success: z.literal(true),
    successDescription: z.array(z.string()),
    sessionHash: z.string(),
  })
  .openapi('LoginSuccessResponse');

/**
 * Standard error response
 */
export const errorResponseSchema = z
  .object({
    hasErrors: z.literal(true),
    errorDescription: z.array(z.string()),
  })
  .openapi('ErrorResponse');

/**
 * Session hash validation (query parameter)
 */
export const sessionQuerySchema = z.object({
  sessionHash: z.string().min(1, 'Session hash is required'),
});

/**
 * Session hash validation (body parameter)
 */
export const sessionBodySchema = z.object({
  sessionHash: z.string().min(1, 'Session hash is required'),
});

// Type exports for use in handlers
export type SuccessResponse = z.infer<typeof successResponseSchema>;
export type LoginSuccessResponse = z.infer<typeof loginSuccessResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
