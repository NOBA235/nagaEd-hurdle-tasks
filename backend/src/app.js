import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import { notFoundHandler } from './middleware/not-found.js';
import { errorHandler } from './middleware/error-handler.js';

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

// 6. 404 Route Not Found Middleware
app.use(notFoundHandler);

// 7. Centralised Error Handling Middleware
app.use(errorHandler);

export default app;
