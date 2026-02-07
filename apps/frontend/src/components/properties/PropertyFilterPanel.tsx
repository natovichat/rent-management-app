'use client';

import { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Grid,
  SelectChangeEvent,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Clear as ClearIcon,
  FilterAlt as FilterIcon,
} from '@mui/icons-material';
import { PropertyType, PropertyStatus, PropertyFilters } from '@/services/properties';

interface PropertyFilterPanelProps {
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
  onClear: () => void;
}

// Filter options with Hebrew labels
const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'RESIDENTIAL', label: 'מגורים' },
  { value: 'COMMERCIAL', label: 'מסחרי' },
  { value: 'LAND', label: 'קרקע' },
  { value: 'MIXED_USE', label: 'שימוש מעורב' },
];

const PROPERTY_STATUSES: { value: PropertyStatus; label: string }[] = [
  { value: 'OWNED', label: 'בבעלות' },
  { value: 'IN_CONSTRUCTION', label: 'בבנייה' },
  { value: 'IN_PURCHASE', label: 'בהליכי רכישה' },
  { value: 'SOLD', label: 'נמכר' },
  { value: 'INVESTMENT', label: 'השקעה' },
];

const COUNTRIES = [
  { value: 'Israel', label: 'ישראל' },
  { value: 'Germany', label: 'גרמניה' },
  { value: 'USA', label: 'ארצות הברית' },
  { value: 'France', label: 'צרפת' },
  { value: 'UK', label: 'בריטניה' },
];

/**
 * PropertyFilterPanel - Accordion-based filter panel for properties
 * 
 * Features:
 * - Type multi-select dropdown
 * - Status multi-select dropdown
 * - City text field (debounced)
 * - Country select (default: Israel)
 * - isMortgaged checkbox
 * - Clear Filters button
 * - RTL support with Hebrew labels
 */
export default function PropertyFilterPanel({
  filters,
  onFiltersChange,
  onClear,
}: PropertyFilterPanelProps) {
  const [expanded, setExpanded] = useState(false); // Changed to false - closed by default
  const [cityInput, setCityInput] = useState(filters.city || '');

  // Debounce city input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (cityInput !== filters.city) {
        onFiltersChange({
          ...filters,
          city: cityInput || undefined,
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [cityInput]);

  const handleTypeChange = (event: SelectChangeEvent<PropertyType[]>) => {
    const value = event.target.value;
    const types = typeof value === 'string' ? [value as PropertyType] : value;
    onFiltersChange({
      ...filters,
      type: types.length > 0 ? types : undefined,
    });
  };

  const handleStatusChange = (event: SelectChangeEvent<PropertyStatus[]>) => {
    const value = event.target.value;
    const statuses = typeof value === 'string' ? [value as PropertyStatus] : value;
    onFiltersChange({
      ...filters,
      status: statuses.length > 0 ? statuses : undefined,
    });
  };

  const handleCountryChange = (event: SelectChangeEvent<string>) => {
    onFiltersChange({
      ...filters,
      country: event.target.value || undefined,
    });
  };

  const handleIsMortgagedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      isMortgaged: event.target.checked || undefined,
    });
  };

  const hasActiveFilters = Boolean(
    filters.type ||
    filters.status ||
    filters.city ||
    filters.country ||
    filters.isMortgaged ||
    filters.minEstimatedValue ||
    filters.maxEstimatedValue ||
    filters.minTotalArea ||
    filters.maxTotalArea ||
    filters.minLandArea ||
    filters.maxLandArea ||
    filters.createdFrom ||
    filters.createdTo ||
    filters.valuationFrom ||
    filters.valuationTo
  );

  const typeArray = Array.isArray(filters.type) ? filters.type : filters.type ? [filters.type] : [];
  const statusArray = Array.isArray(filters.status) ? filters.status : filters.status ? [filters.status] : [];

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      sx={{ mb: 2, direction: 'rtl' }}
      data-testid="property-filter-panel"
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          '& .MuiAccordionSummary-content': {
            alignItems: 'center',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon />
          <Typography fontWeight={600}>סינון נכסים</Typography>
          {hasActiveFilters && (
            <Typography
              variant="caption"
              sx={{
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontSize: '0.75rem',
              }}
            >
              פעיל
            </Typography>
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2} sx={{ direction: 'rtl' }}>
          {/* Type Multi-Select */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>סוג נכס</InputLabel>
              <Select
                multiple
                value={typeArray}
                onChange={handleTypeChange}
                label="סוג נכס"
                data-testid="filter-property-type"
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
                    <Checkbox checked={typeArray.indexOf(type.value) > -1} />
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Status Multi-Select */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>סטטוס</InputLabel>
              <Select
                multiple
                value={statusArray}
                onChange={handleStatusChange}
                label="סטטוס"
                data-testid="filter-property-status"
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
                    <Checkbox checked={statusArray.indexOf(status.value) > -1} />
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* City Text Field */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="עיר"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="הזן שם עיר"
              inputProps={{ 'data-testid': 'filter-city-input' }}
            />
          </Grid>

          {/* Country Select */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>מדינה</InputLabel>
              <Select
                value={filters.country || 'Israel'}
                onChange={handleCountryChange}
                label="מדינה"
                data-testid="filter-country"
              >
                {COUNTRIES.map((country) => (
                  <MenuItem key={country.value} value={country.value}>
                    {country.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* isMortgaged Checkbox */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.isMortgaged || false}
                  onChange={handleIsMortgagedChange}
                  data-testid="filter-is-mortgaged"
                />
              }
              label="יש משכנתא"
            />
          </Grid>

          {/* Advanced Filters Divider */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                סינונים מתקדמים
              </Typography>
            </Divider>
          </Grid>

          {/* Estimated Value Range */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="ערך משוער מינימלי (₪)"
              type="number"
              value={filters.minEstimatedValue || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  minEstimatedValue: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                })
              }
              inputProps={{ 'data-testid': 'filter-min-estimated-value' }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="ערך משוער מקסימלי (₪)"
              type="number"
              value={filters.maxEstimatedValue || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  maxEstimatedValue: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                })
              }
              inputProps={{ 'data-testid': 'filter-max-estimated-value' }}
            />
          </Grid>

          {/* Total Area Range */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="שטח כולל מינימלי (מ״ר)"
              type="number"
              value={filters.minTotalArea || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  minTotalArea: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                })
              }
              inputProps={{ 'data-testid': 'filter-min-total-area' }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="שטח כולל מקסימלי (מ״ר)"
              type="number"
              value={filters.maxTotalArea || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  maxTotalArea: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                })
              }
              inputProps={{ 'data-testid': 'filter-max-total-area' }}
            />
          </Grid>

          {/* Land Area Range */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="שטח קרקע מינימלי (מ״ר)"
              type="number"
              value={filters.minLandArea || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  minLandArea: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                })
              }
              inputProps={{ 'data-testid': 'filter-min-land-area' }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="שטח קרקע מקסימלי (מ״ר)"
              type="number"
              value={filters.maxLandArea || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  maxLandArea: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                })
              }
              inputProps={{ 'data-testid': 'filter-max-land-area' }}
            />
          </Grid>

          {/* Created Date Range */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="תאריך יצירה מ-"
              type="date"
              value={filters.createdFrom || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  createdFrom: e.target.value || undefined,
                })
              }
              InputLabelProps={{ shrink: true }}
              inputProps={{ 'data-testid': 'filter-created-from' }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="תאריך יצירה עד"
              type="date"
              value={filters.createdTo || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  createdTo: e.target.value || undefined,
                })
              }
              InputLabelProps={{ shrink: true }}
              inputProps={{ 'data-testid': 'filter-created-to' }}
            />
          </Grid>

          {/* Valuation Date Range */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="תאריך הערכה אחרונה מ-"
              type="date"
              value={filters.valuationFrom || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  valuationFrom: e.target.value || undefined,
                })
              }
              InputLabelProps={{ shrink: true }}
              inputProps={{ 'data-testid': 'filter-valuation-from' }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="תאריך הערכה אחרונה עד"
              type="date"
              value={filters.valuationTo || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  valuationTo: e.target.value || undefined,
                })
              }
              InputLabelProps={{ shrink: true }}
              inputProps={{ 'data-testid': 'filter-valuation-to' }}
            />
          </Grid>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Grid item xs={12}>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<ClearIcon />}
                onClick={onClear}
                fullWidth
                data-testid="clear-filters-button"
              >
                נקה סינונים
              </Button>
            </Grid>
          )}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
