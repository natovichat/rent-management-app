'use client';

import { Suspense } from 'react';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import PropertyList from '@/components/properties/PropertyList';
import { AccountSelector } from '@/components/layout/AccountSelector';
import QuickNavigator from '@/components/navigation/QuickNavigator';

/**
 * Properties page for managing properties.
 * 
 * Features:
 * - PropertyList component with full CRUD operations
 * - RTL layout support
 */
export default function PropertiesPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with Account Selector and Quick Navigator */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            ניהול נכסים
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ניהול נכסים, יחידות דיור וחוזים
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <QuickNavigator label="מעבר לטבלה" size="small" width={200} />
          <AccountSelector />
        </Box>
      </Box>

      <Suspense fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      }>
        <PropertyList />
      </Suspense>
    </Container>
  );
}
