'use client';

import { Container, Typography, Box } from '@mui/material';
import BankAccountList from '@/components/bank-accounts/BankAccountList';
/**
 * Bank Accounts management page.
 * 
 * Features:
 * - Bank accounts list with DataGrid
 * - Create, edit, delete bank accounts
 * - Activate/deactivate accounts
 * - Hebrew RTL support
 */
export default function BankAccountsPage() {
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
      </Box>

      <BankAccountList />
    </Container>
  );
}
