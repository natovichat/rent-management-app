import { api } from '../api';

export type OwnerType = 'INDIVIDUAL' | 'COMPANY' | 'PARTNERSHIP';

export interface Owner {
  id: string;
  accountId: string;
  name: string;
  type: OwnerType;
  idNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  ownerships?: any[];
}

export interface CreateOwnerDto {
  name: string;
  type: OwnerType;
  idNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface UpdateOwnerDto extends Partial<CreateOwnerDto> {}

export interface OwnersResponse {
  data: Owner[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Owner API service.
 */
export const ownersApi = {
  /**
   * Get all owners with pagination and search.
   */
  getOwners: async (
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<OwnersResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      params.append('search', search);
    }

    const response = await api.get<OwnersResponse>(`/owners?${params}`);
    return response.data;
  },

  /**
   * Get an owner by ID.
   */
  getOwner: async (id: string): Promise<Owner> => {
    const response = await api.get<Owner>(`/owners/${id}`);
    return response.data;
  },

  /**
   * Create a new owner.
   */
  createOwner: async (data: CreateOwnerDto): Promise<Owner> => {
    const response = await api.post<Owner>('/owners', data);
    return response.data;
  },

  /**
   * Update an owner.
   */
  updateOwner: async (id: string, data: UpdateOwnerDto): Promise<Owner> => {
    const response = await api.patch<Owner>(`/owners/${id}`, data);
    return response.data;
  },

  /**
   * Delete an owner.
   */
  deleteOwner: async (id: string): Promise<void> => {
    await api.delete(`/owners/${id}`);
  },

  /**
   * Get all properties owned by an owner.
   */
  getOwnerProperties: async (id: string): Promise<any[]> => {
    const response = await api.get<any[]>(`/owners/${id}/properties`);
    return response.data;
  },
};
