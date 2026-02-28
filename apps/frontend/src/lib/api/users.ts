import { api } from '../api';

export interface UserDto {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  role: 'ADMIN' | 'MEMBER';
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export const usersApi = {
  /**
   * List all users (admin only).
   */
  list(): Promise<UserDto[]> {
    return api.get<UserDto[]>('/users').then((r) => r.data);
  },

  /**
   * Add an email to the whitelist (admin only).
   */
  addUser(email: string, role: 'ADMIN' | 'MEMBER' = 'MEMBER'): Promise<UserDto> {
    return api.post<UserDto>('/users', { email, role }).then((r) => r.data);
  },

  /**
   * Update user active status or role (admin only).
   */
  updateUser(
    id: string,
    patch: { isActive?: boolean; role?: 'ADMIN' | 'MEMBER' },
  ): Promise<UserDto> {
    return api.patch<UserDto>(`/users/${id}`, patch).then((r) => r.data);
  },

  /**
   * Remove a user from the whitelist (admin only).
   */
  removeUser(id: string): Promise<void> {
    return api.delete(`/users/${id}`).then(() => undefined);
  },
};
