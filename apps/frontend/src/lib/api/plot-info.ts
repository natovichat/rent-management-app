import { api } from '@/lib/api';

export interface PlotInfo {
  id: string;
  propertyId: string;
  accountId: string;
  gush?: string | null;
  chelka?: string | null;
  subChelka?: string | null;
  registryNumber?: string | null;
  registryOffice?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlotInfoDto {
  gush?: string;
  chelka?: string;
  subChelka?: string;
  registryNumber?: string;
  registryOffice?: string;
  notes?: string;
}

export interface UpdatePlotInfoDto extends Partial<CreatePlotInfoDto> {}

export const plotInfoApi = {
  /**
   * Get plot info for a property.
   */
  getByPropertyId: async (propertyId: string): Promise<PlotInfo> => {
    const response = await api.get(`/properties/${propertyId}/plot-info`);
    return response.data;
  },

  /**
   * Create plot info for a property.
   */
  create: async (
    propertyId: string,
    data: CreatePlotInfoDto,
  ): Promise<PlotInfo> => {
    const response = await api.post(`/properties/${propertyId}/plot-info`, data);
    return response.data;
  },

  /**
   * Update plot info.
   */
  update: async (
    id: string,
    data: UpdatePlotInfoDto,
  ): Promise<PlotInfo> => {
    const response = await api.put(`/plot-info/${id}`, data);
    return response.data;
  },

  /**
   * Delete plot info.
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/plot-info/${id}`);
  },
};
