import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3001', // Hardcoded for testing - backend is on 3001
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// AUTOMATIC ACCOUNT ID INJECTION
// ============================================================================
// This interceptor automatically adds accountId to all API requests from localStorage
// No need to manually pass accountId anymore - it's handled globally!
// ============================================================================

const ACCOUNT_STORAGE_KEY = 'selectedAccountId';

/**
 * Request interceptor - Automatically add accountId and auth token to requests.
 * 
 * - Adds accountId as X-Account-Id header for ALL requests (for development mode)
 * - Adds JWT token as Authorization header for auth endpoints
 * 
 * The backend JWT guard reads X-Account-Id header for authentication bypass in development mode.
 * This eliminates the need to manually pass accountId in every API call.
 */
api.interceptors.request.use(
  (config) => {
    if (typeof window === 'undefined') {
      return config;
    }

    // Add accountId as header for ALL requests (development mode)
    const accountId = localStorage.getItem(ACCOUNT_STORAGE_KEY);
    if (accountId) {
      config.headers['X-Account-Id'] = accountId;
    }

    // Add JWT token for auth endpoints
    const token = localStorage.getItem('auth_token');
    if (token) {
      // For auth endpoints, use JWT token
      if (config.url?.startsWith('/auth')) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
