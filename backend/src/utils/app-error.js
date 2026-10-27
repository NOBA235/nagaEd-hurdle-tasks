/**
 * Custom operational error class for predictable HTTP error responses.
 * Separating operational errors (e.g., 400 Validation, 401 Unauthorised, 409 Conflict)
 * from unexpected programming/database crashes allows the central error handler
 * to never leak sensitive internal details on 500 errors.
 */
export class AppError extends Error {
  constructor(statusCode, code, message, details = []) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

