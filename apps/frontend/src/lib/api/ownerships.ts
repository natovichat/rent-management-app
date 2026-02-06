import { api } from '../api';

export type OwnershipType = 'FULL' | 'PARTIAL' | 'PARTNERSHIP' | 'COMPANY';

export interface Ownership {
  id: string;
  accountId: string;
  propertyId: string;
  ownerId: string;
  ownershipPercentage: number;
  ownershipType: OwnershipType;
  startDate: string;
  endDate?: string;
  notes?: string;
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

export interface CreateOwnershipDto {
  propertyId: string;
  ownerId: string;
  ownershipPercentage: number;
  ownershipType: OwnershipType;
  startDate: string;
  endDate?: string;
  notes?: string;
}

export interface UpdateOwnershipDto extends Partial<CreateOwnershipDto> {}

/**
 * Ownership API service.
 */
export const ownershipsApi = {
  /**
   * Get all ownerships for a property.
   */
  getPropertyOwnerships: async (propertyId: string): Promise<Ownership[]> => {
    const response = await api.get<Ownership[]>(`/ownerships/property/${propertyId}`);
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
   * Create a new ownership with validation.
   */
  createOwnership: async (data: CreateOwnershipDto): Promise<Ownership> => {
    const response = await api.post<Ownership>('/ownerships', data);
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
