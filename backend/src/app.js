import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';

const app = express();

// 1. Security Headers (Helmet sets Content-Security-Policy, X-Content-Type-Options, etc. and removes X-Powered-By)
app.use(helmet());

// 2. Cross-Origin Resource Sharing (CORS)
const allowedOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim());
app.use(
  cors({
    origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// 3. Body Parser with strict payload size limit (10 KB prevents large-payload DoS)
app.use(express.json({ limit: '10kb' }));

// 4. Health Check Endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    data: {
      status: 'ok',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });
});

// 5. API Routes
app.use('/api', authRoutes);
app.use('/api/users', usersRoutes);

// 6. Fallback 404 Handler (will be moved to src/middleware/not-found.js in Phase 6)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
      details: [],
    },
  });
});

// 7. Basic Error Handler (will be expanded in src/middleware/error-handler.js in Phase 6)
app.use((err, _req, res, _next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Malformed JSON in request body',
        details: [],
      },
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message:
        env.NODE_ENV === 'production' && statusCode === 500
          ? 'An unexpected internal error occurred'
          : err.message || 'An unexpected internal error occurred',
      details: err.details || [],
    },
  });
});

export default app;
