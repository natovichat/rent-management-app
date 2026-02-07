'use client';

import { Container, Box } from '@mui/material';
import LeaseList from '@/components/leases/LeaseList';
import QuickNavigator from '@/components/navigation/QuickNavigator';

/**
 * Leases management page.
 */
export default function LeasesPage() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <QuickNavigator label="מעבר לטבלה" size="small" width={200} />
        </Box>
        <LeaseList />
      </Box>
    </Container>
  );
}
