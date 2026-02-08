'use client';

import { Container, Box, Typography } from '@mui/material';
import TenantList from '@/components/tenants/TenantList';
import QuickNavigator from '@/components/navigation/QuickNavigator';
import { AccountSelector } from '@/components/layout/AccountSelector';

/**
 * Tenants management page.
 * 
 * Features:
 * - Tenants list with DataGrid
 * - Create, edit, delete tenants
 * - Hebrew RTL support
 */
export default function TenantsPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header with Account Selector */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            ניהול דיירים
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ניהול דיירים, צפייה בפרטים וחיפוש
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <QuickNavigator label="מעבר לטבלה" size="small" width={200} />
          <AccountSelector />
        </Box>
      </Box>

      <TenantList />
    </Container>
  );
}
