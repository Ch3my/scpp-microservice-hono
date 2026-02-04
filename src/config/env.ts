/**
 * Environment configuration with type safety
 * Bun automatically loads .env files
 */
export const env = {
  // Server
  PORT: Number.parseInt(Bun.env.PORT || '3000', 10),

  // Database
  DB_HOST: Bun.env.DB_HOST!,
  DB_USER: Bun.env.DB_USER!,
  DB_PASSWORD: Bun.env.DB_PASSWORD!,
  DB_NAME: Bun.env.DB_NAME!,
  DB_PORT: Number.parseInt(Bun.env.DB_PORT || '3306', 10),

  // Retry configuration
  DB_MAX_RETRIES: Number.parseInt(Bun.env.DB_MAX_RETRIES || '5', 10),
  DB_RETRY_DELAY: Number.parseInt(Bun.env.DB_RETRY_DELAY || '1500', 10),

  // Logging
  LOG_ENDPOINTS: Bun.env.LOG_ENDPOINTS === 'true',
  DEBUG_RESPONSES: Bun.env.DEBUG_RESPONSES === 'true',

  // Environment
  NODE_ENV: Bun.env.NODE_ENV || 'development',
  IS_PRODUCTION: Bun.env.NODE_ENV === 'production',
} as const;

// Type for the env object
export type Env = typeof env;
