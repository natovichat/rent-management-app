import { api } from '../api';

export interface Unit {
  id: string;
  propertyId: string;
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
}

export interface CreateUnitDto {
  propertyId: string;
  apartmentNumber: string;
  floor?: number;
  roomCount?: number;
  notes?: string;
}

export interface UpdateUnitDto extends Partial<CreateUnitDto> {}

export const unitsApi = {
  getAll: async (page = 1, limit = 20, propertyId?: string): Promise<{ data: Unit[]; meta: { total: number; page: number; limit: number; totalPages: number } }> => {
    const params: Record<string, unknown> = { page, limit };
    if (propertyId) params.propertyId = propertyId;
    const response = await api.get('/units', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Unit> => {
    const response = await api.get(`/units/${id}`);
    return response.data;
  },

  create: async (data: CreateUnitDto): Promise<Unit> => {
    const response = await api.post('/units', data);
    return response.data;
  },

  update: async (id: string, data: UpdateUnitDto): Promise<Unit> => {
    const response = await api.patch(`/units/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/units/${id}`);
  },
};
