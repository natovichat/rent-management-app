'use client';

import { Container, Box, Typography, Button } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function EntitySettingsPage() {
  const params = useParams();
  const router = useRouter();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/settings')} variant="outlined">
          חזרה
        </Button>
        <Typography variant="h4" component="h1">
          הגדרות - {params.entityType}
        </Typography>
      </Box>
    </Container>
  );
}
