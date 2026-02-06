import { api } from '../api';

export interface Unit {
  id: string;
  propertyId: string;
  accountId: string;
  apartmentNumber: string;
  floor?: number;
  roomCount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  property?: {
    id: string;
    address: string;
    fileNumber?: string;
  };
  leases?: any[];
  activeLease?: any;
}

export interface CreateUnitDto {
  propertyId: string;
  apartmentNumber: string;
  floor?: number;
  roomCount?: number;
  notes?: string;
}

export interface UpdateUnitDto extends Partial<CreateUnitDto> {}

/**
 * Units API service.
 */
export const unitsApi = {
  /**
   * Get all units.
   */
  getAll: async (): Promise<{ data: Unit[]; meta: any }> => {
    const response = await api.get<{ data: Unit[]; meta: any }>('/units');
    return response.data;
  },

  /**
   * Get a unit by ID.
   */
  getById: async (id: string): Promise<Unit> => {
    const response = await api.get<Unit>(`/units/${id}`);
    return response.data;
  },

  /**
   * Create a new unit.
   */
  create: async (data: CreateUnitDto): Promise<Unit> => {
    const response = await api.post<Unit>('/units', data);
    return response.data;
  },

  /**
   * Update a unit.
   */
  update: async (id: string, data: UpdateUnitDto): Promise<Unit> => {
    const response = await api.patch<Unit>(`/units/${id}`, data);
    return response.data;
  },

  /**
   * Delete a unit.
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/units/${id}`);
  },
};
