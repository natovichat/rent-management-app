'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  MenuItem,
  TextField,
  Divider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { useShowDeleted } from '@/lib/hooks/useShowDeleted';
import { getUserProfile } from '@/lib/auth';

const PREFS_KEY = 'user_preferences';

interface Preferences {
  language: string;
  dateFormat: string;
  currency: string;
}

const defaults: Preferences = {
  language: 'he',
  dateFormat: 'DD/MM/YYYY',
  currency: 'ILS',
};

function loadPrefs(): Preferences {
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return defaults;
  }
}

/**
 * PreferencesTab - stores display preferences in localStorage.
 * Admin-only: includes a toggle to show soft-deleted entities.
 */
export default function PreferencesTab() {
  const [preferences, setPreferences] = useState<Preferences>(defaults);
  const [success, setSuccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { showDeleted, setShowDeleted } = useShowDeleted();

  useEffect(() => {
    setPreferences(loadPrefs());
    const profile = getUserProfile();
    setIsAdmin(profile?.role === 'ADMIN');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(PREFS_KEY, JSON.stringify(preferences));
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500, direction: 'rtl' }}>
      <Typography variant="h6" gutterBottom>
        העדפות תצוגה
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          ההעדפות נשמרו בהצלחה
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

      {isAdmin && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>
            הגדרות מנהל
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 1,
            }}
          >
            <Box>
              <Typography variant="body1">הצג ישויות שנמחקו</Typography>
              <Typography variant="body2" color="text.secondary">
                הצג רשומות שנמחקו (מחיקה רכה) בכל הרשימות עם אפשרות שחזור
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={showDeleted}
                  onChange={(e) => setShowDeleted(e.target.checked)}
                  color="warning"
                />
              }
              label=""
              sx={{ ml: 0 }}
            />
          </Box>
        </>
      )}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-start' }}>
        <Button type="submit" variant="contained">
          שמור העדפות
        </Button>
      </Box>
    </Box>
  );
}
