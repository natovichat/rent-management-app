'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Typography, Box } from '@mui/material';
import { isAuthenticated } from '@/lib/auth';
import ExpensesListPage from '@/components/financials/ExpensesListPage';
import { AccountSelector } from '@/components/layout/AccountSelector';

/**
 * Expenses management page.
 * 
 * Features:
 * - Protected route with authentication check
 * - Expenses list with DataGrid
 * - Property filtering
 * - Create, edit, delete expenses
 * - Hebrew RTL support
 */
export default function ExpensesPage() {
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
            ניהול הוצאות
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ניהול הוצאות נכסים, צפייה בפרטים וסינון
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AccountSelector />
        </Box>
      </Box>

      <ExpensesListPage />
    </Container>
  );
}
