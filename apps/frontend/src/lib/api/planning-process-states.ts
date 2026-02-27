import { api } from '../api';

export interface PlanningProcessState {
  id: string;
  propertyId: string;
  stateType?: string;
  developerName?: string;
  projectedSizeAfter?: number;
  lastUpdateDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanningProcessStateDto {
  stateType?: string;
  developerName?: string;
  projectedSizeAfter?: number;
  lastUpdateDate?: string;
  notes?: string;
}

export interface UpdatePlanningProcessStateDto extends Partial<CreatePlanningProcessStateDto> {}

/**
 * Planning Process State API service.
 * 1:1 relationship with Property.
 */
export const planningProcessStatesApi = {
  /**
   * Get planning process state for a property.
   */
  getPlanningProcessState: async (propertyId: string): Promise<PlanningProcessState | null> => {
    try {
      const response = await api.get<PlanningProcessState>(`/properties/${propertyId}/planning-process-state`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Create planning process state for a property.
   */
  createPlanningProcessState: async (
    propertyId: string,
    data: CreatePlanningProcessStateDto,
  ): Promise<PlanningProcessState> => {
    const response = await api.post<PlanningProcessState>(
      `/properties/${propertyId}/planning-process-state`,
      data,
    );
    return response.data;
  },

  /**
   * Update planning process state for a property.
   */
  updatePlanningProcessState: async (
    propertyId: string,
    data: UpdatePlanningProcessStateDto,
  ): Promise<PlanningProcessState> => {
    const response = await api.patch<PlanningProcessState>(
      `/properties/${propertyId}/planning-process-state`,
      data,
    );
    return response.data;
  },

  /**
   * Delete planning process state for a property.
   */
  deletePlanningProcessState: async (propertyId: string): Promise<void> => {
    await api.delete(`/properties/${propertyId}/planning-process-state`);
  },
};
