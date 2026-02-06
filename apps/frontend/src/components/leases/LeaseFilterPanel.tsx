'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  Button,
  Grid,
  SelectChangeEvent,
  Autocomplete,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Clear as ClearIcon,
  FilterAlt as FilterIcon,
} from '@mui/icons-material';
import { LeaseFilters } from '@/lib/api/leases';
import { propertiesApi } from '@/services/properties';
import { tenantsApi } from '@/lib/api/tenants';
import { useAccount } from '@/contexts/AccountContext';

interface LeaseFilterPanelProps {
  filters: LeaseFilters;
  onFiltersChange: (filters: LeaseFilters) => void;
  onClear: () => void;
}

/**
 * LeaseFilterPanel - Accordion-based filter panel for leases
 * 
 * Features:
 * - Start date range (from/to)
 * - End date range (from/to)
 * - Monthly rent range (min/max)
 * - Property dropdown (autocomplete)
 * - Tenant dropdown (autocomplete)
 * - Clear Filters button
 * - RTL support with Hebrew labels
 */
export default function LeaseFilterPanel({
  filters,
  onFiltersChange,
  onClear,
}: LeaseFilterPanelProps) {
  const { selectedAccountId } = useAccount();
  const [expanded, setExpanded] = useState(false);

  // Fetch properties and tenants for dropdowns
  const { data: propertiesData } = useQuery({
    queryKey: ['properties', selectedAccountId, 1, 100],
    queryFn: () => propertiesApi.getAll(1, 100),
    enabled: !!selectedAccountId,
  });

  const { data: tenantsData = [] } = useQuery({
    queryKey: ['tenants', selectedAccountId],
    queryFn: () => tenantsApi.getAll(),
    enabled: !!selectedAccountId,
  });

  const properties = propertiesData?.data || [];
  const tenants = tenantsData || [];

  const hasActiveFilters = Boolean(
    filters.startDateFrom ||
    filters.startDateTo ||
    filters.endDateFrom ||
    filters.endDateTo ||
    filters.minMonthlyRent !== undefined ||
    filters.maxMonthlyRent !== undefined ||
    filters.propertyId ||
    filters.tenantId
  );

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      sx={{ mb: 2, direction: 'rtl' }}
      data-testid="lease-filter-panel"
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
          <Typography fontWeight={600}>סינון חוזים</Typography>
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
          {/* Start Date Range */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="תאריך התחלה מ-"
              type="date"
              value={filters.startDateFrom || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  startDateFrom: e.target.value || undefined,
                })
              }
              InputLabelProps={{ shrink: true }}
              inputProps={{ 'data-testid': 'filter-start-date-from' }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="תאריך התחלה עד"
              type="date"
              value={filters.startDateTo || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  startDateTo: e.target.value || undefined,
                })
              }
              InputLabelProps={{ shrink: true }}
              inputProps={{ 'data-testid': 'filter-start-date-to' }}
            />
          </Grid>

          {/* End Date Range */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="תאריך סיום מ-"
              type="date"
              value={filters.endDateFrom || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  endDateFrom: e.target.value || undefined,
                })
              }
              InputLabelProps={{ shrink: true }}
              inputProps={{ 'data-testid': 'filter-end-date-from' }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="תאריך סיום עד"
              type="date"
              value={filters.endDateTo || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  endDateTo: e.target.value || undefined,
                })
              }
              InputLabelProps={{ shrink: true }}
              inputProps={{ 'data-testid': 'filter-end-date-to' }}
            />
          </Grid>

          {/* Monthly Rent Range */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="שכירות חודשית מינימלית (₪)"
              type="number"
              value={filters.minMonthlyRent || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  minMonthlyRent: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                })
              }
              inputProps={{ 'data-testid': 'filter-min-monthly-rent' }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="שכירות חודשית מקסימלית (₪)"
              type="number"
              value={filters.maxMonthlyRent || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  maxMonthlyRent: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                })
              }
              inputProps={{ 'data-testid': 'filter-max-monthly-rent' }}
            />
          </Grid>

          {/* Property Autocomplete */}
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={properties}
              getOptionLabel={(option) => option.address || ''}
              value={properties.find((p) => p.id === filters.propertyId) || null}
              onChange={(_, value) =>
                onFiltersChange({
                  ...filters,
                  propertyId: value?.id || undefined,
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="נכס"
                  inputProps={{ ...params.inputProps, 'data-testid': 'filter-property' }}
                />
              )}
            />
          </Grid>

          {/* Tenant Autocomplete */}
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={tenants}
              getOptionLabel={(option) => option.name || ''}
              value={tenants.find((t) => t.id === filters.tenantId) || null}
              onChange={(_, value) =>
                onFiltersChange({
                  ...filters,
                  tenantId: value?.id || undefined,
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="דייר"
                  inputProps={{ ...params.inputProps, 'data-testid': 'filter-tenant' }}
                />
              )}
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
