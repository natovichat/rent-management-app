'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import { authApi } from '@/lib/api/auth';

/**
 * PreferencesTab component - US8.3, US8.4: View and Update User Preferences
 */
export default function PreferencesTab() {
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState({
    language: 'he',
    dateFormat: 'DD/MM/YYYY',
    currency: 'ILS',
    theme: 'light',
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current preferences
  const { data: currentPreferences, isLoading } = useQuery({
    queryKey: ['userPreferences'],
    queryFn: () => authApi.getPreferences(),
  });

  // Update preferences when data loads
  useEffect(() => {
    if (currentPreferences) {
      setPreferences(currentPreferences);
    }
  }, [currentPreferences]);

  // Update preferences mutation
  const updateMutation = useMutation({
    mutationFn: (prefs: typeof preferences) => authApi.updatePreferences(prefs),
    onSuccess: () => {
      setSuccess(true);
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'שגיאה בעדכון ההעדפות');
      setSuccess(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(preferences);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500 }}>
      <Typography variant="h6" gutterBottom>
        העדפות משתמש
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          ההעדפות נשמרו בהצלחה
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        select
        label="שפה"
        value={preferences.language}
        onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
        fullWidth
        margin="normal"
      >
        <MenuItem value="he">עברית</MenuItem>
        <MenuItem value="en">English</MenuItem>
      </TextField>

      <TextField
        select
        label="פורמט תאריך"
        value={preferences.dateFormat}
        onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
        fullWidth
        margin="normal"
      >
        <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
        <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
        <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
      </TextField>

      <TextField
        select
        label="מטבע"
        value={preferences.currency}
        onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
        fullWidth
        margin="normal"
      >
        <MenuItem value="ILS">₪ שקל (ILS)</MenuItem>
        <MenuItem value="USD">$ דולר (USD)</MenuItem>
        <MenuItem value="EUR">€ אירו (EUR)</MenuItem>
      </TextField>

      <TextField
        select
        label="ערכת נושא"
        value={preferences.theme}
        onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
        fullWidth
        margin="normal"
      >
        <MenuItem value="light">בהיר</MenuItem>
        <MenuItem value="dark">כהה</MenuItem>
      </TextField>

      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          type="submit"
          variant="contained"
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? 'שומר...' : 'שמור העדפות'}
        </Button>
      </Box>
    </Box>
  );
}
