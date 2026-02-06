import { api } from '../api';

export interface Lease {
  id: string;
  accountId: string;
  unitId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  monthlyRent: string;
  paymentTo: string;
  status: 'FUTURE' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  unit?: {
    id: string;
    apartmentNumber: string;
    property: {
      id: string;
      address: string;
      fileNumber?: string;
    };
  };
  tenant?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
}

export interface CreateLeaseDto {
  unitId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  paymentTo: string;
  notes?: string;
}

export interface UpdateLeaseDto extends Partial<CreateLeaseDto> {}

export interface LeasesResponse {
  data: Lease[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface LeaseFilters {
  search?: string;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  minMonthlyRent?: number;
  maxMonthlyRent?: number;
  propertyId?: string;
  tenantId?: string;
}

/**
 * Lease API service.
 */
export const leasesApi = {
  /**
   * Get all leases with pagination, search, and filters.
   */
  getAll: async (
    page: number = 1,
    limit: number = 10,
    filters?: LeaseFilters,
  ): Promise<LeasesResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.startDateFrom) {
      params.append('startDateFrom', filters.startDateFrom);
    }
    if (filters?.startDateTo) {
      params.append('startDateTo', filters.startDateTo);
    }
    if (filters?.endDateFrom) {
      params.append('endDateFrom', filters.endDateFrom);
    }
    if (filters?.endDateTo) {
      params.append('endDateTo', filters.endDateTo);
    }
    if (filters?.minMonthlyRent !== undefined) {
      params.append('minMonthlyRent', filters.minMonthlyRent.toString());
    }
    if (filters?.maxMonthlyRent !== undefined) {
      params.append('maxMonthlyRent', filters.maxMonthlyRent.toString());
    }
    if (filters?.propertyId) {
      params.append('propertyId', filters.propertyId);
    }
    if (filters?.tenantId) {
      params.append('tenantId', filters.tenantId);
    }

    const response = await api.get<LeasesResponse>(`/leases?${params}`);
    return response.data;
  },

  /**
   * Get a lease by ID.
   */
  getById: async (id: string): Promise<Lease> => {
    const response = await api.get<Lease>(`/leases/${id}`);
    return response.data;
  },

  /**
   * Create a new lease.
   */
  create: async (data: CreateLeaseDto): Promise<Lease> => {
    const response = await api.post<Lease>('/leases', data);
    return response.data;
  },

  /**
   * Update a lease.
   */
  update: async (id: string, data: UpdateLeaseDto): Promise<Lease> => {
    const response = await api.patch<Lease>(`/leases/${id}`, data);
    return response.data;
  },

  /**
   * Terminate a lease early.
   */
  terminate: async (id: string): Promise<Lease> => {
    const response = await api.post<Lease>(`/leases/${id}/terminate`);
    return response.data;
  },

  /**
   * Delete a lease.
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/leases/${id}`);
  },
};
