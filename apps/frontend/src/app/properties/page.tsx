'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { isAuthenticated } from '@/lib/auth';
import PropertyList from '@/components/properties/PropertyList';
import { AccountSelector } from '@/components/layout/AccountSelector';

/**
 * Properties page - Protected route for managing properties.
 * 
 * Features:
 * - Authentication check and redirect
 * - PropertyList component with full CRUD operations
 * - RTL layout support
 */
export default function PropertiesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push('/');
      return;
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with Account Selector */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            ניהול נכסים
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ניהול נכסים, יחידות דיור וחוזים
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AccountSelector />
        </Box>
      </Box>

      <PropertyList />
    </Container>
  );
}
