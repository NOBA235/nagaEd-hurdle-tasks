import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';

/**
 * Express middleware that verifies a Bearer JWT from the Authorization header.
 * Populates req.user = { id, username, email } when valid, or throws HTTP 401.
 */
export function authenticate(req, _res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(
      new AppError(
        401,
        'UNAUTHORIZED',
        'Authentication required: missing Authorization header'
      )
    );
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1].trim()) {
    return next(
      new AppError(
        401,
        'UNAUTHORIZED',
        'Invalid Authorization header format. Expected: Bearer <token>'
      )
    );
  }

  const token = parts[1].trim();

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ['HS256'],
    });

    const userId = Number(decoded.id ?? decoded.sub);
    if (!Number.isInteger(userId) || userId <= 0) {
      return next(
        new AppError(401, 'INVALID_TOKEN', 'Invalid authentication token payload')
      );
    }

    req.user = {
      id: userId,
      username: decoded.username,
      email: decoded.email,
    };

    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(
        new AppError(401, 'TOKEN_EXPIRED', 'Authentication token has expired')
      );
    }

    return next(
      new AppError(
        401,
        'INVALID_TOKEN',
        'Invalid or malformed authentication token'
      )
    );
  }
}
