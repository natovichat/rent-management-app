'use client';

import { Container, Typography, Box } from '@mui/material';
import NotificationList from '@/components/notifications/NotificationList';
import { AccountSelector } from '@/components/layout/AccountSelector';
import QuickNavigator from '@/components/navigation/QuickNavigator';

/**
 * Notifications page.
 * 
 * Features:
 * - Notifications list
 * - Mark as read/unread
 * - Hebrew RTL support
 */
export default function NotificationsPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header with Account Selector */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            התראות
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ניהול התראות ומעקב אירועים
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <QuickNavigator label="מעבר לטבלה" size="small" width={200} />
          <AccountSelector />
        </Box>
      </Box>

      <NotificationList />
    </Container>
  );
}
