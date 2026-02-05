import mysql, {
  type Pool,
  type PoolConnection,
  type FieldPacket,
  type RowDataPacket,
  type ResultSetHeader,
} from 'mysql2/promise';
import { env } from '../config/env';

/**
 * Retryable error codes for database connections
 */
const RETRYABLE_ERRORS = new Set([
  'PROTOCOL_CONNECTION_LOST',
  'ECONNRESET',
  'ETIMEDOUT',
  'ECONNREFUSED',
  'EPIPE',
  'ER_LOCK_WAIT_TIMEOUT',
]);

/**
 * Custom type casting for MariaDB/MySQL
 * Ensures consistent type conversion matching the old-app behavior
 */
const typeCast: mysql.TypeCast = (field, next) => {
  // Convert TINYINT(1) to boolean
  if (field.type === 'TINY' && field.length === 1) {
    return field.string() === '1';
  }

  // Convert integers to numbers
  if (['LONGLONG', 'LONG', 'INT24', 'SHORT'].includes(field.type)) {
    const value = field.string();
    return value === null ? null : Number.parseInt(value, 10);
  }

  // Convert decimals and floats to numbers
  if (['NEWDECIMAL', 'FLOAT', 'DOUBLE'].includes(field.type)) {
    const value = field.string();
    return value === null ? null : Number.parseFloat(value);
  }

  return next();
};

/**
 * Create the database connection pool
 */
const createPool = (): Pool => {
  const pool = mysql.createPool({
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    port: env.DB_PORT,
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
    typeCast,
  });

  console.log({
    message: 'Database pool created',
    host: env.DB_HOST,
    database: env.DB_NAME,
    port: env.DB_PORT,
  });

  return pool;
};

/**
 * Database pool instance
 */
export const db = createPool();

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Check if an error is retryable
 */
const isRetryableError = (error: unknown): boolean => {
  if (error && typeof error === 'object' && 'code' in error) {
    return RETRYABLE_ERRORS.has(error.code as string);
  }
  return false;
};

/**
 * Execute a query with automatic retry logic
 */
export async function query<T extends RowDataPacket[] | ResultSetHeader = RowDataPacket[]>(
  sql: string,
  params: unknown[] = []
): Promise<[T, FieldPacket[]]> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= env.DB_MAX_RETRIES; attempt++) {
    try {
      const result = await db.query<T>(sql, params);
      return result;
    } catch (error) {
      lastError = error as Error;

      if (isRetryableError(error) && attempt < env.DB_MAX_RETRIES) {
        console.log(
          `Database connection error (attempt ${attempt}/${env.DB_MAX_RETRIES}). ` +
            `Retrying in ${env.DB_RETRY_DELAY}ms...`
        );
        await sleep(env.DB_RETRY_DELAY);
      } else {
        throw error;
      }
    }
  }

  throw lastError || new Error('Failed to execute query after multiple retries');
}

/**
 * Execute a query and return just the rows
 */
export async function execute<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
  const [rows] = await query(sql, params);
  return rows as T[];
}

/**
 * Get a connection from the pool for transactions
 */
export async function getConnection(): Promise<PoolConnection> {
  return db.getConnection();
}

/**
 * Health check for the database
 */
export async function healthCheck(): Promise<boolean> {
  try {
    await execute('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

/**
 * Close the database pool
 */
export async function closePool(): Promise<void> {
  await db.end();
  console.log('Database pool closed');
}
