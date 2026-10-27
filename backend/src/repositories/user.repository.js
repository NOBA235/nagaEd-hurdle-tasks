import { pool } from '../config/database.js';

/**
 * Looks up a single user record by normalised email address.
 * Uses a parameterised prepared statement (?) to prevent SQL injection.
 */
export async function findUserByEmail(email) {
  const [rows] = await pool.execute(
    `SELECT id, username, email, password_hash, address, created_at, updated_at
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [email]
  );

  return rows[0] || null;
}

/**
 * Inserts a newly registered user into MySQL and returns only safe public fields.
 * Plaintext passwords must never be passed to this repository function.
 */
export async function createUser({ username, email, passwordHash, address }) {
  const [result] = await pool.execute(
    `INSERT INTO users (username, email, password_hash, address)
     VALUES (?, ?, ?, ?)`,
    [username, email, passwordHash, address]
  );

  return {
    id: result.insertId,
    username,
    email,
    address,
  };
}

