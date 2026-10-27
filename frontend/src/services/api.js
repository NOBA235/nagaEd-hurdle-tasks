import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Configured Axios instance with Bearer token authentication
 * and centralized response/error parsing.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request Interceptor: Attach JWT Bearer Token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nagaed_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Normalize responses and handle 401 token expiry
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Clear expired or invalidated session
      localStorage.removeItem('nagaed_token');
      localStorage.removeItem('nagaed_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    const normalizedError = {
      status: error.response?.status || 500,
      code: error.response?.data?.error?.code || 'NETWORK_ERROR',
      message:
        error.response?.data?.error?.message ||
        error.message ||
        'Unable to connect to the backend service. Please check your network.',
      details: error.response?.data?.error?.details || [],
    };

    return Promise.reject(normalizedError);
  }
);

export default api;

