import type { Context } from 'hono';

/**
 * Custom variables available in Hono context
 */
export interface AppVariables {
  requestId: string;
  sessionHash?: string;
  startTime: number;
}

/**
 * App context type with custom variables
 */
export type AppContext = Context<{ Variables: AppVariables }>;

/**
 * Environment bindings (if needed for Cloudflare Workers, etc.)
 */
export interface AppBindings {
  // Add any bindings here if deploying to Cloudflare Workers
}

/**
 * Full app environment type
 */
export interface AppEnv {
  Bindings: AppBindings;
  Variables: AppVariables;
}
