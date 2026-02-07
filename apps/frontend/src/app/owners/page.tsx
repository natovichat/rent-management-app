'use client';

import { Container, Typography, Box } from '@mui/material';
import OwnerList from '@/components/owners/OwnerList';
import { AccountSelector } from '@/components/layout/AccountSelector';
import QuickNavigator from '@/components/navigation/QuickNavigator';

/**
 * Owners management page.
 * 
 * Features:
 * - Owners list with DataGrid
 * - Create, edit, delete owners
 * - Hebrew RTL support
 */
export default function OwnersPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header with Account Selector */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            ניהול בעלים
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ניהול בעלים, צפייה בפרטים וחיפוש
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <QuickNavigator label="מעבר לטבלה" size="small" width={200} />
          <AccountSelector />
        </Box>
      </Box>

      <OwnerList />
    </Container>
  );
}
