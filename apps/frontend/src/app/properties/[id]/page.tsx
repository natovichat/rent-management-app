'use client';

import { Container, Box, Typography, Button } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/properties')}
          variant="outlined"
        >
          חזרה לנכסים
        </Button>
        <Typography variant="h4" component="h1">
          פרטי נכס
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary">
        מזהה נכס: {id}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
        בקרוב - דף פרטי נכס מלא
      </Typography>
    </Container>
  );
}
