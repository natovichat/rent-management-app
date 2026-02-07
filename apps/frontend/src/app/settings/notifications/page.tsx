'use client';

import {
  Container,
  Typography,
} from '@mui/material';
import NotificationSettingsTab from '@/components/settings/NotificationSettingsTab';

/**
 * Notification Settings page - US12.2: Configure Notification Timing
 * 
 * Allows users to configure notification timing (days before expiration).
 */
export default function NotificationSettingsPage() {
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
