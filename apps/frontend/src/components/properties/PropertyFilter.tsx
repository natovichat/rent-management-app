/**
 * PropertyFilter - Advanced property filtering and search
 * 
 * Features:
 * - Text search (address, gush, chelka)
 * - Property type filter (multi-select)
 * - Status filter (multi-select)
 * - Country filter
 * - Value range slider
 * - Boolean filters (has mortgage, leased, partial ownership)
 * - Quick filters (preset combinations)
 * - Filter state management
 * - Clear filters
 */

'use client';

import React, { useState } from 'react';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Slider,
  Chip,
  Grid,
  Button,
  InputAdornment,
  SelectChangeEvent,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  FilterAlt as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

// Types
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

interface PropertyFilterProps {
  filters: PropertyFilters;
  onFilterChange: (filters: PropertyFilters) => void;
  onClear?: () => void;
}

// Filter options
const PROPERTY_TYPES = [
  { value: 'RESIDENTIAL', label: 'מגורים' },
  { value: 'COMMERCIAL', label: 'מסחרי' },
  { value: 'LAND', label: 'קרקע' },
  { value: 'MIXED_USE', label: 'שימוש מעורב' },
];

const PROPERTY_STATUSES = [
  { value: 'OWNED', label: 'בבעלות' },
  { value: 'IN_CONSTRUCTION', label: 'בבנייה' },
  { value: 'IN_PURCHASE', label: 'בהליכי רכישה' },
  { value: 'SOLD', label: 'נמכר' },
  { value: 'INVESTMENT', label: 'השקעה' },
];

const COUNTRIES = [
  { value: 'ALL', label: 'הכל' },
  { value: 'Israel', label: 'ישראל' },
  { value: 'Germany', label: 'גרמניה' },
  { value: 'USA', label: 'ארצות הברית' },
  { value: 'France', label: 'צרפת' },
  { value: 'UK', label: 'בריטניה' },
];

const VALUE_RANGE_MIN = 0;
const VALUE_RANGE_MAX = 10000000;
const VALUE_RANGE_STEP = 100000;

// Helper functions
const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `₪${(value / 1000000).toFixed(1)}M`;
  }
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(value);
};

export const PropertyFilter: React.FC<PropertyFilterProps> = ({
  filters,
  onFilterChange,
  onClear,
}) => {
  const [expanded, setExpanded] = useState(true);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: event.target.value });
  };

  const handleTypeChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    onFilterChange({
      ...filters,
      types: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handleStatusChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    onFilterChange({
      ...filters,
      statuses: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handleCountryChange = (event: SelectChangeEvent<string>) => {
    onFilterChange({ ...filters, country: event.target.value });
  };

  const handleValueRangeChange = (event: Event, newValue: number | number[]) => {
    onFilterChange({ ...filters, valueRange: newValue as [number, number] });
  };

  const handleBooleanFilterChange = (field: keyof PropertyFilters) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onFilterChange({ ...filters, [field]: event.target.checked });
  };

  const handleQuickFilter = (filterType: string) => {
    switch (filterType) {
      case 'all':
        handleClearFilters();
        break;
      case 'israel':
        onFilterChange({ ...filters, country: 'Israel' });
        break;
      case 'mortgage':
        onFilterChange({ ...filters, hasMortgage: true });
        break;
      case 'leased':
        onFilterChange({ ...filters, hasActiveLease: true });
        break;
      default:
        break;
    }
  };

  const handleClearFilters = () => {
    if (onClear) {
      onClear();
    } else {
      onFilterChange({});
    }
  };

  const hasActiveFilters = Object.keys(filters).some((key) => {
    const value = filters[key as keyof PropertyFilters];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'boolean') return value;
    return value !== undefined && value !== 'ALL' && value !== '';
  });

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      sx={{ mb: 3 }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          <FilterIcon />
          <Typography fontWeight="600">סינון מתקדם</Typography>
          {hasActiveFilters && (
            <Chip
              label="פעיל"
              size="small"
              color="primary"
              sx={{ ml: 1 }}
            />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          {/* Search */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              placeholder="חיפוש לפי כתובת, גוש, חלקה..."
              value={filters.search || ''}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Property Type */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>סוג נכס</InputLabel>
              <Select
                multiple
                value={filters.types || []}
                onChange={handleTypeChange}
                label="סוג נכס"
                renderValue={(selected) =>
                  selected
                    .map(
                      (value) =>
                        PROPERTY_TYPES.find((type) => type.value === value)?.label
                    )
                    .join(', ')
                }
              >
                {PROPERTY_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Checkbox checked={(filters.types || []).indexOf(type.value) > -1} />
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Status */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>סטטוס</InputLabel>
              <Select
                multiple
                value={filters.statuses || []}
                onChange={handleStatusChange}
                label="סטטוס"
                renderValue={(selected) =>
                  selected
                    .map(
                      (value) =>
                        PROPERTY_STATUSES.find((status) => status.value === value)
                          ?.label
                    )
                    .join(', ')
                }
              >
                {PROPERTY_STATUSES.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    <Checkbox
                      checked={(filters.statuses || []).indexOf(status.value) > -1}
                    />
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Country */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>מדינה</InputLabel>
              <Select
                value={filters.country || 'ALL'}
                onChange={handleCountryChange}
                label="מדינה"
              >
                {COUNTRIES.map((country) => (
                  <MenuItem key={country.value} value={country.value}>
                    {country.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Value Range */}
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>טווח שווי</Typography>
            <Slider
              value={filters.valueRange || [VALUE_RANGE_MIN, VALUE_RANGE_MAX]}
              onChange={handleValueRangeChange}
              valueLabelDisplay="auto"
              valueLabelFormat={formatCurrency}
              min={VALUE_RANGE_MIN}
              max={VALUE_RANGE_MAX}
              step={VALUE_RANGE_STEP}
              marks={[
                { value: 0, label: '₪0' },
                { value: 5000000, label: '₪5M' },
                { value: 10000000, label: '₪10M' },
              ]}
            />
          </Grid>

          {/* Boolean Filters */}
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>סינונים נוספים</Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.hasMortgage || false}
                    onChange={handleBooleanFilterChange('hasMortgage')}
                  />
                }
                label="יש משכנתא"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.hasActiveLease || false}
                    onChange={handleBooleanFilterChange('hasActiveLease')}
                  />
                }
                label="מושכר כרגע"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.hasPartialOwnership || false}
                    onChange={handleBooleanFilterChange('hasPartialOwnership')}
                  />
                }
                label="בעלות חלקית"
              />
            </FormGroup>
          </Grid>

          {/* Quick Filters */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                סינון מהיר:
              </Typography>
              <Chip
                label="כל הנכסים"
                onClick={() => handleQuickFilter('all')}
                variant={!hasActiveFilters ? 'filled' : 'outlined'}
                color={!hasActiveFilters ? 'primary' : 'default'}
              />
              <Chip
                label="בישראל בלבד"
                onClick={() => handleQuickFilter('israel')}
                variant="outlined"
              />
              <Chip
                label="עם משכנתא"
                onClick={() => handleQuickFilter('mortgage')}
                variant="outlined"
              />
              <Chip
                label="מושכרים"
                onClick={() => handleQuickFilter('leased')}
                variant="outlined"
              />
            </Box>
          </Grid>

          {/* Clear Button */}
          {hasActiveFilters && (
            <Grid item xs={12}>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
                fullWidth
              >
                נקה סינונים
              </Button>
            </Grid>
          )}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default PropertyFilter;
