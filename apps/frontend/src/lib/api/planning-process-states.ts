import { api } from '../api';

export interface PlanningProcessState {
  id: string;
  propertyId: string;
  stateType: string;
  lastUpdateDate: string;
  developerName?: string;
  projectedSizeAfter?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanningProcessStateDto {
  stateType: string;
  lastUpdateDate: string;
  developerName?: string;
  projectedSizeAfter?: string;
  notes?: string;
}

export interface UpdatePlanningProcessStateDto extends Partial<CreatePlanningProcessStateDto> {}

export const planningProcessStatesApi = {
  getPlanningProcessState: async (propertyId: string): Promise<PlanningProcessState | null> => {
    try {
      const response = await api.get<PlanningProcessState>(
        `/properties/${propertyId}/planning-process-state`,
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  },

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

  deletePlanningProcessState: async (propertyId: string): Promise<void> => {
    await api.delete(`/properties/${propertyId}/planning-process-state`);
  },
};
