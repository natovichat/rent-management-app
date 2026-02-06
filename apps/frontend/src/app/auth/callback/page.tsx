'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container, Box, CircularProgress, Typography, Alert } from '@mui/material';
import { handleCallback } from '@/lib/auth';

/**
 * OAuth callback page that handles Google OAuth redirect.
 * 
 * Flow:
 * 1. Receives authorization code from Google
 * 2. Exchanges code for JWT token via backend API
 * 3. Stores token in localStorage
 * 4. Redirects to dashboard
 */
function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get authorization code from URL
        const code = searchParams.get('code');
        const errorParam = searchParams.get('error');

        // Handle OAuth errors
        if (errorParam) {
          setError(`שגיאת אימות: ${errorParam}`);
          setLoading(false);
          return;
        }

        if (!code) {
          setError('קוד הרשאה לא נמצא');
          setLoading(false);
          return;
        }

        // Exchange code for token via backend API
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${API_URL}/auth/google/callback?code=${code}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'שגיאה באימות');
        }

        const data = await response.json();
        
        // Store token
        if (data.token) {
          handleCallback(data.token);
          
          // Redirect to dashboard
          router.push('/dashboard');
        } else {
          throw new Error('טוקן לא התקבל מהשרת');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'שגיאה לא ידועה');
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
        }}
      >
        {loading && (
          <>
            <CircularProgress size={60} />
            <Typography variant="body1">
              מאמת את ההתחברות...
            </Typography>
          </>
        )}
        
        {error && (
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
            <br />
            <Typography variant="body2" sx={{ mt: 1 }}>
              <a href="/" style={{ color: 'inherit', textDecoration: 'underline' }}>
                חזור לעמוד הבית
              </a>
            </Typography>
          </Alert>
        )}
      </Box>
    </Container>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
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
          <Typography variant="body1">
            מאמת את ההתחברות...
          </Typography>
        </Box>
      </Container>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
