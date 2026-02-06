'use client';

import { Box, Chip, Button } from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';
import { PropertyFilters, PropertyType, PropertyStatus } from '@/services/properties';

interface ActiveFiltersChipsProps {
  filters: PropertyFilters;
  onRemoveFilter: (filterKey: keyof PropertyFilters, value?: string) => void;
  onClearAll: () => void;
}

// Filter labels mapping
const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  RESIDENTIAL: 'מגורים',
  COMMERCIAL: 'מסחרי',
  LAND: 'קרקע',
  MIXED_USE: 'שימוש מעורב',
};

const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  OWNED: 'בבעלות',
  IN_CONSTRUCTION: 'בבנייה',
  IN_PURCHASE: 'בהליכי רכישה',
  SOLD: 'נמכר',
  INVESTMENT: 'השקעה',
};

/**
 * ActiveFiltersChips - Displays active filters as removable chips
 * 
 * Features:
 * - Shows active filters as chips
 * - Remove individual filters (X icon)
 * - Clear All button
 * - Hebrew labels for filter names and values
 * - RTL support
 */
export default function ActiveFiltersChips({
  filters,
  onRemoveFilter,
  onClearAll,
}: ActiveFiltersChipsProps) {
  const activeFilters: Array<{ key: keyof PropertyFilters; label: string; value: string }> = [];

  // Add type filters
  if (filters.type) {
    const types = Array.isArray(filters.type) ? filters.type : [filters.type];
    types.forEach((type) => {
      activeFilters.push({
        key: 'type',
        label: `סוג: ${PROPERTY_TYPE_LABELS[type]}`,
        value: type,
      });
    });
  }

  // Add status filters
  if (filters.status) {
    const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
    statuses.forEach((status) => {
      activeFilters.push({
        key: 'status',
        label: `סטטוס: ${PROPERTY_STATUS_LABELS[status]}`,
        value: status,
      });
    });
  }

  // Add city filter
  if (filters.city) {
    activeFilters.push({
      key: 'city',
      label: `עיר: ${filters.city}`,
      value: filters.city,
    });
  }

  // Add country filter
  if (filters.country) {
    activeFilters.push({
      key: 'country',
      label: `מדינה: ${filters.country === 'Israel' ? 'ישראל' : filters.country}`,
      value: filters.country,
    });
  }

  // Add isMortgaged filter
  if (filters.isMortgaged) {
    activeFilters.push({
      key: 'isMortgaged',
      label: 'יש משכנתא',
      value: 'true',
    });
  }

  if (activeFilters.length === 0) {
    return null;
  }

  const handleRemoveFilter = (filterKey: keyof PropertyFilters, value?: string) => {
    onRemoveFilter(filterKey, value);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        alignItems: 'center',
        mb: 2,
        direction: 'rtl',
      }}
    >
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, flex: 1 }}>
        {activeFilters.map((filter, index) => (
          <Chip
            key={`${filter.key}-${filter.value}-${index}`}
            label={filter.label}
            onDelete={() => handleRemoveFilter(filter.key, filter.value)}
            deleteIcon={<ClearIcon />}
            color="primary"
            variant="outlined"
            sx={{
              direction: 'rtl',
              '& .MuiChip-label': {
                textAlign: 'right',
              },
            }}
          />
        ))}
      </Box>
      {activeFilters.length > 0 && (
        <Button
          size="small"
          variant="text"
          onClick={onClearAll}
          sx={{ minWidth: 'auto', px: 1 }}
          data-testid="clear-all-filters-button"
        >
          נקה הכל
        </Button>
      )}
    </Box>
  );
}
