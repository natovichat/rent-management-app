'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Paper,
} from '@mui/material';
import { isAuthenticated } from '@/lib/auth';
import ProfileTab from '@/components/settings/ProfileTab';
import AccountTab from '@/components/settings/AccountTab';
import PreferencesTab from '@/components/settings/PreferencesTab';
import SessionsTab from '@/components/settings/SessionsTab';

/**
 * Settings page - Epic 8: User Management & Settings
 * 
 * Features:
 * - Edit user profile (US8.1)
 * - Update account settings (US8.2)
 * - View and update preferences (US8.3, US8.4)
 * - View active sessions (US8.5)
 * - Logout from all devices (US8.6)
 */
export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

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
        הגדרות
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        ניהול פרופיל, הגדרות חשבון והעדפות
      </Typography>

      <Paper sx={{ mt: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="פרופיל" />
          <Tab label="הגדרות חשבון" />
          <Tab label="העדפות" />
          <Tab label="סשנים" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && <ProfileTab />}
          {activeTab === 1 && <AccountTab />}
          {activeTab === 2 && <PreferencesTab />}
          {activeTab === 3 && <SessionsTab />}
        </Box>
      </Paper>
    </Container>
  );
}
