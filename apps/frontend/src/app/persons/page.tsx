'use client';

import { Container, Typography, Box } from '@mui/material';
import PersonList from '@/components/persons/PersonList';

export default function PersonsPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ניהול אנשים
        </Typography>
        <Typography variant="body1" color="text.secondary">
          ניהול רשימת אנשים - שוכרים, בעלי משכנתאות ומשלמים
        </Typography>
      </Box>
      <PersonList />
    </Container>
  );
}
