/**
 * Dashboard API stub.
 * The old dashboard endpoints (/api/dashboard/*) no longer exist.
 * Dashboard data is now built from real entity endpoints (properties, owners, etc.).
 * Types below are kept for backward compatibility with dashboard chart components.
 */

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

export const dashboardApi = {};
