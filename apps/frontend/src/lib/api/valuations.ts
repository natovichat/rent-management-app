import { api } from '../api';

export interface Valuation {
  id: string;
  accountId: string;
  propertyId: string;
  estimatedValue: number | string; // Can be string from Prisma Decimal
  valuationDate: string;
  valuationType: 'MARKET' | 'PURCHASE' | 'TAX' | 'APPRAISAL';
  valuatedBy?: string;
  notes?: string;
  createdAt: string;
  property?: {
    id: string;
    address: string;
    fileNumber?: string;
  };
}

export interface CreateValuationDto {
  propertyId: string;
  estimatedValue: number;
  valuationDate: string;
  valuationType: 'MARKET' | 'PURCHASE' | 'TAX' | 'APPRAISAL';
  valuatedBy?: string;
  notes?: string;
}

/**
 * Valuation API service.
 */
export const valuationsApi = {
  /**
   * Get all valuations for a property.
   */
  getPropertyValuations: async (propertyId: string): Promise<Valuation[]> => {
    const response = await api.get<Valuation[]>(`/valuations/property/${propertyId}`);
    return response.data;
  },

  /**
   * Create a new valuation.
   */
  createValuation: async (data: CreateValuationDto): Promise<Valuation> => {
    const response = await api.post<Valuation>('/valuations', data);
    return response.data;
  },

  /**
   * Get the latest valuation for a property.
   */
  getLatestValuation: async (propertyId: string): Promise<Valuation | null> => {
    const response = await api.get<Valuation | null>(`/valuations/property/${propertyId}/latest`);
    return response.data;
  },
};
