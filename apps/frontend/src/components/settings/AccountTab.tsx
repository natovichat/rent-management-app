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
import { useAccount } from '@/contexts/AccountContext';

/**
 * AccountTab component - US8.2: Update Account Settings
 */
export default function AccountTab() {
  const queryClient = useQueryClient();
  const { accounts, selectedAccountId } = useAccount();
  const [accountName, setAccountName] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current account
  const currentAccount = accounts.find((a) => a.id === selectedAccountId);

  useEffect(() => {
    if (currentAccount) {
      setAccountName(currentAccount.name);
    }
  }, [currentAccount]);

  // Check if user is owner
  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => authApi.getProfile(),
  });

  const isOwner = profile?.role === 'OWNER';

  // Update account mutation
  const updateMutation = useMutation({
    mutationFn: (newName: string) => authApi.updateAccount(newName),
    onSuccess: () => {
      setSuccess(true);
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (err: any) => {
      if (err.response?.status === 403) {
        setError('רק בעלי חשבון יכולים לעדכן את הגדרות החשבון');
      } else {
        setError(err.response?.data?.message || 'שגיאה בעדכון החשבון');
      }
      setSuccess(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim()) {
      setError('שם החשבון הוא שדה חובה');
      return;
    }
    updateMutation.mutate(accountName.trim());
  };

  if (!isOwner) {
    return (
      <Alert severity="info">
        רק בעלי חשבון יכולים לעדכן את הגדרות החשבון
      </Alert>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500 }}>
      <Typography variant="h6" gutterBottom>
        הגדרות חשבון
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          שם החשבון עודכן בהצלחה
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        label="שם החשבון"
        value={accountName}
        onChange={(e) => setAccountName(e.target.value)}
        fullWidth
        required
        margin="normal"
        autoFocus
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
