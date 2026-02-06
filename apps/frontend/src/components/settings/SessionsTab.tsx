'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import { authApi } from '@/lib/api/auth';

/**
 * SessionsTab component - US8.5, US8.6: View Active Sessions and Logout All
 */
export default function SessionsTab() {
  const queryClient = useQueryClient();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch sessions
  const { data: sessions, isLoading, refetch } = useQuery({
    queryKey: ['userSessions'],
    queryFn: () => authApi.getSessions(),
  });

  // Logout all mutation
  const logoutAllMutation = useMutation({
    mutationFn: () => authApi.logoutAll(),
    onSuccess: () => {
      setSuccess(true);
      setError(null);
      setLogoutDialogOpen(false);
      refetch();
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'שגיאה בהתנתקות מכל המכשירים');
      setSuccess(false);
    },
  });

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString('he-IL');
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          סשנים פעילים
        </Typography>
        <Button
          variant="outlined"
          color="error"
          onClick={() => setLogoutDialogOpen(true)}
        >
          התנתק מכל המכשירים
        </Button>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          התנתקת בהצלחה מכל המכשירים האחרים
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {sessions && sessions.length === 0 ? (
        <Alert severity="info">אין סשנים פעילים</Alert>
      ) : (
        <List>
          {sessions?.map((session) => (
            <ListItem
              key={session.id}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
                bgcolor: session.isCurrent ? 'action.selected' : 'background.paper',
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {session.device || 'מכשיר לא ידוע'}
                    {session.isCurrent && (
                      <Chip label="סשן נוכחי" color="primary" size="small" />
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      כתובת IP: {session.ipAddress || 'לא זמין'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      פעילות אחרונה: {formatDate(session.lastActivity)}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)}>
        <DialogTitle>התנתק מכל המכשירים?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            פעולה זו תתנתק מכל המכשירים האחרים מלבד המכשיר הנוכחי.
            האם אתה בטוח שברצונך להמשיך?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)}>ביטול</Button>
          <Button
            onClick={() => logoutAllMutation.mutate()}
            color="error"
            variant="contained"
            disabled={logoutAllMutation.isPending}
          >
            {logoutAllMutation.isPending ? 'מתנתק...' : 'התנתק'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
