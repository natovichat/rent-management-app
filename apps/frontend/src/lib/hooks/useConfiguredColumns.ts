import { useMemo } from 'react';
import { GridColDef, GridValidRowModel } from '@mui/x-data-grid';
import { useTableConfiguration } from './useTableConfigurations';
import { EntityType } from '@/types/table-config';

/**
 * Hook to get configured columns for a table
 * 
 * Usage:
 * ```tsx
 * const allColumns: GridColDef[] = [...]; // All available columns
 * const configuredColumns = useConfiguredColumns('properties', allColumns);
 * 
 * <DataGrid columns={configuredColumns} ... />
 * ```
 * 
 * This hook:
 * 1. Fetches the table configuration from the API
 * 2. Filters columns based on visibility
 * 3. Sorts columns based on configured order
 * 4. Falls back to all columns if no configuration exists
 */
export function useConfiguredColumns<T extends GridValidRowModel = any>(
  entityType: EntityType,
  allColumns: GridColDef<T>[],
): GridColDef<T>[] {
  const { data: config } = useTableConfiguration(entityType);

  return useMemo(() => {
    // If no configuration, return all columns in original order
    if (!config || !config.columns) {
      return allColumns;
    }

    // Create a map of field -> column definition
    const columnMap = new Map<string, GridColDef<T>>();
    allColumns.forEach((col) => {
      columnMap.set(col.field, col);
    });

    // Filter and sort based on configuration
    const configured = config.columns
      .filter((colConfig) => colConfig.visible) // Only visible columns
      .sort((a, b) => a.order - b.order) // Sort by order
      .map((colConfig) => columnMap.get(colConfig.field)) // Get GridColDef
      .filter((col): col is GridColDef<T> => col !== undefined); // Remove undefined

    // Always include 'actions' column at the end if it exists
    const actionsColumn = allColumns.find((col) => col.field === 'actions');
    if (actionsColumn && !configured.find((col) => col.field === 'actions')) {
      configured.push(actionsColumn);
    }

    return configured;
  }, [config, allColumns]);
}
