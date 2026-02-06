'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Box } from '@mui/material';
import LeaseList from '@/components/leases/LeaseList';
import { isAuthenticated } from '@/lib/auth';

/**
 * Leases management page.
 * 
 * Protected route - requires authentication.
 */
export default function LeasesPage() {
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
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <LeaseList />
      </Box>
    </Container>
  );
}
