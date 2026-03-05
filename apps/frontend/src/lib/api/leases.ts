import { api } from '../api';

export type RentalAgreementStatus = 'FUTURE' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
export type RenewalStatus = 'PENDING' | 'IN_PROGRESS' | 'RENEWED' | 'NOT_RENEWING';

export interface RentalAgreement {
  id: string;
  propertyId: string;
  tenantId: string;
  monthlyRent: number;
  startDate: string;
  endDate: string;
  status: RentalAgreementStatus;
  renewalStatus: RenewalStatus;
  hasExtensionOption?: boolean;
  extensionUntilDate?: string;
  extensionMonthlyRent?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  property?: {
    id: string;
    address: string;
    fileNumber?: string;
  };
  tenant?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
}

export interface CreateRentalAgreementDto {
  propertyId: string;
  tenantId: string;
  monthlyRent: number;
  startDate: string;
  endDate: string;
  status?: RentalAgreementStatus;
  hasExtensionOption?: boolean;
  extensionUntilDate?: string;
  extensionMonthlyRent?: number;
  notes?: string;
}

export interface UpdateRentalAgreementDto extends Partial<CreateRentalAgreementDto> {}

export interface RentalAgreementsResponse {
  data: RentalAgreement[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RentalAgreementFilters {
  status?: RentalAgreementStatus;
  propertyId?: string;
  tenantId?: string;
  includeDeleted?: boolean;
}

/**
 * Rental Agreement API service (formerly Leases).
 */
export const rentalAgreementsApi = {
  /**
   * Get all rental agreements with pagination and filters.
   */
  getRentalAgreements: async (
    page: number = 1,
    limit: number = 20,
    filters?: RentalAgreementFilters,
  ): Promise<RentalAgreementsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.propertyId) {
      params.append('propertyId', filters.propertyId);
    }
    if (filters?.tenantId) {
      params.append('tenantId', filters.tenantId);
    }
    if (filters?.includeDeleted) {
      params.append('includeDeleted', 'true');
    }

    const response = await api.get<RentalAgreementsResponse>(`/rental-agreements?${params}`);
    return response.data;
  },

  /**
   * Get a rental agreement by ID.
   */
  getRentalAgreement: async (id: string): Promise<RentalAgreement> => {
    const response = await api.get<RentalAgreement>(`/rental-agreements/${id}`);
    return response.data;
  },

  /**
   * Create a new rental agreement.
   */
  createRentalAgreement: async (data: CreateRentalAgreementDto): Promise<RentalAgreement> => {
    const response = await api.post<RentalAgreement>('/rental-agreements', data);
    return response.data;
  },

  /**
   * Update a rental agreement.
   */
  updateRentalAgreement: async (id: string, data: UpdateRentalAgreementDto): Promise<RentalAgreement> => {
    const response = await api.patch<RentalAgreement>(`/rental-agreements/${id}`, data);
    return response.data;
  },

  /**
   * Soft-delete a rental agreement.
   */
  deleteRentalAgreement: async (id: string): Promise<void> => {
    await api.delete(`/rental-agreements/${id}`);
  },

  /**
   * Restore a soft-deleted rental agreement.
   */
  restoreRentalAgreement: async (id: string): Promise<RentalAgreement> => {
    const response = await api.patch<RentalAgreement>(`/rental-agreements/${id}/restore`);
    return response.data;
  },

  /**
   * Get agreements expiring within the next X months.
   */
  getExpiringAgreements: async (months: number = 3): Promise<RentalAgreement[]> => {
    const response = await api.get<RentalAgreement[]>(`/rental-agreements/expiring?months=${months}`);
    return response.data;
  },

  /**
   * Update the renewal status of a rental agreement.
   */
  updateRenewalStatus: async (id: string, renewalStatus: RenewalStatus): Promise<RentalAgreement> => {
    const response = await api.patch<RentalAgreement>(`/rental-agreements/${id}/renewal-status`, { renewalStatus });
    return response.data;
  },
};

// Backward compatibility: export as leasesApi
export const leasesApi = rentalAgreementsApi;
