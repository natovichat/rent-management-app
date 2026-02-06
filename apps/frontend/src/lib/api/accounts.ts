import { api } from '../api';

export interface Account {
  id: string;
  name: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

/**
 * Accounts API service.
 * Used for fetching all accounts for the account selector.
 */
export const accountsApi = {
  /**
   * Get all accounts.
   * Used by account selector to display all available accounts.
   */
  findAll: async (): Promise<Account[]> => {
    const response = await api.get<Account[]>('/accounts');
    return response.data;
  },
};
