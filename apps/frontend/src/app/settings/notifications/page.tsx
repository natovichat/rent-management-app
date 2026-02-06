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
import NotificationSettingsTab from '@/components/settings/NotificationSettingsTab';

/**
 * Notification Settings page - US12.2: Configure Notification Timing
 * 
 * Allows users to configure notification timing (days before expiration).
 */
export default function NotificationSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/');
      return;
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <Container maxWidth="md">
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        הגדרות התראות
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        הגדר כמה ימים לפני תפוגת חוזה תרצה לקבל התראות
      </Typography>

      <NotificationSettingsTab />
    </Container>
  );
}
