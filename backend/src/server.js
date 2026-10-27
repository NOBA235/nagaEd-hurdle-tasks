import app from './app.js';
import { env } from './config/env.js';

const server = app.listen(env.PORT, () => {
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

// Graceful shutdown handler (MySQL pool closing will be added in Phase 2)
let isShuttingDown = false;

function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);

  server.close((err) => {
    if (err) {
      console.error('[Server] Error during HTTP server closure:', err.message);
      process.exit(1);
    }
    console.log('[Server] HTTP server closed cleanly.');
    process.exit(0);
  });

  // Force exit if connections hang longer than 10 seconds
  setTimeout(() => {
    console.error('[Server] Forced shutdown after 10s timeout.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

