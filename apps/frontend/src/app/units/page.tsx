'use client';

import { Container, Typography, Box } from '@mui/material';
import UnitList from '@/components/units/UnitList';

export default function UnitsPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ניהול יחידות דיור
        </Typography>
        <Typography variant="body1" color="text.secondary">
          ניהול דירות ויחידות דיור בנכסים
        </Typography>
      </Box>
      <UnitList />
    </Container>
  );
}
