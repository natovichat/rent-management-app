import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tableConfigurationsApi } from '../api/table-configurations';
import { EntityType, UpdateTableConfigDto } from '@/types/table-config';

/**
 * Query keys
 */
export const tableConfigKeys = {
  all: ['table-configurations'] as const,
  detail: (entityType: EntityType) => ['table-configurations', entityType] as const,
};

/**
 * Get all table configurations
 */
export function useTableConfigurations() {
  return useQuery({
    queryKey: tableConfigKeys.all,
    queryFn: tableConfigurationsApi.getAll,
  });
}

/**
 * Get configuration for specific entity type
 */
export function useTableConfiguration(entityType: EntityType) {
  return useQuery({
    queryKey: tableConfigKeys.detail(entityType),
    queryFn: () => tableConfigurationsApi.getByEntityType(entityType),
  });
}

/**
 * Create or update table configuration
 */
export function useUpsertTableConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tableConfigurationsApi.upsert,
    onSuccess: (data) => {
      // Invalidate all configs
      queryClient.invalidateQueries({ queryKey: tableConfigKeys.all });
      // Invalidate specific config
      queryClient.invalidateQueries({ queryKey: tableConfigKeys.detail(data.entityType) });
    },
  });
}

/**
 * Delete configuration (reset to defaults)
 */
export function useDeleteTableConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tableConfigurationsApi.delete,
    onSuccess: (_, entityType) => {
      queryClient.invalidateQueries({ queryKey: tableConfigKeys.all });
      queryClient.invalidateQueries({ queryKey: tableConfigKeys.detail(entityType) });
    },
  });
}

/**
 * Reset configuration to defaults
 */
export function useResetTableConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tableConfigurationsApi.reset,
    onSuccess: (_, entityType) => {
      queryClient.invalidateQueries({ queryKey: tableConfigKeys.all });
      queryClient.invalidateQueries({ queryKey: tableConfigKeys.detail(entityType) });
    },
  });
}
