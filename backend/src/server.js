import app from './app.js';
import { env } from './config/env.js';
import {
  verifyDatabaseConnection,
  closeDatabasePool,
} from './config/database.js';

let server;
let isShuttingDown = false;

async function startServer() {
  try {
    await verifyDatabaseConnection();
    console.log(
      `[Database] Connected to MySQL database "${env.DB_NAME}" at ${env.DB_HOST}:${env.DB_PORT}`
    );

    server = app.listen(env.PORT, () => {
      console.log(
        `[Server] Running in ${env.NODE_ENV} mode on http://localhost:${env.PORT}`
      );
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(
          `[Server Error] Port ${env.PORT} is already in use. Stop the other process or change PORT in .env.`
        );
      } else {
        console.error('[Server Error] Failed to start server:', error.message);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error(
      `[Database Error] Failed to connect to MySQL (${error.code || 'UNKNOWN'}): ${error.message}`
    );

    if (error.code === 'ECONNREFUSED') {
      console.error(
        `  -> Hint: Ensure MySQL 8 Server is installed and running on ${env.DB_HOST}:${env.DB_PORT}.`
      );
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error(
        `  -> Hint: Check DB_USER and DB_PASSWORD in your backend/.env file.`
      );
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error(
        `  -> Hint: Database "${env.DB_NAME}" does not exist yet. Run sql/schema.sql first.`
      );
    }

    process.exit(1);
  }
}

function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);

  const forceExitTimer = setTimeout(() => {
    console.error('[Server] Forced shutdown after 10s timeout.');
    process.exit(1);
  }, 10000);
  forceExitTimer.unref();

  if (server) {
    server.close(async (err) => {
      if (err) {
        console.error('[Server] Error during HTTP server closure:', err.message);
        process.exit(1);
      }
      console.log('[Server] HTTP server closed cleanly.');

      try {
        await closeDatabasePool();
        console.log('[Database] MySQL connection pool closed cleanly.');
        process.exit(0);
      } catch (poolError) {
        console.error(
          '[Database] Error closing MySQL connection pool:',
          poolError.message
        );
        process.exit(1);
      }
    });
  } else {
    closeDatabasePool()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

startServer();
