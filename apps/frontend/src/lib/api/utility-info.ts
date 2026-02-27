import { api } from '../api';

export interface UtilityInfo {
  id: string;
  propertyId: string;
  arnonaAccountNumber?: string;
  electricityAccountNumber?: string;
  waterAccountNumber?: string;
  vaadBayitName?: string;
  waterMeterNumber?: string;
  electricityMeterNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUtilityInfoDto {
  arnonaAccountNumber?: string;
  electricityAccountNumber?: string;
  waterAccountNumber?: string;
  vaadBayitName?: string;
  waterMeterNumber?: string;
  electricityMeterNumber?: string;
  notes?: string;
}

export interface UpdateUtilityInfoDto extends Partial<CreateUtilityInfoDto> {}

/**
 * Utility Info API service.
 * 1:1 relationship with Property.
 */
export const utilityInfoApi = {
  /**
   * Get utility info for a property.
   */
  getUtilityInfo: async (propertyId: string): Promise<UtilityInfo | null> => {
    try {
      const response = await api.get<UtilityInfo>(`/properties/${propertyId}/utility-info`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Create utility info for a property.
   */
  createUtilityInfo: async (
    propertyId: string,
    data: CreateUtilityInfoDto,
  ): Promise<UtilityInfo> => {
    const response = await api.post<UtilityInfo>(
      `/properties/${propertyId}/utility-info`,
      data,
    );
    return response.data;
  },

  /**
   * Update utility info for a property.
   */
  updateUtilityInfo: async (
    propertyId: string,
    data: UpdateUtilityInfoDto,
  ): Promise<UtilityInfo> => {
    const response = await api.patch<UtilityInfo>(
      `/properties/${propertyId}/utility-info`,
      data,
    );
    return response.data;
  },

  /**
   * Delete utility info for a property.
   */
  deleteUtilityInfo: async (propertyId: string): Promise<void> => {
    await api.delete(`/properties/${propertyId}/utility-info`);
  },
};
