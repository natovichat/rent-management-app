import { api } from '../api';

export enum ExpenseType {
  MAINTENANCE = 'MAINTENANCE',
  TAX = 'TAX',
  INSURANCE = 'INSURANCE',
  UTILITIES = 'UTILITIES',
  RENOVATION = 'RENOVATION',
  LEGAL = 'LEGAL',
  OTHER = 'OTHER',
}

export enum IncomeType {
  RENT = 'RENT',
  SALE = 'SALE',
  CAPITAL_GAIN = 'CAPITAL_GAIN',
  OTHER = 'OTHER',
}

export interface Expense {
  id: string;
  accountId: string;
  propertyId: string;
  expenseDate: string;
  amount: number;
  type: ExpenseType;
  category: string;
  description?: string;
  paymentMethod?: string;
  createdAt: string;
  property?: {
    id: string;
    address: string;
  };
}

export interface Income {
  id: string;
  accountId: string;
  propertyId: string;
  incomeDate: string;
  amount: number;
  type: IncomeType;
  source?: string;
  description?: string;
  createdAt: string;
  property?: {
    id: string;
    address: string;
  };
}

export interface CreateExpenseDto {
  propertyId: string;
  expenseDate: string;
  amount: number;
  expenseType: ExpenseType;
  category: string;
  description?: string;
  paymentMethod?: string;
}

export interface CreateIncomeDto {
  propertyId: string;
  incomeDate: string;
  amount: number;
  incomeType: IncomeType;
  source?: string;
  description?: string;
}

export interface ExpenseFilters {
  propertyId?: string;
  startDate?: string;
  endDate?: string;
  type?: ExpenseType;
}

export interface IncomeFilters {
  propertyId?: string;
  startDate?: string;
  endDate?: string;
  type?: IncomeType;
}

export interface ExpenseBreakdown {
  type: ExpenseType;
  total: number;
  count: number;
  percentage: number;
}

export interface IncomeBreakdown {
  type: IncomeType;
  total: number;
  count: number;
  percentage: number;
}

export interface PropertyDashboard {
  property: {
    id: string;
    address: string;
    fileNumber?: string;
  };
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netIncome: number;
    incomeCount: number;
    expenseCount: number;
    propertyValue: number;
    roi: number;
  };
  latestValuation?: {
    id: string;
    valuationDate: string;
    estimatedValue: number;
    valuationType: string;
  };
  expenses: Expense[];
  income: Income[];
  startDate?: string;
  endDate?: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  startDate: string;
  endDate: string;
  incomeBySource: Record<string, number>;
  expensesByCategory: Record<string, number>;
}

export interface PropertyFinancials {
  propertyId: string;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  expenses: Expense[];
  income: Income[];
}

/**
 * Financial API service.
 */
export const financialsApi = {
  /**
   * Get expenses with optional filters.
   */
  getExpenses: async (filters?: ExpenseFilters): Promise<Expense[]> => {
    const response = await api.get<Expense[]>('/financials/expenses', { params: filters });
    return response.data;
  },

  /**
   * Create a new expense.
   */
  createExpense: async (data: CreateExpenseDto): Promise<Expense> => {
    const response = await api.post<Expense>('/financials/expenses', data);
    return response.data;
  },

  /**
   * Get income with optional filters.
   */
  getIncome: async (filters?: IncomeFilters): Promise<Income[]> => {
    const response = await api.get<Income[]>('/financials/income', { params: filters });
    return response.data;
  },

  /**
   * Create a new income record.
   */
  createIncome: async (data: CreateIncomeDto): Promise<Income> => {
    const response = await api.post<Income>('/financials/income', data);
    return response.data;
  },

  /**
   * Get financial summary for a date range.
   */
  getFinancialSummary: async (
    startDate?: string,
    endDate?: string
  ): Promise<FinancialSummary> => {
    const response = await api.get<FinancialSummary>('/financials/summary', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  /**
   * Get financials for a specific property.
   */
  getPropertyFinancials: async (propertyId: string): Promise<PropertyFinancials> => {
    const response = await api.get<PropertyFinancials>(`/financials/property/${propertyId}`);
    return response.data;
  },

  /**
   * Get expense breakdown by category.
   */
  getExpenseBreakdown: async (filters?: ExpenseFilters): Promise<ExpenseBreakdown[]> => {
    const response = await api.get<ExpenseBreakdown[]>('/financials/expenses/breakdown', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get income breakdown by type.
   */
  getIncomeBreakdown: async (filters?: IncomeFilters): Promise<IncomeBreakdown[]> => {
    const response = await api.get<IncomeBreakdown[]>('/financials/income/breakdown', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get financial dashboard for a property.
   */
  getPropertyDashboard: async (
    propertyId: string,
    startDate?: string,
    endDate?: string
  ): Promise<PropertyDashboard> => {
    const response = await api.get<PropertyDashboard>(
      `/financials/property/${propertyId}/dashboard`,
      {
        params: { startDate, endDate },
      }
    );
    return response.data;
  },

  /**
   * Update an expense.
   */
  updateExpense: async (id: string, data: Partial<CreateExpenseDto>): Promise<Expense> => {
    const response = await api.patch<Expense>(`/financials/expenses/${id}`, data);
    return response.data;
  },

  /**
   * Delete an expense.
   */
  deleteExpense: async (id: string): Promise<void> => {
    await api.delete(`/financials/expenses/${id}`);
  },

  /**
   * Update an income record.
   */
  updateIncome: async (id: string, data: Partial<CreateIncomeDto>): Promise<Income> => {
    const response = await api.patch<Income>(`/financials/income/${id}`, data);
    return response.data;
  },

  /**
   * Delete an income record.
   */
  deleteIncome: async (id: string): Promise<void> => {
    await api.delete(`/financials/income/${id}`);
  },
};
