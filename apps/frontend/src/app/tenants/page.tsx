'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Box } from '@mui/material';
import TenantList from '@/components/tenants/TenantList';
import { isAuthenticated } from '@/lib/auth';
import QuickNavigator from '@/components/navigation/QuickNavigator';

/**
 * Tenants management page.
 * 
 * Protected route - requires authentication.
 */
export default function TenantsPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/');
    }
  }, [router]);

  if (!isAuthenticated()) {
    return null;
  }

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
