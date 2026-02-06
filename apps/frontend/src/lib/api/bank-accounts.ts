import { api } from '../api';

export interface BankAccount {
  id: string;
  accountId: string;
  bankName: string;
  branchNumber?: string;
  accountNumber: string;
  accountType: 'CHECKING' | 'SAVINGS' | 'BUSINESS';
  accountHolder?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBankAccountDto {
  bankName: string;
  branchNumber?: string;
  accountNumber: string;
  accountType?: 'CHECKING' | 'SAVINGS' | 'BUSINESS';
  accountHolder?: string;
  notes?: string;
  isActive?: boolean;
}

export interface UpdateBankAccountDto extends Partial<CreateBankAccountDto> {}

export const bankAccountsApi = {
  /**
   * Get all bank accounts
   */
  getBankAccounts: async (activeOnly?: boolean): Promise<BankAccount[]> => {
    const params = activeOnly ? { activeOnly: 'true' } : {};
    const response = await api.get<BankAccount[]>('/bank-accounts', { params });
    return response.data;
  },

  /**
   * Get bank account by ID
   */
  getBankAccount: async (id: string): Promise<BankAccount> => {
    const response = await api.get<BankAccount>(`/bank-accounts/${id}`);
    return response.data;
  },

  /**
   * Create new bank account
   */
  createBankAccount: async (data: CreateBankAccountDto): Promise<BankAccount> => {
    const response = await api.post<BankAccount>('/bank-accounts', data);
    return response.data;
  },

  /**
   * Update bank account
   */
  updateBankAccount: async (id: string, data: UpdateBankAccountDto): Promise<BankAccount> => {
    const response = await api.patch<BankAccount>(`/bank-accounts/${id}`, data);
    return response.data;
  },

  /**
   * Delete bank account
   */
  deleteBankAccount: async (id: string): Promise<void> => {
    await api.delete(`/bank-accounts/${id}`);
  },

  /**
   * Deactivate bank account
   */
  deactivateBankAccount: async (id: string): Promise<BankAccount> => {
    const response = await api.patch<BankAccount>(`/bank-accounts/${id}/deactivate`);
    return response.data;
  },

  /**
   * Activate bank account
   */
  activateBankAccount: async (id: string): Promise<BankAccount> => {
    const response = await api.patch<BankAccount>(`/bank-accounts/${id}/activate`);
    return response.data;
  },

  /**
   * Get mortgages using this bank account
   */
  getMortgagesUsingAccount: async (id: string) => {
    const response = await api.get(`/bank-accounts/${id}/mortgages`);
    return response.data;
  },
};

/**
 * Helper to format bank account for display
 */
export const formatBankAccountDisplay = (account: BankAccount): string => {
  return account.branchNumber
    ? `${account.bankName} - ${account.branchNumber}/${account.accountNumber}`
    : `${account.bankName} - ${account.accountNumber}`;
};
