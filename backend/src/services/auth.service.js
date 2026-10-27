import bcrypt from 'bcrypt';
import { env } from '../config/env.js';
import {
  findUserByEmail,
  createUser,
} from '../repositories/user.repository.js';
import { AppError } from '../utils/app-error.js';

/**
 * Registers a new user account:
 * 1. Rejects duplicate emails (pre-check + database unique constraint fallback).
 * 2. Hashes the plaintext password using bcrypt with configured salt rounds.
 * 3. Stores only the bcrypt hash in MySQL and returns safe public user fields.
 */
export async function registerUser({ username, email, password, address }) {
  const normalisedEmail = email.trim().toLowerCase();

  const existingUser = await findUserByEmail(normalisedEmail);
  if (existingUser) {
    throw new AppError(
      409,
      'EMAIL_ALREADY_EXISTS',
      'An account with this email address already exists'
    );
  }

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);

  try {
    const newUser = await createUser({
      username,
      email: normalisedEmail,
      passwordHash,
      address,
    });

    return newUser;
  } catch (error) {
    // Handle concurrent race condition caught by MySQL UNIQUE constraint (uq_users_email)
    if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
      throw new AppError(
        409,
        'EMAIL_ALREADY_EXISTS',
        'An account with this email address already exists'
      );
    }
    throw error;
  }
}

