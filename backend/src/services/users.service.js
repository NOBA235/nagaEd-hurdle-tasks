import { findUserById } from '../repositories/user.repository.js';
import { AppError } from '../utils/app-error.js';

/**
 * Retrieves a user profile by ID while enforcing strict ownership authorisation.
 * Users may only retrieve their own record.
 * Never returns password hashes.
 */
export async function getUserProfileById({ requestedUserId, authenticatedUser }) {
  // Authorisation rule: A user may only view their own user record
  if (authenticatedUser.id !== requestedUserId) {
    throw new AppError(
      403,
      'FORBIDDEN',
      'You are not authorised to access this user profile'
    );
  }

  const user = await findUserById(requestedUserId);

  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    address: user.address,
  };
}

