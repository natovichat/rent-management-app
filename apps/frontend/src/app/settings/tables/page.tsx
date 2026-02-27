'use client';

import { Container, Box, Typography } from '@mui/material';

export default function SettingsTablesPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          הגדרות
        </Typography>
        <Typography variant="body1" color="text.secondary">
          הגדרות המערכת
        </Typography>
      </Box>
    </Container>
  );
}
