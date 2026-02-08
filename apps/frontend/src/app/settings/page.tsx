'use client';

import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import ProfileTab from '@/components/settings/ProfileTab';
import AccountTab from '@/components/settings/AccountTab';
import PreferencesTab from '@/components/settings/PreferencesTab';
import SessionsTab from '@/components/settings/SessionsTab';
import { AccountSelector } from '@/components/layout/AccountSelector';
import QuickNavigator from '@/components/navigation/QuickNavigator';

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
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header with Quick Navigator */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            הגדרות
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ניהול פרופיל, הגדרות חשבון והעדפות
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <QuickNavigator label="מעבר לטבלה" size="small" width={200} />
          <AccountSelector />
        </Box>
      </Box>

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
