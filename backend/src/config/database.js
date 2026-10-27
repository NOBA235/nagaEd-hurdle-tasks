import mysql from 'mysql2/promise';
import { env } from './env.js';

/**
 * Shared MySQL 8 connection pool.
 * Reuses established TCP/MySQL connections across concurrent HTTP requests
 * instead of opening and tearing down a new connection per query.
 */
export const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: env.DB_CONNECTION_LIMIT,
  maxIdle: env.DB_CONNECTION_LIMIT,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  timezone: 'Z',
});

/**
 * Acquires a connection from the pool, pings MySQL to confirm credentials
 * and database existence, and releases the connection back to the pool.
 */
export async function verifyDatabaseConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.ping();
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

/**
 * Gracefully drains and closes all connections in the pool.
 */
export async function closeDatabasePool() {
  await pool.end();
}

