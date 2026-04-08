import axios from 'axios';

/**
 * Shared HTTP client with sensible defaults
 *
 * - 15s timeout prevents hanging on unresponsive Zoom API
 * - Retry logic can be added here if needed
 */
export const httpClient = axios.create({
  timeout: 15000, // 15 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Optional: Add request/response interceptors for logging or retry logic
 *
 * Example retry interceptor:
 * httpClient.interceptors.response.use(
 *   response => response,
 *   async error => {
 *     if (error.code === 'ECONNABORTED' || error.response?.status >= 500) {
 *       // Retry logic here
 *     }
 *     return Promise.reject(error);
 *   }
 * );
 */
