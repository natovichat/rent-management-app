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
  Chip,
  IconButton,
  Paper,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { notificationsApi } from '@/services/notifications';
import { useAccount } from '@/contexts/AccountContext';

/**
 * NotificationSettingsTab component - US12.2: Configure Notification Timing
 * 
 * Allows users to configure notification timing (days before expiration).
 * Users can add/remove multiple notification timings (e.g., 30, 60, 90 days).
 */
export default function NotificationSettingsTab() {
  const queryClient = useQueryClient();
  const { selectedAccountId } = useAccount();
  const [days, setDays] = useState<number[]>([]);
  const [newDay, setNewDay] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['notificationSettings', selectedAccountId],
    queryFn: () => notificationsApi.getSettings(),
    enabled: !!selectedAccountId,
  });

  // Update days when settings load
  useEffect(() => {
    if (settings?.daysBeforeExpiration) {
      setDays([...settings.daysBeforeExpiration]);
    }
  }, [settings]);

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: (daysBeforeExpiration: number[]) => notificationsApi.updateSettings(daysBeforeExpiration),
    onSuccess: () => {
      setSuccess(true);
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['notificationSettings'] });
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'שגיאה בעדכון הגדרות התראות');
      setSuccess(false);
    },
  });

  const handleAddDay = () => {
    const dayValue = parseInt(newDay, 10);
    if (isNaN(dayValue) || dayValue < 1 || dayValue > 365) {
      setError('מספר הימים חייב להיות בין 1 ל-365');
      return;
    }
    if (days.includes(dayValue)) {
      setError('מספר הימים כבר קיים');
      return;
    }
    setDays([...days, dayValue].sort((a, b) => a - b));
    setNewDay('');
    setError(null);
  };

  const handleRemoveDay = (dayToRemove: number) => {
    setDays(days.filter(d => d !== dayToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (days.length === 0) {
      setError('יש להוסיף לפחות יום אחד');
      return;
    }
    updateMutation.mutate(days);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddDay();
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600 }}>
      <Typography variant="h6" gutterBottom>
        הגדרות התראות
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        הגדר כמה ימים לפני תפוגת חוזה תרצה לקבל התראות. ניתן להוסיף מספר תאריכים (למשל: 30, 60, 90 ימים).
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(false)}>
          הגדרות התראות עודכנו בהצלחה
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            label="ימים לפני תפוגה"
            type="number"
            value={newDay}
            onChange={(e) => setNewDay(e.target.value)}
            onKeyPress={handleKeyPress}
            inputProps={{ min: 1, max: 365 }}
            sx={{ flexGrow: 1 }}
            helperText="הזן מספר בין 1 ל-365"
          />
          <Button
            variant="outlined"
            onClick={handleAddDay}
            startIcon={<AddIcon />}
            sx={{ minWidth: 120 }}
          >
            הוסף
          </Button>
        </Box>

        {days.length > 0 && (
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              ימים מוגדרים:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {days.map((day) => (
                <Chip
                  key={day}
                  label={`${day} ימים`}
                  onDelete={() => handleRemoveDay(day)}
                  deleteIcon={<DeleteIcon />}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}

        {days.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            אין ימים מוגדרים. הוסף ימים כדי לקבל התראות לפני תפוגת חוזים.
          </Typography>
        )}
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          type="submit"
          variant="contained"
          disabled={updateMutation.isPending || days.length === 0}
        >
          {updateMutation.isPending ? 'שומר...' : 'שמור הגדרות'}
        </Button>
      </Box>
    </Box>
  );
}
