'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Typography, Box } from '@mui/material';
import { isAuthenticated } from '@/lib/auth';
import BankAccountList from '@/components/bank-accounts/BankAccountList';
import { AccountSelector } from '@/components/layout/AccountSelector';
import QuickNavigator from '@/components/navigation/QuickNavigator';

/**
 * Bank Accounts management page.
 * 
 * Features:
 * - Protected route with authentication check
 * - Bank accounts list with DataGrid
 * - Create, edit, delete bank accounts
 * - Activate/deactivate accounts
 * - Hebrew RTL support
 */
export default function BankAccountsPage() {
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push('/');
      return;
    }
  }, [router]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header with Account Selector */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            ניהול חשבונות בנק
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ניהול חשבונות בנק, צפייה בפרטים וסינון
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <QuickNavigator label="מעבר לטבלה" size="small" width={200} />
          <AccountSelector />
        </Box>
      </Box>

      <BankAccountList />
    </Container>
  );
}
