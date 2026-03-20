/**
 * Authentication utilities for Google OAuth flow.
 *
 * Handles:
 * - Google OAuth login redirect (via backend)
 * - Token storage and retrieval
 * - Authentication state checks
 * - User profile caching
 * - Logout functionality
 */

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  role: 'ADMIN' | 'MEMBER';
  isActive: boolean;
}

/**
 * Get the backend API base URL.
 */
const getApiBaseUrl = (): string => {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    'https://rent-app-backend-33ifaayi2a-uc.a.run.app'
  );
};

/**
 * Initiate Google OAuth login flow via backend redirect.
 */
export const login = (): void => {
  if (typeof window === 'undefined') return;
  const apiUrl = getApiBaseUrl();
  window.location.href = `${apiUrl}/api/auth/google`;
};

/**
 * Handle OAuth callback: store token and user info.
 */
export const handleCallback = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Store user profile in localStorage.
 */
export const setUserProfile = (user: UserProfile): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Get cached user profile from localStorage.
 */
export const getUserProfile = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
};

/**
 * Logout user by clearing stored token and profile.
 */
export const logout = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = '/login';
};

/**
 * Check if user is authenticated (token exists and is not expired).
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;

  const token = getToken();
  if (!token) return false;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return false;
    }

    return true;
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return false;
  }
};

/**
 * Get stored authentication token.
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Set authentication token in localStorage.
 */
export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
};
