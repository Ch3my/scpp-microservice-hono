import { select, insert, deleteRow } from '../db/repository';

interface SessionCount {
  total: number;
}

interface User {
  id: number;
  emailAddress: string;
}

/**
 * Session service for authentication and session management
 */
export const sessionService = {
  /**
   * Validate a session hash
   */
  async validate(sessionHash: string): Promise<boolean> {
    if (!sessionHash) {
      return false;
    }

    try {
      const query = 'SELECT COUNT(*) as total FROM sessions WHERE sessionHash = ?';
      const result = await select<SessionCount>(query, [sessionHash]);

      const total = result[0]?.total || 0;
      return total >= 1;
    } catch (error) {
      console.error('Error checking session:', error);
      return false;
    }
  },

  /**
   * Create a new session for a user
   */
  async create(userId: number): Promise<string> {
    const sessionHash = generateSessionHash();
    const query = 'INSERT INTO sessions (fk_user, sessionHash) VALUES (?, ?)';
    await insert(query, [userId, sessionHash]);
    return sessionHash;
  },

  /**
   * Delete a session (logout)
   */
  async delete(sessionHash: string): Promise<boolean> {
    const query = 'DELETE FROM sessions WHERE sessionHash = ?';
    const affectedRows = await deleteRow(query, [sessionHash]);
    return affectedRows >= 1;
  },

  /**
   * Authenticate user by credentials
   * Returns user if found, null otherwise
   */
  async authenticateUser(username: string, password: string): Promise<User | null> {
    const ENCRYPT_PASSWORD = 'w8=5AWWXWUpEUa6?NK6Wh-kJ9E2RPvsR';

    const query = `
      SELECT id, emailAddress
      FROM user
      WHERE emailAddress = ?
      AND password = AES_ENCRYPT(?, ?)
    `;

    const result = await select<User>(query, [username, password, ENCRYPT_PASSWORD]);
    return result[0] || null;
  },
};

/**
 * Generate a random session hash
 * Matches old-app format: 24 character alphanumeric string
 */
function generateSessionHash(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
