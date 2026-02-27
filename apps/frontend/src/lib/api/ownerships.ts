import { api } from '../api';

export type OwnershipType = 'FULL' | 'PARTIAL' | 'PARTNERSHIP' | 'COMPANY' | 'REAL' | 'LEGAL';

export interface Ownership {
  id: string;
  propertyId: string;
  ownerId: string;
  ownershipPercentage: number | string;
  ownershipType: OwnershipType;
  managementFee?: number | string | null;
  familyDivision?: boolean;
  startDate: string;
  endDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  property?: {
    id: string;
    address: string;
    fileNumber?: string;
  };
  owner?: {
    id: string;
    name: string;
    type: 'INDIVIDUAL' | 'COMPANY' | 'PARTNERSHIP';
    email?: string;
    phone?: string;
  };
}

export interface OwnershipsResponse {
  data: Ownership[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateOwnershipDto {
  ownerId: string;
  ownershipPercentage: number;
  ownershipType: OwnershipType;
  startDate: string;
  endDate?: string;
  managementFee?: number;
  familyDivision?: boolean;
  notes?: string;
}

export interface UpdateOwnershipDto extends Partial<CreateOwnershipDto> {}

/**
 * Ownership API service.
 */
export const ownershipsApi = {
  /**
   * Get all ownerships with pagination.
   */
  getOwnerships: async (
    page = 1,
    limit = 20,
  ): Promise<OwnershipsResponse> => {
    const response = await api.get<OwnershipsResponse>('/ownerships', {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Get all ownerships for a property.
   */
  getPropertyOwnerships: async (propertyId: string): Promise<Ownership[]> => {
    const response = await api.get<Ownership[]>(
      `/properties/${propertyId}/ownerships`,
    );
    return response.data;
  },

  /**
   * Get an ownership by ID.
   */
  getOwnership: async (id: string): Promise<Ownership> => {
    const response = await api.get<Ownership>(`/ownerships/${id}`);
    return response.data;
  },

  /**
   * Create a new ownership for a property.
   */
  createOwnership: async (
    propertyId: string,
    data: CreateOwnershipDto,
  ): Promise<Ownership> => {
    const response = await api.post<Ownership>(
      `/properties/${propertyId}/ownerships`,
      data,
    );
    return response.data;
  },

  /**
   * Update an ownership with validation.
   */
  updateOwnership: async (id: string, data: UpdateOwnershipDto): Promise<Ownership> => {
    const response = await api.patch<Ownership>(`/ownerships/${id}`, data);
    return response.data;
  },

  /**
   * Delete an ownership.
   */
  deleteOwnership: async (id: string): Promise<void> => {
    await api.delete(`/ownerships/${id}`);
  },
};
