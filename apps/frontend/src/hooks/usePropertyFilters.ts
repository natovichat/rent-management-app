/**
 * usePropertyFilters - Custom hook for managing property filters
 * 
 * Features:
 * - Filter state management
 * - Filter application logic
 * - URL persistence (optional)
 * - Filter reset
 * - Active filters count
 */

import { useState, useCallback, useMemo } from 'react';

export interface PropertyFilters {
  search?: string;
  types?: string[];
  statuses?: string[];
  country?: string;
  valueRange?: [number, number];
  hasMortgage?: boolean;
  hasActiveLease?: boolean;
  hasPartialOwnership?: boolean;
}

interface UsePropertyFiltersReturn {
  filters: PropertyFilters;
  setFilters: (filters: PropertyFilters) => void;
  updateFilter: <K extends keyof PropertyFilters>(
    key: K,
    value: PropertyFilters[K]
  ) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  activeFiltersCount: number;
  applyFilters: <T extends any>(items: T[]) => T[];
}

const DEFAULT_VALUE_RANGE: [number, number] = [0, 10000000];

/**
 * Custom hook for managing property filters
 */
export const usePropertyFilters = (): UsePropertyFiltersReturn => {
  const [filters, setFilters] = useState<PropertyFilters>({});

  // Update a single filter
  const updateFilter = useCallback(
    <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).some((key) => {
      const value = filters[key as keyof PropertyFilters];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'boolean') return value;
      if (key === 'valueRange') {
        const range = value as [number, number] | undefined;
        return (
          range &&
          (range[0] !== DEFAULT_VALUE_RANGE[0] || range[1] !== DEFAULT_VALUE_RANGE[1])
        );
      }
      return value !== undefined && value !== 'ALL' && value !== '';
    });
  }, [filters]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    Object.keys(filters).forEach((key) => {
      const value = filters[key as keyof PropertyFilters];
      if (Array.isArray(value) && value.length > 0) count++;
      else if (typeof value === 'boolean' && value) count++;
      else if (
        key === 'valueRange' &&
        value &&
        ((value as [number, number])[0] !== DEFAULT_VALUE_RANGE[0] ||
          (value as [number, number])[1] !== DEFAULT_VALUE_RANGE[1])
      )
        count++;
      else if (
        value !== undefined &&
        value !== 'ALL' &&
        value !== '' &&
        key !== 'valueRange'
      )
        count++;
    });
    return count;
  }, [filters]);

  // Apply filters to a list of properties
  const applyFilters = useCallback(
    <T extends any>(items: T[]): T[] => {
      return items.filter((item: any) => {
        // Search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          const matchesSearch =
            item.address?.toLowerCase().includes(searchLower) ||
            item.city?.toLowerCase().includes(searchLower) ||
            item.plotInfo?.gush?.includes(filters.search) ||
            item.plotInfo?.chelka?.includes(filters.search);

          if (!matchesSearch) return false;
        }

        // Type filter
        if (filters.types && filters.types.length > 0) {
          if (!item.type || !filters.types.includes(item.type)) return false;
        }

        // Status filter
        if (filters.statuses && filters.statuses.length > 0) {
          if (!item.status || !filters.statuses.includes(item.status)) return false;
        }

        // Country filter
        if (filters.country && filters.country !== 'ALL') {
          if (item.country !== filters.country) return false;
        }

        // Value range filter
        if (filters.valueRange) {
          const [min, max] = filters.valueRange;
          if (
            !item.estimatedValue ||
            item.estimatedValue < min ||
            item.estimatedValue > max
          ) {
            return false;
          }
        }

        // Has mortgage filter
        if (filters.hasMortgage) {
          const hasMortgage =
            item._count?.mortgages > 0 || item.mortgages?.length > 0;
          if (!hasMortgage) return false;
        }

        // Has active lease filter
        if (filters.hasActiveLease) {
          if (!item.hasActiveLease) return false;
        }

        // Has partial ownership filter
        if (filters.hasPartialOwnership) {
          const hasPartialOwnership =
            item.ownerships && item.ownerships.length > 1;
          if (!hasPartialOwnership) return false;
        }

        return true;
      });
    },
    [filters]
  );

  return {
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    activeFiltersCount,
    applyFilters,
  };
};

export default usePropertyFilters;
