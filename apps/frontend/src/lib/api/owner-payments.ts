import { api } from '../api';

export type OwnerPaymentStatus = 'PENDING' | 'PAID' | 'PARTIAL';

export interface OwnerPayment {
  id: string;
  ownershipId: string;
  rentalAgreementId: string;
  propertyId: string;
  personId: string;
  year: number;
  month: number;
  totalRent: number;
  ownershipPercentage: number;
  amountDue: number;
  amountPaid: number;
  status: OwnerPaymentStatus;
  paymentDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  /** Virtual flag — row not yet persisted in DB */
  isVirtual?: boolean;
  person?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  property?: {
    id: string;
    address: string;
    fileNumber?: string;
  };
  rentalAgreement?: {
    id: string;
    monthlyRent: number;
    startDate: string;
    endDate: string;
    status: string;
  };
  ownership?: {
    id: string;
    ownershipPercentage: number | string;
    ownershipType: string;
  };
}

export interface OwnerPaymentsResponse {
  data: OwnerPayment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateOwnerPaymentDto {
  ownershipId: string;
  rentalAgreementId: string;
  year: number;
  month: number;
  totalRent: number;
  amountPaid?: number;
  status?: OwnerPaymentStatus;
  paymentDate?: string;
  notes?: string;
}

export interface UpdateOwnerPaymentDto {
  amountPaid?: number;
  status?: OwnerPaymentStatus;
  paymentDate?: string;
  notes?: string;
  totalRent?: number;
}

export interface OwnerPaymentFilters {
  rentalAgreementId?: string;
  personId?: string;
  propertyId?: string;
  ownershipId?: string;
  status?: OwnerPaymentStatus;
  year?: number;
  month?: number;
  page?: number;
  limit?: number;
}

export const ownerPaymentsApi = {
  /** List owner payments with optional filters */
  getOwnerPayments: async (filters?: OwnerPaymentFilters): Promise<OwnerPaymentsResponse> => {
    const params = new URLSearchParams();
    if (filters?.rentalAgreementId) params.append('rentalAgreementId', filters.rentalAgreementId);
    if (filters?.personId) params.append('personId', filters.personId);
    if (filters?.propertyId) params.append('propertyId', filters.propertyId);
    if (filters?.ownershipId) params.append('ownershipId', filters.ownershipId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.year !== undefined) params.append('year', String(filters.year));
    if (filters?.month !== undefined) params.append('month', String(filters.month));
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const query = params.toString();
    const response = await api.get<OwnerPaymentsResponse>(
      `/owner-payments${query ? `?${query}` : ''}`,
    );
    return response.data;
  },

  /**
   * Get a computed schedule of owner payments for a rental agreement.
   * Returns virtual rows for months without a persisted record.
   */
  getSchedule: async (
    rentalAgreementId: string,
    ownershipId?: string,
  ): Promise<OwnerPayment[]> => {
    const params = new URLSearchParams({ rentalAgreementId });
    if (ownershipId) params.append('ownershipId', ownershipId);
    const response = await api.get<OwnerPayment[]>(
      `/owner-payments/schedule?${params.toString()}`,
    );
    // Mark virtual rows so UI can handle them differently
    return response.data.map((row) => ({
      ...row,
      isVirtual: row.id.startsWith('virtual:'),
    }));
  },

  /** Get a single owner payment */
  getOwnerPayment: async (id: string): Promise<OwnerPayment> => {
    const response = await api.get<OwnerPayment>(`/owner-payments/${id}`);
    return response.data;
  },

  /** Create a new owner payment record */
  createOwnerPayment: async (data: CreateOwnerPaymentDto): Promise<OwnerPayment> => {
    const response = await api.post<OwnerPayment>('/owner-payments', data);
    return response.data;
  },

  /** Update an owner payment record (e.g. mark paid) */
  updateOwnerPayment: async (id: string, data: UpdateOwnerPaymentDto): Promise<OwnerPayment> => {
    const response = await api.patch<OwnerPayment>(`/owner-payments/${id}`, data);
    return response.data;
  },

  /** Soft-delete an owner payment record */
  deleteOwnerPayment: async (id: string): Promise<void> => {
    await api.delete(`/owner-payments/${id}`);
  },
};
