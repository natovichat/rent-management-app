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
} from '@mui/material';
import { authApi } from '@/lib/api/auth';

/**
 * ProfileTab component - US8.1: Edit User Profile
 */
export default function ProfileTab() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => authApi.getProfile(),
  });

  // Update name when profile loads
  useEffect(() => {
    if (profile?.name) {
      setName(profile.name);
    }
  }, [profile]);

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: (newName: string) => authApi.updateProfile(newName),
    onSuccess: () => {
      setSuccess(true);
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'שגיאה בעדכון הפרופיל');
      setSuccess(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('שם הוא שדה חובה');
      return;
    }
    updateMutation.mutate(name.trim());
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
        עריכת פרופיל
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          הפרופיל עודכן בהצלחה
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        label="שם מלא"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        required
        margin="normal"
        autoFocus
      />

      <TextField
        label="אימייל"
        value={profile?.email || ''}
        fullWidth
        margin="normal"
        disabled
        helperText="אימייל מנוהל דרך Google OAuth"
      />

      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          type="submit"
          variant="contained"
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? 'שומר...' : 'שמור שינויים'}
        </Button>
      </Box>
    </Box>
  );
}
