import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';

/**
 * Centralised Express Error Handling Middleware.
 * Catches all errors forwarded by next(err), formats them into the standard
 * JSON response structure, and shields sensitive details in production.
 */
export function errorHandler(err, _req, res, _next) {
  // 1. JSON parsing syntax errors (e.g. malformed JSON body)
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

  // 2. Operational AppError (validation, auth, duplicate entry, not found, etc.)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  // 3. MySQL duplicate entry error safety net (in case repository threw directly)
  if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
    return res.status(409).json({
      success: false,
      error: {
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'An account with this email address already exists',
        details: [],
      },
    });
  }

  // 4. Unexpected server/programming errors (500)
  const isProduction = env.NODE_ENV === 'production';
  const statusCode = err.statusCode || 500;

  // Never leak sensitive internals or database credentials in production responses
  const message =
    isProduction && statusCode === 500
      ? 'An unexpected internal error occurred'
      : err.message || 'An unexpected internal error occurred';

  if (!isProduction) {
    console.error('[Unhandled Error]', err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message,
      details: err.details || [],
    },
  });
}

