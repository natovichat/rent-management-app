'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Typography, Box } from '@mui/material';
import { isAuthenticated } from '@/lib/auth';
import InvestmentCompanyList from '@/components/investment-companies/InvestmentCompanyList';
import { AccountSelector } from '@/components/layout/AccountSelector';

/**
 * Investment Companies management page.
 * 
 * Features:
 * - Protected route with authentication check
 * - Investment companies list with DataGrid
 * - Create, edit, delete investment companies
 * - Hebrew RTL support
 */
export default function InvestmentCompaniesPage() {
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
            ניהול חברות השקעה
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ניהול חברות השקעה, צפייה בפרטים וחיפוש
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AccountSelector />
        </Box>
      </Box>

      <InvestmentCompanyList />
    </Container>
  );
}
