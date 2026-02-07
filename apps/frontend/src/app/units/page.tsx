'use client';

import { Container, Typography, Box } from '@mui/material';
import UnitList from '@/components/units/UnitList';
import { AccountSelector } from '@/components/layout/AccountSelector';
import QuickNavigator from '@/components/navigation/QuickNavigator';

/**
 * Units management page.
 * 
 * Features:
 * - Units list with DataGrid
 * - Property filtering
 * - Create, edit, delete, and view unit details
 * - Hebrew RTL support
 */
export default function UnitsPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header with Account Selector */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            ניהול דירות
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ניהול דירות, צפייה בפרטים וחוזי שכירות
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <QuickNavigator label="מעבר לטבלה" size="small" width={200} />
          <AccountSelector />
        </Box>
      </Box>

      <UnitList />
    </Container>
  );
}
