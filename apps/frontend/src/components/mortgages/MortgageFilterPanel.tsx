'use client';

import { useState } from 'react';
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
import { MortgageFilters } from '@/lib/api/mortgages';
import { propertiesApi } from '@/services/properties';
import { useAccount } from '@/contexts/AccountContext';

interface MortgageFilterPanelProps {
  filters: MortgageFilters;
  onFiltersChange: (filters: MortgageFilters) => void;
  onClear: () => void;
}

const MORTGAGE_STATUSES = [
  { value: 'ACTIVE', label: 'פעיל' },
  { value: 'PAID_OFF', label: 'סולק' },
  { value: 'REFINANCED', label: 'מימון מחדש' },
  { value: 'DEFAULTED', label: 'ברירת מחדל' },
];

/**
 * MortgageFilterPanel - Accordion-based filter panel for mortgages
 * 
 * Features:
 * - Status dropdown
 * - Bank text field (for bank name search)
 * - Property dropdown (autocomplete)
 * - Loan amount range (min/max)
 * - Interest rate range (min/max)
 * - Clear Filters button
 * - RTL support with Hebrew labels
 */
export default function MortgageFilterPanel({
  filters,
  onFiltersChange,
  onClear,
}: MortgageFilterPanelProps) {
  const { selectedAccountId } = useAccount();
  const [expanded, setExpanded] = useState(false);

  // Fetch properties for dropdown
  const { data: propertiesData } = useQuery({
    queryKey: ['properties', selectedAccountId, 1, 100],
    queryFn: () => propertiesApi.getAll(1, 100),
    enabled: !!selectedAccountId,
  });

  const properties = propertiesData?.data || [];

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    onFiltersChange({
      ...filters,
      status: (event.target.value || undefined) as MortgageFilters['status'],
    });
  };

  const hasActiveFilters = Boolean(
    filters.status ||
    filters.bank ||
    filters.propertyId ||
    filters.minLoanAmount !== undefined ||
    filters.maxLoanAmount !== undefined ||
    filters.minInterestRate !== undefined ||
    filters.maxInterestRate !== undefined
  );

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      sx={{ mb: 2, direction: 'rtl' }}
      data-testid="mortgage-filter-panel"
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
          <Typography fontWeight={600}>סינון משכנתאות</Typography>
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
          {/* Status Select */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>סטטוס</InputLabel>
              <Select
                value={filters.status || ''}
                onChange={handleStatusChange}
                label="סטטוס"
                data-testid="filter-status"
              >
                <MenuItem value="">הכל</MenuItem>
                {MORTGAGE_STATUSES.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Bank Text Field */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="בנק"
              value={filters.bank || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  bank: e.target.value || undefined,
                })
              }
              inputProps={{ 'data-testid': 'filter-bank' }}
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

          {/* Loan Amount Range */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="סכום הלוואה מינימלי (₪)"
              type="number"
              value={filters.minLoanAmount || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  minLoanAmount: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                })
              }
              inputProps={{ 'data-testid': 'filter-min-loan-amount' }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="סכום הלוואה מקסימלי (₪)"
              type="number"
              value={filters.maxLoanAmount || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  maxLoanAmount: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                })
              }
              inputProps={{ 'data-testid': 'filter-max-loan-amount' }}
            />
          </Grid>

          {/* Interest Rate Range */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="ריבית מינימלית (%)"
              type="number"
              value={filters.minInterestRate || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  minInterestRate: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                })
              }
              inputProps={{ 
                'data-testid': 'filter-min-interest-rate',
                min: 0,
                max: 100,
                step: 0.01,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="ריבית מקסימלית (%)"
              type="number"
              value={filters.maxInterestRate || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  maxInterestRate: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                })
              }
              inputProps={{ 
                'data-testid': 'filter-max-interest-rate',
                min: 0,
                max: 100,
                step: 0.01,
              }}
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
