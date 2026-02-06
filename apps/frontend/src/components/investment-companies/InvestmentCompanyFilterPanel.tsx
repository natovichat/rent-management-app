'use client';

import { useState } from 'react';
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
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Clear as ClearIcon,
  FilterAlt as FilterIcon,
} from '@mui/icons-material';
import { InvestmentCompanyFilters } from '@/services/investmentCompanies';

interface InvestmentCompanyFilterPanelProps {
  filters: InvestmentCompanyFilters;
  onFiltersChange: (filters: InvestmentCompanyFilters) => void;
  onClear: () => void;
}

const COUNTRIES = [
  { value: 'Israel', label: 'ישראל' },
  { value: 'Germany', label: 'גרמניה' },
  { value: 'USA', label: 'ארצות הברית' },
  { value: 'France', label: 'צרפת' },
  { value: 'UK', label: 'בריטניה' },
];

/**
 * InvestmentCompanyFilterPanel - Accordion-based filter panel for investment companies
 * 
 * Features:
 * - Country dropdown
 * - Investment amount range (min/max)
 * - Ownership percentage range (min/max)
 * - Property count range (min/max)
 * - Clear Filters button
 * - RTL support with Hebrew labels
 */
export default function InvestmentCompanyFilterPanel({
  filters,
  onFiltersChange,
  onClear,
}: InvestmentCompanyFilterPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const handleCountryChange = (event: SelectChangeEvent<string>) => {
    onFiltersChange({
      ...filters,
      country: event.target.value || undefined,
    });
  };

  const hasActiveFilters = Boolean(
    filters.country ||
    filters.minInvestmentAmount !== undefined ||
    filters.maxInvestmentAmount !== undefined ||
    filters.minOwnershipPercentage !== undefined ||
    filters.maxOwnershipPercentage !== undefined ||
    filters.minPropertyCount !== undefined ||
    filters.maxPropertyCount !== undefined
  );

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      sx={{ mb: 2, direction: 'rtl' }}
      data-testid="investment-company-filter-panel"
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
          <Typography fontWeight={600}>סינון חברות השקעה</Typography>
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
          {/* Country Select */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>מדינה</InputLabel>
              <Select
                value={filters.country || ''}
                onChange={handleCountryChange}
                label="מדינה"
                data-testid="filter-country"
              >
                <MenuItem value="">הכל</MenuItem>
                {COUNTRIES.map((country) => (
                  <MenuItem key={country.value} value={country.value}>
                    {country.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Investment Amount Range */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="סכום השקעה מינימלי (₪)"
              type="number"
              value={filters.minInvestmentAmount || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  minInvestmentAmount: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                })
              }
              inputProps={{ 'data-testid': 'filter-min-investment-amount' }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="סכום השקעה מקסימלי (₪)"
              type="number"
              value={filters.maxInvestmentAmount || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  maxInvestmentAmount: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                })
              }
              inputProps={{ 'data-testid': 'filter-max-investment-amount' }}
            />
          </Grid>

          {/* Ownership Percentage Range */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="אחוז בעלות מינימלי (%)"
              type="number"
              value={filters.minOwnershipPercentage || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  minOwnershipPercentage: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                })
              }
              inputProps={{ 
                'data-testid': 'filter-min-ownership-percentage',
                min: 0,
                max: 100,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="אחוז בעלות מקסימלי (%)"
              type="number"
              value={filters.maxOwnershipPercentage || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  maxOwnershipPercentage: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                })
              }
              inputProps={{ 
                'data-testid': 'filter-max-ownership-percentage',
                min: 0,
                max: 100,
              }}
            />
          </Grid>

          {/* Property Count Range */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="מספר נכסים מינימלי"
              type="number"
              value={filters.minPropertyCount || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  minPropertyCount: e.target.value
                    ? parseInt(e.target.value, 10)
                    : undefined,
                })
              }
              inputProps={{ 
                'data-testid': 'filter-min-property-count',
                min: 0,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="מספר נכסים מקסימלי"
              type="number"
              value={filters.maxPropertyCount || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  maxPropertyCount: e.target.value
                    ? parseInt(e.target.value, 10)
                    : undefined,
                })
              }
              inputProps={{ 
                'data-testid': 'filter-max-property-count',
                min: 0,
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
