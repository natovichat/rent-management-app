import { api } from '../api';

export interface PortfolioSummary {
  totalProperties: number;
  totalUnits: number;
  totalEstimatedValue: number;
  totalMortgageDebt: number;
  netEquity: number;
  occupancyRate: number;
  activeLeases: number;
  totalArea: number;
  landArea: number;
  propertiesByType: Record<string, number>;
  propertiesByStatus: Record<string, number>;
}

export interface PropertyDistribution {
  distributionByType: Record<string, number>;
  distributionByStatus: Record<string, number>;
}

export interface ValuationHistoryPoint {
  date: string;
  totalValue: number;
}

export interface IncomeExpenseData {
  period: string;
  income: number;
  expenses: number;
  net: number;
}

export interface MortgageSummary {
  totalMortgageDebt: number;
  totalMonthlyPayments: number;
  activeMortgagesCount: number;
  paidOffMortgagesCount: number;
  totalRemainingBalance: number;
  averageInterestRate: number;
}

export interface LeaseExpiration {
  id: string;
  endDate: string;
  startDate: string;
  status: string;
  monthlyRent: number;
  unit: {
    id: string;
    apartmentNumber: string;
    property: {
      id: string;
      address: string;
    };
  };
  tenant: {
    id: string;
    name: string;
  };
}

export interface ROIMetrics {
  portfolioROI: number;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  totalPropertyValue: number;
}

export interface CashFlowData {
  period: string;
  income: number;
  expenses: number;
  mortgagePayments: number;
  cashFlow: number;
}

export interface WidgetPreferences {
  visibleWidgets: string[];
  widgetOrder: string[];
}


export const dashboardApi = {
  /**
   * Get portfolio summary statistics.
   */
  getPortfolioSummary: async (startDate?: string, endDate?: string): Promise<PortfolioSummary> => {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get<PortfolioSummary>('/properties/portfolio/summary', { params });
    return response.data;
  },

  /**
   * Get property distribution by type and status.
   */
  getPropertyDistribution: async (): Promise<PropertyDistribution> => {
    const response = await api.get<PropertyDistribution>('/properties/portfolio/distribution');
    return response.data;
  },

  /**
   * Get valuation history aggregated by date.
   */
  getValuationHistory: async (startDate?: string, endDate?: string): Promise<ValuationHistoryPoint[]> => {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get<ValuationHistoryPoint[]>('/properties/portfolio/valuation-history', { params });
    return response.data;
  },

  /**
   * Get income vs expenses data grouped by period.
   */
  getIncomeExpenses: async (
    startDate?: string,
    endDate?: string,
    groupBy: 'month' | 'quarter' | 'year' = 'month',
  ): Promise<IncomeExpenseData[]> => {
    const params: Record<string, string> = { groupBy };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get<IncomeExpenseData[]>('/financials/dashboard/income-expenses', { params });
    return response.data;
  },

  /**
   * Get mortgage summary statistics.
   */
  getMortgageSummary: async (): Promise<MortgageSummary> => {
    const response = await api.get<MortgageSummary>('/mortgages/summary');
    return response.data;
  },

  /**
   * Get lease expiration timeline.
   */
  getLeaseExpirationTimeline: async (months: number = 12): Promise<LeaseExpiration[]> => {
    const response = await api.get<LeaseExpiration[]>('/leases/expiration-timeline', {
      params: { months: months.toString() },
    });
    return response.data;
  },

  /**
   * Get ROI metrics.
   */
  getROI: async (startDate?: string, endDate?: string): Promise<ROIMetrics> => {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get<ROIMetrics>('/dashboard/roi', { params });
    return response.data;
  },

  /**
   * Get cash flow summary.
   */
  getCashFlow: async (
    startDate?: string,
    endDate?: string,
    groupBy: 'month' | 'quarter' | 'year' = 'month',
  ): Promise<CashFlowData[]> => {
    const params: Record<string, string> = { groupBy };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get<CashFlowData[]>('/dashboard/cash-flow', { params });
    return response.data;
  },

  /**
   * Export dashboard data as PDF or Excel.
   */
  exportDashboard: async (
    format: 'pdf' | 'excel',
    startDate?: string,
    endDate?: string,
  ): Promise<Blob> => {
    const params: Record<string, string> = { format };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get<Blob>('/dashboard/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Get dashboard widget preferences.
   */
  getWidgetPreferences: async (): Promise<WidgetPreferences> => {
    const response = await api.get<WidgetPreferences>('/dashboard/widget-preferences');
    return response.data;
  },

  /**
   * Save dashboard widget preferences.
   */
  saveWidgetPreferences: async (preferences: WidgetPreferences): Promise<void> => {
    await api.put('/dashboard/widget-preferences', preferences);
  },
};
