'use client';

import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  SelectChangeEvent,
  CircularProgress,
} from '@mui/material';
import { AccountBalance as AccountIcon } from '@mui/icons-material';
import { useAccount } from '@/contexts/AccountContext';

/**
 * AccountSelector component - Displays account selector in header/navigation.
 * 
 * Features:
 * - Fetches accounts from API (via AccountContext)
 * - Displays account name and ID
 * - Persists selection to localStorage
 * - Updates all entity lists when account changes (via React Query invalidation)
 * - RTL layout support
 * - Loading and error states
 * - Accessible (keyboard navigation, ARIA labels)
 */
export function AccountSelector() {
  const { selectedAccountId, setSelectedAccountId, accounts, isLoading, error } = useAccount();

  const handleChange = (event: SelectChangeEvent<string>) => {
    setSelectedAccountId(event.target.value);
    // React Query invalidation in AccountContext will refresh all data
    // No need to reload page
  };

  // Show loading state (always render container with test ID for E2E tests)
  if (isLoading) {
    return (
      <Box 
        data-testid="account-selector" 
        aria-label="חשבון"
        sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}
      >
        <CircularProgress size={20} />
        <Typography variant="body2" color="text.secondary">
          טוען חשבונות...
        </Typography>
      </Box>
    );
  }

  // Show error state (always render container with test ID for E2E tests)
  if (error) {
    return (
      <Box 
        data-testid="account-selector" 
        aria-label="חשבון"
        sx={{ minWidth: 200 }}
      >
        <Typography variant="body2" color="error">
          שגיאה בטעינת חשבונות
        </Typography>
      </Box>
    );
  }

  // Show empty state (always render container with test ID for E2E tests)
  if (accounts.length === 0) {
    return (
      <Box 
        data-testid="account-selector" 
        aria-label="חשבון"
        sx={{ minWidth: 200 }}
      >
        <Typography variant="body2" color="text.secondary">
          אין חשבונות זמינים
        </Typography>
      </Box>
    );
  }

  // Show disabled selector when no account selected yet (always render for E2E tests)
  if (!selectedAccountId) {
    return (
      <Box sx={{ minWidth: 250, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AccountIcon sx={{ color: 'text.secondary' }} />
        <FormControl 
          fullWidth 
          size="small"
          disabled
          sx={{
            backgroundColor: 'background.paper',
          }}
        >
          <InputLabel id="account-selector-label">חשבון</InputLabel>
          <Select
            labelId="account-selector-label"
            id="account-selector"
            data-testid="account-selector"
            value=""
            label="חשבון"
            aria-label="חשבון"
            sx={{
              backgroundColor: 'background.paper',
            }}
          >
            <MenuItem disabled>טוען...</MenuItem>
          </Select>
        </FormControl>
      </Box>
    );
  }

  return (
    <Box sx={{ minWidth: 250, display: 'flex', alignItems: 'center', gap: 1 }}>
      <AccountIcon sx={{ color: 'text.secondary' }} />
      <FormControl 
        fullWidth 
        size="small"
        sx={{
          backgroundColor: 'background.paper',
        }}
      >
        <InputLabel id="account-selector-label">חשבון</InputLabel>
        <Select
          labelId="account-selector-label"
          id="account-selector"
          data-testid="account-selector"
          value={selectedAccountId}
          label="חשבון"
          onChange={handleChange}
          aria-label="חשבון"
          sx={{
            backgroundColor: 'background.paper',
            '& .MuiSelect-select': {
              py: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            },
          }}
        >
          {accounts.map((account) => (
            <MenuItem key={account.id} value={account.id}>
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  {account.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {account.id.slice(0, 8)}...
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

export default AccountSelector;
