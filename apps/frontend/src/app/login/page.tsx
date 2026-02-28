'use client';

import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import HomeIcon from '@mui/icons-material/Home';
import { login } from '@/lib/auth';

/**
 * Login page - Google OAuth authentication.
 */
export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = () => {
    setError('');
    setLoading(true);
    try {
      login();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בהתחברות');
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={4}
          sx={{
            p: { xs: 3, sm: 5 },
            width: '100%',
            borderRadius: 3,
            textAlign: 'center',
          }}
        >
          {/* Logo / Icon */}
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <HomeIcon sx={{ color: 'white', fontSize: 36 }} />
          </Box>

          <Typography variant="h5" fontWeight={700} gutterBottom>
            מערכת ניהול נכסים
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            התחבר עם חשבון Google שלך כדי להמשיך
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {error && (
            <Alert severity="error" sx={{ mb: 2, textAlign: 'right' }}>
              {error}
            </Alert>
          )}

          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={loading ? <CircularProgress size={20} /> : <GoogleIcon />}
            onClick={handleGoogleLogin}
            disabled={loading}
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontSize: '1rem',
              fontWeight: 600,
              borderColor: '#4285F4',
              color: '#4285F4',
              '&:hover': {
                borderColor: '#4285F4',
                bgcolor: 'rgba(66, 133, 244, 0.06)',
              },
            }}
          >
            {loading ? 'מתחבר...' : 'התחבר עם Google'}
          </Button>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 3 }}
          >
            הגישה מוגבלת למשתמשים מאושרים בלבד.
            <br />
            לבקשת גישה, פנה למנהל המערכת.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
