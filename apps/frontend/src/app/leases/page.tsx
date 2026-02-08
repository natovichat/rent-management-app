'use client';

import { Container, Box, Typography } from '@mui/material';
import LeaseList from '@/components/leases/LeaseList';
import QuickNavigator from '@/components/navigation/QuickNavigator';
import { AccountSelector } from '@/components/layout/AccountSelector';

/**
 * Leases management page.
 * 
 * Features:
 * - Leases list with DataGrid
 * - Create, edit, delete leases
 * - Hebrew RTL support
 */
export default function LeasesPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header with Account Selector */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            ניהול חוזי שכירות
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ניהול חוזים, צפייה בפרטים וסינון
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <QuickNavigator label="מעבר לטבלה" size="small" width={200} />
          <AccountSelector />
        </Box>
      </Box>

      <LeaseList />
    </Container>
  );
}
