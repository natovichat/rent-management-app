'use client';

import { Container, Typography, Box } from '@mui/material';
import IncomeListPage from '@/components/financials/IncomeListPage';
import { AccountSelector } from '@/components/layout/AccountSelector';
import QuickNavigator from '@/components/navigation/QuickNavigator';

/**
 * Income management page.
 * 
 * Features:
 * - Income list with DataGrid
 * - Property filtering
 * - Create, edit, delete income records
 * - Hebrew RTL support
 */
export default function IncomePage() {
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <QuickNavigator label="מעבר לטבלה" size="small" width={200} />
          <AccountSelector />
        </Box>
      </Box>

      <IncomeListPage />
    </Container>
  );
}
