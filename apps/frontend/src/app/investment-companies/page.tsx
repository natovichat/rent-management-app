'use client';

import { Container, Typography, Box } from '@mui/material';
import InvestmentCompanyList from '@/components/investment-companies/InvestmentCompanyList';
import { AccountSelector } from '@/components/layout/AccountSelector';
import QuickNavigator from '@/components/navigation/QuickNavigator';

/**
 * Investment Companies management page.
 * 
 * Features:
 * - Investment companies list with DataGrid
 * - Create, edit, delete investment companies
 * - Hebrew RTL support
 */
export default function InvestmentCompaniesPage() {
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <QuickNavigator label="מעבר לטבלה" size="small" width={200} />
          <AccountSelector />
        </Box>
      </Box>

      <InvestmentCompanyList />
    </Container>
  );
}
