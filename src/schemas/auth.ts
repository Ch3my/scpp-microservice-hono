import { z } from '@hono/zod-openapi';

/**
 * Login request body
 */
export const loginBodySchema = z
  .object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
  })
  .openapi('LoginRequest');

/**
 * Logout request body (empty - sessionHash now passed via Authorization header)
 */
export const logoutBodySchema = z.object({}).openapi('LogoutRequest');

/**
 * Check session header schema
 * Expects Authorization: Bearer <sessionHash>
 */
export const checkSessionHeaderSchema = z.object({
  authorization: z.string().min(1, 'Authorization header is required'),
});

// Type exports
export type LoginBody = z.infer<typeof loginBodySchema>;
export type CheckSessionHeader = z.infer<typeof checkSessionHeaderSchema>;
