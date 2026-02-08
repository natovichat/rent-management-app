'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  SelectChangeEvent,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Home as HomeIcon,
  Apartment as ApartmentIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Description as LeaseIcon,
  AccountBalance as BankIcon,
  AccountBalanceWallet as MortgageIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
  Assessment as DashboardIcon,
} from '@mui/icons-material';

interface NavigationOption {
  value: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navigationOptions: NavigationOption[] = [
  {
    value: 'dashboard',
    label: 'לוח בקרה',
    icon: <DashboardIcon />,
    path: '/dashboard',
  },
  {
    value: 'properties',
    label: 'נכסים',
    icon: <HomeIcon />,
    path: '/properties',
  },
  {
    value: 'units',
    label: 'יחידות',
    icon: <ApartmentIcon />,
    path: '/units',
  },
  {
    value: 'leases',
    label: 'שכירויות',
    icon: <LeaseIcon />,
    path: '/leases',
  },
  {
    value: 'tenants',
    label: 'דיירים',
    icon: <PeopleIcon />,
    path: '/tenants',
  },
  {
    value: 'owners',
    label: 'בעלים',
    icon: <BusinessIcon />,
    path: '/owners',
  },
  {
    value: 'mortgages',
    label: 'משכנתאות',
    icon: <MortgageIcon />,
    path: '/mortgages',
  },
  {
    value: 'bank-accounts',
    label: 'חשבונות בנק',
    icon: <BankIcon />,
    path: '/bank-accounts',
  },
  {
    value: 'income',
    label: 'הכנסות',
    icon: <TrendingUpIcon />,
    path: '/income',
  },
  {
    value: 'expenses',
    label: 'הוצאות',
    icon: <MoneyIcon />,
    path: '/expenses',
  },
  {
    value: 'investment-companies',
    label: 'חברות השקעה',
    icon: <BusinessIcon />,
    path: '/investment-companies',
  },
  {
    value: 'notifications',
    label: 'התראות',
    icon: <NotificationsIcon />,
    path: '/notifications',
  },
];

interface QuickNavigatorProps {
  /**
   * Optional label for the selector
   */
  label?: string;
  
  /**
   * Optional size variant
   */
  size?: 'small' | 'medium';
  
  /**
   * Optional width
   */
  width?: number | string;
}

/**
 * QuickNavigator - A combo-box component for quick navigation between tables/pages
 * 
 * Usage:
 * ```tsx
 * <QuickNavigator label="מעבר לטבלה" size="small" width={200} />
 * ```
 * 
 * Can be added to any page header for quick navigation.
 */
export default function QuickNavigator({
  label = 'מעבר מהיר',
  size = 'small',
  width = 200,
}: QuickNavigatorProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Find current page value based on pathname
  const getCurrentValue = () => {
    const current = navigationOptions.find(option => 
      pathname.startsWith(option.path)
    );
    return current?.value || '';
  };

  const handleChange = (event: SelectChangeEvent<string>) => {
    const selectedOption = navigationOptions.find(
      option => option.value === event.target.value
    );
    
    if (selectedOption) {
      router.push(selectedOption.path);
    }
  };

  const handleHomeClick = () => {
    router.push('/');
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip title="חזרה למסך הראשי" placement="bottom">
        <IconButton 
          onClick={handleHomeClick}
          color="primary"
          size={size}
          sx={{
            '&:hover': {
              backgroundColor: 'primary.lighter',
            },
          }}
        >
          <HomeIcon />
        </IconButton>
      </Tooltip>
      
      <Box sx={{ minWidth: width }}>
        <FormControl fullWidth size={size}>
          <InputLabel id="quick-navigator-label">{label}</InputLabel>
          <Select
            labelId="quick-navigator-label"
            id="quick-navigator-select"
            value={getCurrentValue()}
            label={label}
            onChange={handleChange}
            sx={{
              '& .MuiSelect-select': {
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              },
            }}
          >
            {navigationOptions.map((option) => (
              <MenuItem 
                key={option.value} 
                value={option.value}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                  {option.icon}
                </Box>
                <Box>{option.label}</Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
}
