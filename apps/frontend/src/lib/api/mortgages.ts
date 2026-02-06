import { api } from '../api';

export interface MortgagePayment {
  id: string;
  mortgageId: string;
  amount: number;
  paymentDate: string;
  notes?: string;
  createdAt: string;
}

export interface Mortgage {
  id: string;
  accountId: string;
  propertyId: string;
  bank: string;
  loanAmount: number;
  interestRate?: number;
  monthlyPayment?: number;
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'PAID_OFF' | 'REFINANCED' | 'DEFAULTED';
  bankAccountId?: string;
  linkedProperties?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  payments?: MortgagePayment[];
  property?: {
    id: string;
    address: string;
    fileNumber?: string;
  };
  bankAccount?: {
    id: string;
    bankName: string;
    branchNumber?: string;
    accountNumber: string;
    accountType: string;
  };
}

export interface CreateMortgageDto {
  propertyId: string;
  bank: string;
  loanAmount: number;
  interestRate?: number;
  monthlyPayment?: number;
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'PAID_OFF' | 'REFINANCED' | 'DEFAULTED';
  bankAccountId?: string;
  linkedProperties?: string[];
  notes?: string;
}

export interface UpdateMortgageDto extends Partial<CreateMortgageDto> {}

export interface CreatePaymentDto {
  amount: number;
  paymentDate: string;
  principal?: number;
  interest?: number;
  notes?: string;
}

export interface MortgageSummary {
  totalMortgages: number;
  totalLoanAmount: number;
  totalRemainingBalance: number;
  totalMonthlyPayments: number;
  mortgagesByStatus: {
    ACTIVE: number;
    PAID_OFF: number;
    REFINANCED: number;
    DEFAULTED: number;
  };
  activeMortgagesCount: number;
  paidOffMortgagesCount: number;
  refinancedMortgagesCount: number;
  defaultedMortgagesCount: number;
}

export interface MortgagesResponse {
  data: Mortgage[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MortgageFilters {
  search?: string;
  status?: 'ACTIVE' | 'PAID_OFF' | 'REFINANCED' | 'DEFAULTED';
  bank?: string;
  propertyId?: string;
  minLoanAmount?: number;
  maxLoanAmount?: number;
  minInterestRate?: number;
  maxInterestRate?: number;
}

/**
 * Mortgage API service.
 */
export const mortgagesApi = {
  /**
   * Get all mortgages with pagination, search, and filters.
   */
  getMortgages: async (
    page: number = 1,
    limit: number = 10,
    filters?: MortgageFilters,
  ): Promise<MortgagesResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.bank) {
      params.append('bank', filters.bank);
    }
    if (filters?.propertyId) {
      params.append('propertyId', filters.propertyId);
    }
    if (filters?.minLoanAmount !== undefined) {
      params.append('minLoanAmount', filters.minLoanAmount.toString());
    }
    if (filters?.maxLoanAmount !== undefined) {
      params.append('maxLoanAmount', filters.maxLoanAmount.toString());
    }
    if (filters?.minInterestRate !== undefined) {
      params.append('minInterestRate', filters.minInterestRate.toString());
    }
    if (filters?.maxInterestRate !== undefined) {
      params.append('maxInterestRate', filters.maxInterestRate.toString());
    }

    const response = await api.get<MortgagesResponse>(`/mortgages?${params}`);
    return response.data;
  },

  /**
   * Get all mortgages for a property.
   */
  getPropertyMortgages: async (propertyId: string): Promise<Mortgage[]> => {
    const response = await api.get<Mortgage[]>(`/mortgages/property/${propertyId}`);
    return response.data;
  },

  /**
   * Get a mortgage by ID with payments.
   */
  getMortgage: async (id: string): Promise<Mortgage> => {
    const response = await api.get<Mortgage>(`/mortgages/${id}`);
    return response.data;
  },

  /**
   * Create a new mortgage.
   */
  createMortgage: async (data: CreateMortgageDto): Promise<Mortgage> => {
    const response = await api.post<Mortgage>('/mortgages', data);
    return response.data;
  },

  /**
   * Update a mortgage.
   */
  updateMortgage: async (id: string, data: UpdateMortgageDto): Promise<Mortgage> => {
    const response = await api.patch<Mortgage>(`/mortgages/${id}`, data);
    return response.data;
  },

  /**
   * Delete a mortgage.
   */
  deleteMortgage: async (id: string): Promise<void> => {
    await api.delete(`/mortgages/${id}`);
  },

  /**
   * Add a payment to a mortgage.
   */
  addPayment: async (mortgageId: string, data: CreatePaymentDto): Promise<MortgagePayment> => {
    const response = await api.post<MortgagePayment>(`/mortgages/${mortgageId}/payments`, data);
    return response.data;
  },

  /**
   * Get remaining balance for a mortgage.
   */
  getRemainingBalance: async (mortgageId: string): Promise<{
    mortgageId: string;
    loanAmount: number;
    totalPrincipalPaid: number;
    remainingBalance: number;
    totalPayments: number;
  }> => {
    const response = await api.get<{
      mortgageId: string;
      loanAmount: number;
      totalPrincipalPaid: number;
      remainingBalance: number;
      totalPayments: number;
    }>(`/mortgages/${mortgageId}/balance`);
    return response.data;
  },

  /**
   * Get mortgage summary statistics.
   */
  getSummary: async (): Promise<MortgageSummary> => {
    const response = await api.get<MortgageSummary>('/mortgages/summary');
    return response.data;
  },

  /**
   * Get mortgages with optional status filter.
   * @deprecated Use getMortgages with filters instead
   */
  getMortgagesByStatus: async (status?: 'ACTIVE' | 'PAID_OFF' | 'REFINANCED' | 'DEFAULTED'): Promise<Mortgage[]> => {
    const params = status ? `?status=${status}` : '';
    const response = await api.get<Mortgage[]>(`/mortgages${params}`);
    return response.data;
  },
};
