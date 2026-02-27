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
  const { data: config, isLoading, error } = useTableConfiguration(entityType);

  console.log('🔍 useConfiguredColumns DEBUG:');
  console.log('  entityType:', entityType);
  console.log('  isLoading:', isLoading);
  console.log('  error:', error);
  console.log('  config:', config);
  console.log('  allColumnsCount:', allColumns.length);
  console.log('  configColumnsCount:', config?.columns?.length);

  return useMemo(() => {
    // If no configuration, return all columns in original order
    if (!config || !config.columns) {
      console.log('⚠️ No config found, returning all columns');
      return allColumns;
    }

    // Create a map of field -> column definition
    const columnMap = new Map<string, GridColDef<T>>();
    allColumns.forEach((col) => {
      columnMap.set(col.field, col);
    });

    // Filter and sort based on configuration
    const visibleConfigs = config.columns.filter((colConfig) => colConfig.visible);
    console.log('  visibleConfigs count:', visibleConfigs.length);
    
    const sortedConfigs = [...visibleConfigs].sort((a, b) => a.order - b.order);
    console.log('  sortedConfigs count:', sortedConfigs.length);
    
    const mappedColumns = sortedConfigs.map((colConfig) => {
      const col = columnMap.get(colConfig.field);
      if (!col) {
        console.warn(`  ⚠️ Column not found in columnMap: ${colConfig.field}`);
      }
      return col;
    });
    
    const configured = mappedColumns.filter((col): col is GridColDef<T> => col !== undefined);
    console.log('  configured columns count:', configured.length);
    console.log('  configured column fields:', configured.map(c => c.field).join(', '));

    // Always include 'actions' column at the end if it exists
    const actionsColumn = allColumns.find((col) => col.field === 'actions');
    if (actionsColumn && !configured.find((col) => col.field === 'actions')) {
      configured.push(actionsColumn);
    }

    console.log('  final columns count:', configured.length);
    return configured;
  }, [config, allColumns]);
}
