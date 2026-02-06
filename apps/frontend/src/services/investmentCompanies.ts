import { api } from '@/lib/api';

export interface InvestmentCompany {
  id: string;
  name: string;
  registrationNumber?: string;
  country: string;
  investmentAmount?: number;
  ownershipPercentage?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvestmentCompanyDto {
  name: string;
  registrationNumber?: string;
  country?: string;
  investmentAmount?: number;
  ownershipPercentage?: number;
  notes?: string;
}

export interface InvestmentCompaniesResponse {
  data: InvestmentCompany[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface InvestmentCompanyFilters {
  search?: string;
  country?: string;
  minInvestmentAmount?: number;
  maxInvestmentAmount?: number;
  minOwnershipPercentage?: number;
  maxOwnershipPercentage?: number;
  minPropertyCount?: number;
  maxPropertyCount?: number;
}

export const investmentCompaniesApi = {
  getAll: async (
    page: number = 1,
    limit: number = 10,
    filters?: InvestmentCompanyFilters,
  ): Promise<InvestmentCompaniesResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.country) {
      params.append('country', filters.country);
    }
    if (filters?.minInvestmentAmount !== undefined) {
      params.append('minInvestmentAmount', filters.minInvestmentAmount.toString());
    }
    if (filters?.maxInvestmentAmount !== undefined) {
      params.append('maxInvestmentAmount', filters.maxInvestmentAmount.toString());
    }
    if (filters?.minOwnershipPercentage !== undefined) {
      params.append('minOwnershipPercentage', filters.minOwnershipPercentage.toString());
    }
    if (filters?.maxOwnershipPercentage !== undefined) {
      params.append('maxOwnershipPercentage', filters.maxOwnershipPercentage.toString());
    }
    if (filters?.minPropertyCount !== undefined) {
      params.append('minPropertyCount', filters.minPropertyCount.toString());
    }
    if (filters?.maxPropertyCount !== undefined) {
      params.append('maxPropertyCount', filters.maxPropertyCount.toString());
    }

    const response = await api.get(`/investment-companies?${params}`);
    return response.data;
  },

  getOne: async (id: string): Promise<InvestmentCompany> => {
    const response = await api.get(`/investment-companies/${id}`);
    return response.data;
  },

  create: async (data: CreateInvestmentCompanyDto): Promise<InvestmentCompany> => {
    const response = await api.post('/investment-companies', {
      ...data,
      country: data.country || 'Israel',
    });
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<CreateInvestmentCompanyDto>,
  ): Promise<InvestmentCompany> => {
    const response = await api.patch(`/investment-companies/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/investment-companies/${id}`);
  },
};
