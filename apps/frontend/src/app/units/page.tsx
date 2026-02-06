'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Typography, Box } from '@mui/material';
import { isAuthenticated } from '@/lib/auth';
import UnitList from '@/components/units/UnitList';
import { AccountSelector } from '@/components/layout/AccountSelector';

/**
 * Units management page.
 * 
 * Features:
 * - Protected route with authentication check
 * - Units list with DataGrid
 * - Property filtering
 * - Create, edit, delete, and view unit details
 * - Hebrew RTL support
 */
export default function UnitsPage() {
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
            ניהול דירות
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ניהול דירות, צפייה בפרטים וחוזי שכירות
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AccountSelector />
        </Box>
      </Box>

      <UnitList />
    </Container>
  );
}
