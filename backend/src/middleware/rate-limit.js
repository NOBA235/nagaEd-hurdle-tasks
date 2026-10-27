import { AppError } from '../utils/app-error.js';
import { env } from '../config/env.js';

/**
 * Lightweight in-memory sliding-window rate limiter for authentication routes.
 */
export function createRateLimiter({ windowMs = 15 * 60 * 1000, maxRequests = 30 } = {}) {
  const hits = new Map();

  return function rateLimiter(req, _res, next) {
    if (env.NODE_ENV === 'test') {
      return next();
    }

    const now = Date.now();
    const key = req.ip || req.socket?.remoteAddress || 'unknown';
    const record = hits.get(key);

    if (!record || now - record.startTime > windowMs) {
      hits.set(key, { count: 1, startTime: now });
      return next();
    }

    record.count += 1;
    if (record.count > maxRequests) {
      return next(
        new AppError(
          'Too many authentication attempts from this IP, please try again later.',
          429,
          'RATE_LIMIT_EXCEEDED'
        )
      );
    }

    return next();
  };
}
