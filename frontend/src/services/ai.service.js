import axios from 'axios';

const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000/api';

const aiApi = axios.create({
  baseURL: AI_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 12000, // 12s timeout for LLM generation
});

export const aiService = {
  /**
   * Calls the FastAPI AI microservice to generate 3 username suggestions.
   * @param {string[]} interests - Array of user interests (e.g. ['coding', 'music', 'gaming'])
   * @returns {Promise<string[]>} Array of 3 username suggestions
   */
  async suggestUsernames(interests) {
    try {
      const response = await aiApi.post('/suggest-username', { interests });
      return response.data.suggestions;
    } catch (error) {
      const normalizedError = {
        status: error.response?.status || 500,
        code: error.response?.data?.error?.code || 'AI_SERVICE_ERROR',
        message:
          error.response?.data?.error?.message ||
          error.message ||
          'Could not connect to the AI Username service. Ensure the FastAPI microservice is running.',
      };
      throw normalizedError;
    }
  },
};

