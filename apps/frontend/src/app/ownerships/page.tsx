'use client';

import { Container, Typography, Box } from '@mui/material';
import OwnershipList from '@/components/ownerships/OwnershipList';

export default function OwnershipsPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ניהול בעלות
        </Typography>
        <Typography variant="body1" color="text.secondary">
          ניהול בעלות על נכסים
        </Typography>
      </Box>
      <OwnershipList />
    </Container>
  );
}
