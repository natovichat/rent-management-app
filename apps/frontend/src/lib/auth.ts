/**
 * Authentication utilities for Google OAuth flow.
 * 
 * Handles:
 * - Google OAuth login redirect
 * - Token storage and retrieval
 * - Authentication state checks
 * - Logout functionality
 */

const TOKEN_KEY = 'auth_token';

/**
 * Get Google OAuth URL from environment variables.
 */
const getGoogleOAuthUrl = (): string => {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || 
    `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`;
  
  if (!clientId) {
    throw new Error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

/**
 * Initiate Google OAuth login flow.
 * Redirects user to Google OAuth consent screen.
 */
export const login = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  const authUrl = getGoogleOAuthUrl();
  window.location.href = authUrl;
};

/**
 * Handle OAuth callback and store token.
 * 
 * @param token - JWT token received from backend after OAuth callback
 */
export const handleCallback = (token: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Logout user by clearing stored token.
 */
export const logout = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  localStorage.removeItem(TOKEN_KEY);
  
  // Redirect to home page
  window.location.href = '/';
};

/**
 * Check if user is authenticated.
 * 
 * @returns true if token exists and is not expired
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  // DEVELOPMENT MODE: Skip authentication check
  if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
    console.log('🔧 DEV MODE: Bypassing authentication');
    return true;
  }
  
  const token = getToken();
  if (!token) {
    return false;
  }
  
  // Basic token validation - check if it's a valid JWT format
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }
    
    // Decode payload to check expiration
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    if (payload.exp && payload.exp < now) {
      // Token expired, remove it
      localStorage.removeItem(TOKEN_KEY);
      return false;
    }
    
    return true;
  } catch {
    // Invalid token format
    localStorage.removeItem(TOKEN_KEY);
    return false;
  }
};

/**
 * Get stored authentication token.
 * 
 * @returns JWT token or null if not found
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Set authentication token in localStorage.
 * 
 * @param token - JWT token to store
 */
export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  localStorage.setItem(TOKEN_KEY, token);
};
