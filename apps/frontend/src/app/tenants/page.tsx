'use client';

import { Container, Box } from '@mui/material';
import TenantList from '@/components/tenants/TenantList';
import QuickNavigator from '@/components/navigation/QuickNavigator';

/**
 * Tenants management page.
 */
export default function TenantsPage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <QuickNavigator label="מעבר לטבלה" size="small" width={200} />
        </Box>
        <TenantList />
      </Box>
    </Container>
  );
}
