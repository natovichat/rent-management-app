'use client';

import { useState, useEffect } from 'react';
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
import UserManagementTab from '@/components/settings/UserManagementTab';
import QuickNavigator from '@/components/navigation/QuickNavigator';
import { getUserProfile } from '@/lib/auth';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const profile = getUserProfile();
    setIsAdmin(profile?.role === 'ADMIN');

    // Jump to users tab if URL has #users hash
    if (typeof window !== 'undefined' && window.location.hash === '#users' && profile?.role === 'ADMIN') {
      setActiveTab(4);
    }
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 2,
          direction: 'rtl',
        }}
      >
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
        </Box>
      </Box>

      <Paper sx={{ mt: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="פרופיל" />
          <Tab label="הגדרות חשבון" />
          <Tab label="העדפות" />
          <Tab label="כניסות" />
          {isAdmin && <Tab label="משתמשים" />}
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && <ProfileTab />}
          {activeTab === 1 && <AccountTab />}
          {activeTab === 2 && <PreferencesTab />}
          {activeTab === 3 && <SessionsTab />}
          {activeTab === 4 && isAdmin && <UserManagementTab />}
        </Box>
      </Paper>
    </Container>
  );
}
