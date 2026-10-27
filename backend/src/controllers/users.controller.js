import {
  userIdParamSchema,
  validateSchema,
} from '../schemas/auth.schema.js';
import { getUserProfileById } from '../services/users.service.js';
import { asyncHandler } from '../utils/async-handler.js';

/**
 * GET /api/users/:id
 * Retrieves the requested user profile after validating the id route parameter
 * and enforcing resource ownership via users.service.
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const validatedParams = validateSchema(userIdParamSchema, req.params);

  const user = await getUserProfileById({
    requestedUserId: validatedParams.id,
    authenticatedUser: req.user,
  });

  res.status(200).json({
    success: true,
    message: 'User profile retrieved successfully',
    data: user,
  });
});

