import { z } from 'zod';
import { AppError } from '../utils/app-error.js';

export const registerSchema = z.object({
  username: z
    .string({ error: 'Username is required and must be a string' })
    .trim()
    .min(2, 'Username must be at least 2 characters long')
    .max(100, 'Username must not exceed 100 characters'),

  email: z
    .string({ error: 'Email is required and must be a string' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address')
    .max(255, 'Email must not exceed 255 characters'),

  password: z
    .string({ error: 'Password is required and must be a string' })
    .min(8, 'Password must be at least 8 characters long')
    .max(
      72,
      'Password must not exceed 72 characters (bcrypt maximum input length)'
    ),

  address: z
    .string({ error: 'Address is required and must be a string' })
    .trim()
    .min(2, 'Address must be at least 2 characters long')
    .max(255, 'Address must not exceed 255 characters'),
});

export const loginSchema = z.object({
  email: z
    .string({ error: 'Email is required and must be a string' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address')
    .max(255, 'Email must not exceed 255 characters'),

  password: z
    .string({ error: 'Password is required and must be a string' })
    .min(1, 'Password is required')
    .max(72, 'Password must not exceed 72 characters'),
});

export const userIdParamSchema = z.object({
  id: z.coerce
    .number({ error: 'User ID parameter must be a valid number' })
    .int('User ID must be an integer')
    .positive('User ID must be a positive integer'),
});

/**
 * Validates and normalises a payload against a Zod schema.
 * Throws a standardised HTTP 400 AppError if validation fails.
 */
export function validateSchema(schema, payload) {
  const result = schema.safeParse(payload ?? {});

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.') || 'body',
      message: issue.message,
    }));

    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid request data', details);
  }

  return result.data;
}
