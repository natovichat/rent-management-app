'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Container,
  Box,
  CircularProgress,
  Typography,
  Alert,
  Button,
} from '@mui/material';
import { handleCallback, setUserProfile } from '@/lib/auth';

/**
 * OAuth callback page that handles Google OAuth redirect.
 *
 * Two possible flows:
 * 1. Backend redirects here with ?token=<jwt> (preferred - backend handles code exchange)
 * 2. Receives ?code= from Google directly and exchanges via backend API
 */
function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Flow 1: Backend already exchanged the code and redirected with token
        const token = searchParams.get('token');
        if (token) {
          handleCallback(token);

          // Fetch user profile using the new token
          const API_URL =
            process.env.NEXT_PUBLIC_API_URL ||
            'https://rent-app-backend-6s337cqx6a-uc.a.run.app';
          const profileResponse = await fetch(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (profileResponse.ok) {
            const profile = await profileResponse.json();
            setUserProfile(profile);
          }

          router.push('/dashboard');
          return;
        }

        // Flow 2: Direct Google redirect with code (fallback)
        const code = searchParams.get('code');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          if (errorParam === 'access_denied') {
            setError('הגישה נדחתה. האימייל שלך אינו מורשה.');
          } else {
            setError(`שגיאת אימות: ${errorParam}`);
          }
          setLoading(false);
          return;
        }

        if (!code) {
          setError('קוד הרשאה לא נמצא');
          setLoading(false);
          return;
        }

        // Exchange code via backend
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL ||
          'https://rent-app-backend-6s337cqx6a-uc.a.run.app';
        const response = await fetch(
          `${API_URL}/api/auth/google/callback?code=${code}`,
          { method: 'GET' },
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || 'שגיאה באימות. ייתכן שהאימייל שלך אינו מורשה.',
          );
        }

        const data = await response.json();
        if (data.token) {
          handleCallback(data.token);
          router.push('/dashboard');
        } else {
          throw new Error('טוקן לא התקבל מהשרת');
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'שגיאה לא ידועה אירעה. נסה שוב.',
        );
        setLoading(false);
      }
    };

    processCallback();
  }, [searchParams, router]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          direction: 'rtl',
        }}
      >
        {loading && (
          <>
            <CircularProgress size={60} />
            <Typography variant="body1">מאמת את ההתחברות...</Typography>
          </>
        )}

        {error && (
          <Alert severity="error" sx={{ width: '100%' }}>
            <Typography variant="body1" gutterBottom>
              {error}
            </Typography>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => router.push('/login')}
              sx={{ mt: 1 }}
            >
              חזור להתחברות
            </Button>
          </Alert>
        )}
      </Box>
    </Container>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <Container maxWidth="sm">
          <Box
            sx={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
            }}
          >
            <CircularProgress size={60} />
            <Typography variant="body1">מאמת את ההתחברות...</Typography>
          </Box>
        </Container>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
