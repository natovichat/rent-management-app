'use client';

import { Box, Typography, Alert, Divider } from '@mui/material';
import { getUserProfile } from '@/lib/auth';

/**
 * AccountTab - shows account info.
 */
export default function AccountTab() {
  const profile = getUserProfile();

  return (
    <Box sx={{ maxWidth: 500, direction: 'rtl' }}>
      <Typography variant="h6" gutterBottom>
        פרטי חשבון
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        החשבון מנוהל דרך Google OAuth. לשינוי פרטים כמו שם ותמונה, עדכן את פרופיל ה-Google שלך.
      </Alert>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">אימייל</Typography>
          <Typography variant="body1">{profile?.email || '—'}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">שם מלא</Typography>
          <Typography variant="body1">{profile?.name || '—'}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">תפקיד</Typography>
          <Typography variant="body1">
            {profile?.role === 'ADMIN' ? 'מנהל מערכת' : 'משתמש'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
