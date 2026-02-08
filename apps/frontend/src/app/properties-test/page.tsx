'use client';

import { useEffect, useState } from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import QuickNavigator from '@/components/navigation/QuickNavigator';

export default function PropertiesTestPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    // Get token from localStorage
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken.substring(0, 20) + '...');
    }
  }, []);

  const testAPI = async () => {
    try {
      const storedToken = localStorage.getItem('auth_token');
      if (!storedToken) {
        setError('No token found');
        return;
      }

      const response = await fetch('http://localhost:3001/properties', {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">
          Properties Test Page
        </Typography>
        <QuickNavigator label="מעבר לטבלה" size="small" width={200} />
      </Box>

      <Box sx={{ my: 2 }}>
        <Typography variant="body1">
          Token: {token || 'No token found'}
        </Typography>
      </Box>

      <Button variant="contained" onClick={testAPI}>
        Test API Call
      </Button>

      {error && (
        <Box sx={{ my: 2, p: 2, bgcolor: 'error.light' }}>
          <Typography color="error">Error: {error}</Typography>
        </Box>
      )}

      {data && (
        <Box sx={{ my: 2, p: 2, bgcolor: 'success.light' }}>
          <Typography variant="h6">Success!</Typography>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </Box>
      )}
    </Container>
  );
}
