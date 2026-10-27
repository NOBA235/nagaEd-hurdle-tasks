/**
 * Wraps an async Express route handler or middleware so any rejected Promise
 * is automatically passed to next(err) and handled by the central error middleware.
 */
export function asyncHandler(fn) {
  return function wrappedAsyncHandler(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

