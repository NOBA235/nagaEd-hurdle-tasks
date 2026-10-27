import api from './api';

/**
 * Authentication and User Service Layer.
 * Decouples API endpoints from UI components.
 */
export const authService = {
  /**
   * Registers a new user account.
   * @param {Object} data - { username, email, password, address }
   * @returns {Promise<Object>} API response data
   */
  async register(data) {
    const res = await api.post('/register', data);
    return res.data;
  },

  /**
   * Authenticates a user and receives JWT token and profile data.
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} API response data with token and user
   */
  async login(credentials) {
    const res = await api.post('/login', credentials);
    return res.data;
  },

  /**
   * Retrieves a user's profile by ID using the stored JWT token.
   * @param {number|string} userId
   * @returns {Promise<Object>} Safe user profile data
   */
  async getUserProfile(userId) {
    const res = await api.get(`/users/${userId}`);
    return res.data;
  },
};

