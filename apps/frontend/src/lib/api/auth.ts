import { api } from '../api';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  role: 'ADMIN' | 'MEMBER';
  isActive: boolean;
}

export interface Session {
  id: string;
  device: string | null;
  ipAddress: string | null;
  lastActivity: Date;
  createdAt: Date;
  isCurrent: boolean;
}

/**
 * Auth API service.
 * Handles user profile and sessions.
 */
export const authApi = {
  /**
   * Get current user profile.
   */
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/auth/me');
    return response.data;
  },

  /**
   * Update current user display name.
   */
  updateProfile: async (name: string): Promise<UserProfile> => {
    const response = await api.patch<UserProfile>('/auth/profile', { name });
    return response.data;
  },

  /**
   * Get active sessions.
   * JWT is stateless — returns the current session only.
   */
  getSessions: async (): Promise<Session[]> => {
    const response = await api.get<Session[]>('/auth/sessions');
    return response.data;
  },

  /**
   * Logout from all devices except current.
   * JWT is stateless — removes client token; other sessions expire naturally.
   */
  logoutAll: async (): Promise<{ success: boolean }> => {
    const response = await api.post<{ success: boolean }>('/auth/logout-all');
    return response.data;
  },
};
