import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import {
  findUserByEmail,
  createUser,
} from '../repositories/user.repository.js';
import { AppError } from '../utils/app-error.js';

// Pre-computed hash used when an email does not exist so bcrypt.compare() still runs,
// preventing timing-based user enumeration side-channel attacks.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync(
  'timing_mitigation_placeholder_secret',
  env.BCRYPT_SALT_ROUNDS
);

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

/**
 * Authenticates a user by email and password, then issues a signed JWT.
 * Returns a generic HTTP 401 on failure without revealing whether the email exists.
 */
export async function loginUser({ email, password }) {
  const normalisedEmail = email.trim().toLowerCase();

  const user = await findUserByEmail(normalisedEmail);

  const hashToCompare = user ? user.password_hash : DUMMY_PASSWORD_HASH;
  const isPasswordValid = await bcrypt.compare(password, hashToCompare);

  if (!user || !isPasswordValid) {
    throw new AppError(
      401,
      'INVALID_CREDENTIALS',
      'Invalid email or password'
    );
  }

  const payload = {
    sub: String(user.id),
    id: user.id,
    username: user.username,
    email: user.email,
  };

  const token = jwt.sign(payload, env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: env.JWT_EXPIRES_IN,
  });

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      address: user.address,
    },
  };
}
