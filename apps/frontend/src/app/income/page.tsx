'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Typography, Box } from '@mui/material';
import { isAuthenticated } from '@/lib/auth';
import IncomeListPage from '@/components/financials/IncomeListPage';
import { AccountSelector } from '@/components/layout/AccountSelector';

/**
 * Income management page.
 * 
 * Features:
 * - Protected route with authentication check
 * - Income list with DataGrid
 * - Property filtering
 * - Create, edit, delete income records
 * - Hebrew RTL support
 */
export default function IncomePage() {
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
            ניהול הכנסות
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ניהול הכנסות נכסים, צפייה בפרטים וסינון
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AccountSelector />
        </Box>
      </Box>

      <IncomeListPage />
    </Container>
  );
}
