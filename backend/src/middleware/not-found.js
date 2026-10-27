/**
 * 404 Not Found Middleware.
 * Catches any HTTP requests that do not match defined routes and returns
 * a standardized JSON error response.
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
      details: [],
    },
  });
}

