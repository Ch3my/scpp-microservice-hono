import { query } from './client';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

/**
 * Generic SELECT query with type inference
 */
export async function select<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  try {
    const [rows] = await query<RowDataPacket[]>(sql, params);
    return rows as T[];
  } catch (error) {
    console.error('Database SELECT error:', error);
    throw error;
  }
}

/**
 * INSERT query returning affected rows count
 */
export async function insert(sql: string, params: unknown[]): Promise<number> {
  try {
    const [result] = await query<ResultSetHeader>(sql, params);
    return result.affectedRows;
  } catch (error) {
    console.error('Database INSERT error:', error);
    throw error;
  }
}

/**
 * INSERT query returning the inserted ID
 */
export async function insertReturningId(sql: string, params: unknown[]): Promise<number> {
  try {
    const [result] = await query<ResultSetHeader>(sql, params);
    return result.insertId;
  } catch (error) {
    console.error('Database INSERT error:', error);
    throw error;
  }
}

/**
 * UPDATE query returning affected rows count
 */
export async function update(sql: string, params: unknown[]): Promise<number> {
  try {
    const [result] = await query<ResultSetHeader>(sql, params);
    return result.affectedRows;
  } catch (error) {
    console.error('Database UPDATE error:', error);
    throw error;
  }
}

/**
 * DELETE query returning affected rows count
 */
export async function deleteRow(sql: string, params: unknown[]): Promise<number> {
  try {
    const [result] = await query<ResultSetHeader>(sql, params);
    return result.affectedRows;
  } catch (error) {
    console.error('Database DELETE error:', error);
    throw error;
  }
}

/**
 * Execute a stored procedure
 */
export async function callProcedure<T = unknown>(
  procedureName: string,
  params: unknown[]
): Promise<T[]> {
  const placeholders = params.map(() => '?').join(', ');
  const sql = `CALL ${procedureName}(${placeholders})`;

  try {
    const [results] = await query<RowDataPacket[]>(sql, params);
    return results as T[];
  } catch (error) {
    console.error('Database PROCEDURE error:', error);
    throw error;
  }
}

/**
 * Execute raw SQL (for complex queries or DDL)
 */
export async function raw<T = unknown>(sql: string, params: unknown[] = []): Promise<T> {
  const [result] = await query<RowDataPacket[]>(sql, params);
  return result as T;
}
