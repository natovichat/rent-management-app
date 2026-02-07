import api from '../api';
import { TableConfiguration, UpdateTableConfigDto, EntityType } from '@/types/table-config';

/**
 * Table configurations API
 */
export const tableConfigurationsApi = {
  /**
   * Get all table configurations
   */
  getAll: async (): Promise<TableConfiguration[]> => {
    const response = await api.get<TableConfiguration[]>('/table-configurations');
    return response.data;
  },

  /**
   * Get configuration for specific entity type
   * Returns null if no configuration exists
   */
  getByEntityType: async (entityType: EntityType): Promise<TableConfiguration | null> => {
    const response = await api.get<TableConfiguration | null>(
      `/table-configurations/${entityType}`,
    );
    return response.data;
  },

  /**
   * Create or update table configuration
   */
  upsert: async (dto: UpdateTableConfigDto): Promise<TableConfiguration> => {
    const response = await api.post<TableConfiguration>('/table-configurations', dto);
    return response.data;
  },

  /**
   * Delete configuration (reset to defaults)
   */
  delete: async (entityType: EntityType): Promise<void> => {
    await api.delete(`/table-configurations/${entityType}`);
  },

  /**
   * Reset configuration to defaults
   */
  reset: async (entityType: EntityType): Promise<void> => {
    await api.post(`/table-configurations/${entityType}/reset`);
  },
};
