import {
  registerSchema,
  validateSchema,
} from '../schemas/auth.schema.js';
import { registerUser } from '../services/auth.service.js';
import { asyncHandler } from '../utils/async-handler.js';

/**
 * POST /api/register
 * Validates registration input, delegates user creation to auth.service,
 * and returns HTTP 201 Created with safe user fields.
 */
export const register = asyncHandler(async (req, res) => {
  const validatedInput = validateSchema(registerSchema, req.body);

  const user = await registerUser(validatedInput);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      address: user.address,
    },
  });
});

