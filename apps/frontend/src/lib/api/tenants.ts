import { api } from '../api';

export interface Tenant {
  id: string;
  accountId: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  leases?: any[];
}

export interface CreateTenantDto {
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface UpdateTenantDto extends Partial<CreateTenantDto> {}

/**
 * Tenant API service.
 */
export const tenantsApi = {
  /**
   * Get all tenants.
   * @param search Optional search query to filter by name, email, or phone
   */
  getAll: async (search?: string): Promise<Tenant[]> => {
    const params = search ? { search } : {};
    const response = await api.get<Tenant[]>('/tenants', { params });
    return response.data;
  },

  /**
   * Get a tenant by ID.
   */
  getById: async (id: string): Promise<Tenant> => {
    const response = await api.get<Tenant>(`/tenants/${id}`);
    return response.data;
  },

  /**
   * Create a new tenant.
   */
  create: async (data: CreateTenantDto): Promise<Tenant> => {
    const response = await api.post<Tenant>('/tenants', data);
    return response.data;
  },

  /**
   * Update a tenant.
   */
  update: async (id: string, data: UpdateTenantDto): Promise<Tenant> => {
    const response = await api.patch<Tenant>(`/tenants/${id}`, data);
    return response.data;
  },

  /**
   * Delete a tenant.
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/tenants/${id}`);
  },
};
