import { api } from '../api';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'OWNER' | 'USER';
  accountId: string;
  account?: {
    id: string;
    name: string;
    status: string;
  };
}

export interface UserPreferences {
  language: string;
  dateFormat: string;
  currency: string;
  theme: string;
}

export interface UpdatePreferencesDto {
  language?: string;
  dateFormat?: string;
  currency?: string;
  theme?: string;
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
 * Handles user profile, account settings, preferences, and sessions.
 */
export const authApi = {
  /**
   * Get current user profile.
   */
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/auth/profile');
    return response.data;
  },

  /**
   * Update user profile (name only).
   */
  updateProfile: async (name: string): Promise<UserProfile> => {
    const response = await api.patch<UserProfile>('/auth/profile', { name });
    return response.data;
  },

  /**
   * Update account settings (OWNER only).
   */
  updateAccount: async (name: string): Promise<{ id: string; name: string; status: string }> => {
    const response = await api.patch('/auth/account', { name });
    return response.data;
  },

  /**
   * Get user preferences.
   */
  getPreferences: async (): Promise<UserPreferences> => {
    const response = await api.get<UserPreferences>('/auth/preferences');
    return response.data;
  },

  /**
   * Update user preferences.
   */
  updatePreferences: async (preferences: UpdatePreferencesDto): Promise<UserPreferences> => {
    const response = await api.put<UserPreferences>('/auth/preferences', preferences);
    return response.data;
  },

  /**
   * Get active sessions.
   */
  getSessions: async (): Promise<Session[]> => {
    const response = await api.get<Session[]>('/auth/sessions');
    return response.data;
  },

  /**
   * Logout from all devices except current.
   */
  logoutAll: async (): Promise<{ success: boolean }> => {
    const response = await api.post<{ success: boolean }>('/auth/logout-all');
    return response.data;
  },
};
