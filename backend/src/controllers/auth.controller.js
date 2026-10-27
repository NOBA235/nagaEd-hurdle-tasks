import {
  registerSchema,
  loginSchema,
  validateSchema,
} from '../schemas/auth.schema.js';
import { registerUser, loginUser } from '../services/auth.service.js';
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

/**
 * POST /api/login
 * Validates login credentials, verifies user password, and returns HTTP 200 OK
 * with a signed JWT and safe user profile data.
 */
export const login = asyncHandler(async (req, res) => {
  const validatedInput = validateSchema(loginSchema, req.body);

  const result = await loginUser(validatedInput);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      token: result.token,
      user: result.user,
    },
  });
});
