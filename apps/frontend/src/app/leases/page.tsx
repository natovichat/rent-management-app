'use client';

import { Container, Typography, Box } from '@mui/material';
import LeaseList from '@/components/leases/LeaseList';

export default function LeasesPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          חוזי שכירות
        </Typography>
        <Typography variant="body1" color="text.secondary">
          ניהול חוזי שכירות ודיירים
        </Typography>
      </Box>
      <LeaseList />
    </Container>
  );
}
