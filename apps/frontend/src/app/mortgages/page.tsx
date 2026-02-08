'use client';

import { Container, Typography, Box } from '@mui/material';
import MortgageList from '@/components/mortgages/MortgageList';
import { AccountSelector } from '@/components/layout/AccountSelector';
import QuickNavigator from '@/components/navigation/QuickNavigator';

/**
 * Mortgages management page.
 * 
 * Features:
 * - Mortgages list with DataGrid
 * - Create, edit, delete mortgages
 * - Hebrew RTL support
 */
export default function MortgagesPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header with Account Selector */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            ניהול משכנתאות
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ניהול משכנתאות, צפייה בפרטים וסינון
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <QuickNavigator label="מעבר לטבלה" size="small" width={200} />
          <AccountSelector />
        </Box>
      </Box>

      <MortgageList />
    </Container>
  );
}
