'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Tooltip,
  Divider,
  Paper,
  Snackbar,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, type UserDto } from '@/lib/api/users';
import { getUserProfile } from '@/lib/auth';

export default function UserManagementTab() {
  const queryClient = useQueryClient();
  const currentUser = getUserProfile();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserDto | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    text: string;
    severity: 'success' | 'error';
  }>({ open: false, text: '', severity: 'success' });

  const showSuccess = (text: string) =>
    setSnackbar({ open: true, text, severity: 'success' });
  const showError = (text: string) =>
    setSnackbar({ open: true, text, severity: 'error' });

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
  });

  const handleCloseAddDialog = () => {
    setAddDialogOpen(false);
    setNewEmail('');
    setNewRole('MEMBER');
    setDialogError(null);
  };

  const addMutation = useMutation({
    mutationFn: () => usersApi.addUser(newEmail.trim(), newRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      handleCloseAddDialog();
      showSuccess('המשתמש נוסף בהצלחה');
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message || 'שגיאה בהוספת המשתמש';
      setDialogError(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });

  const handleAddSubmit = () => {
    if (!newEmail.trim()) return;
    setDialogError(null);
    addMutation.mutate();
  };

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      usersApi.updateUser(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => {
      showError('שגיאה בעדכון המשתמש');
    },
  });

  const toggleRoleMutation = useMutation({
    mutationFn: ({
      id,
      role,
    }: {
      id: string;
      role: 'ADMIN' | 'MEMBER';
    }) => usersApi.updateUser(id, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => {
      showError('שגיאה בעדכון הרשאות');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.removeUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteTarget(null);
      showSuccess('המשתמש הוסר בהצלחה');
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message || 'שגיאה במחיקת המשתמש';
      showError(Array.isArray(msg) ? msg.join(', ') : msg);
      setDeleteTarget(null);
    },
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">שגיאה בטעינת רשימת המשתמשים</Alert>
    );
  }

  return (
    <Box sx={{ direction: 'rtl' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={600}>
            ניהול משתמשים
          </Typography>
          <Typography variant="body2" color="text.secondary">
            משתמשים עם גישה למערכת ({users?.length ?? 0} רשומים)
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setAddDialogOpen(true)}
          size="small"
        >
          הוסף משתמש
        </Button>
      </Box>

      {/* Users list */}
      <Paper variant="outlined">
        <List disablePadding>
          {users?.map((user, idx) => {
            const isCurrentUser = user.id === currentUser?.id;
            const hasLoggedIn = Boolean(user.lastLoginAt);

            return (
              <Box key={user.id}>
                {idx > 0 && <Divider />}
                <ListItem
                  sx={{
                    opacity: user.isActive ? 1 : 0.6,
                    py: 1.5,
                  }}
                >
                  <ListItemAvatar>
                    {user.picture ? (
                      <Avatar src={user.picture} alt={user.name || user.email} />
                    ) : (
                      <Avatar sx={{ bgcolor: user.role === 'ADMIN' ? 'primary.main' : 'grey.400' }}>
                        {user.role === 'ADMIN' ? (
                          <AdminIcon />
                        ) : (
                          <PersonIcon />
                        )}
                      </Avatar>
                    )}
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="body2" fontWeight={600}>
                          {user.name || user.email}
                        </Typography>
                        {user.role === 'ADMIN' && (
                          <Chip
                            label="מנהל"
                            size="small"
                            color="primary"
                            sx={{ height: 20 }}
                          />
                        )}
                        {isCurrentUser && (
                          <Chip
                            label="אתה"
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ height: 20 }}
                          />
                        )}
                        {!user.isActive && (
                          <Chip
                            label="מושעה"
                            size="small"
                            color="error"
                            sx={{ height: 20 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box component="span">
                        <Box
                          component="span"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <EmailIcon sx={{ fontSize: 12, opacity: 0.6 }} />
                          <Typography variant="caption" component="span">
                            {user.email}
                          </Typography>
                        </Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          component="span"
                          sx={{ display: 'block' }}
                        >
                          {hasLoggedIn
                            ? `כניסה אחרונה: ${new Date(user.lastLoginAt!).toLocaleDateString('he-IL')}`
                            : 'טרם התחבר'}
                        </Typography>
                      </Box>
                    }
                  />

                  {/* Actions - inline, not absolutely positioned */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      flexShrink: 0,
                      ml: 'auto',
                    }}
                  >
                    {/* Toggle admin role */}
                    {!isCurrentUser && (
                      <Tooltip
                        title={
                          user.role === 'ADMIN'
                            ? 'הפוך למשתמש רגיל'
                            : 'הפוך למנהל'
                        }
                      >
                        <span>
                          <IconButton
                            size="small"
                            onClick={() =>
                              toggleRoleMutation.mutate({
                                id: user.id,
                                role:
                                  user.role === 'ADMIN' ? 'MEMBER' : 'ADMIN',
                              })
                            }
                            disabled={toggleRoleMutation.isPending}
                            color={
                              user.role === 'ADMIN' ? 'primary' : 'default'
                            }
                          >
                            <AdminIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}

                    {/* Toggle active/inactive */}
                    {!isCurrentUser && (
                      <Tooltip
                        title={user.isActive ? 'השעה גישה' : 'אפשר גישה'}
                      >
                        <Switch
                          size="small"
                          checked={user.isActive}
                          onChange={(e) =>
                            toggleActiveMutation.mutate({
                              id: user.id,
                              isActive: e.target.checked,
                            })
                          }
                          disabled={toggleActiveMutation.isPending}
                        />
                      </Tooltip>
                    )}

                    {/* Delete */}
                    {!isCurrentUser && (
                      <Tooltip title="הסר מהרשימה">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteTarget(user)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </ListItem>
              </Box>
            );
          })}

          {users?.length === 0 && (
            <ListItem>
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                    py={2}
                  >
                    אין משתמשים רשומים
                  </Typography>
                }
              />
            </ListItem>
          )}
        </List>
      </Paper>

      {/* Add User Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={handleCloseAddDialog}
        maxWidth="xs"
        fullWidth
      >
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleAddSubmit();
          }}
        >
          <DialogTitle sx={{ direction: 'rtl' }}>הוסף משתמש חדש</DialogTitle>
          <DialogContent sx={{ direction: 'rtl', pt: '8px !important' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              הכנס את כתובת Gmail של המשתמש. הם יוכלו להתחבר לאחר שתוסיף
              אותם לרשימה.
            </Typography>
            {dialogError && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setDialogError(null)}>
                {dialogError}
              </Alert>
            )}
            <TextField
              fullWidth
              label="כתובת Gmail"
              type="email"
              value={newEmail}
              onChange={(e) => {
                setNewEmail(e.target.value);
                setDialogError(null);
              }}
              placeholder="user@gmail.com"
              autoFocus
              sx={{ mb: 2 }}
              disabled={addMutation.isPending}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={newRole === 'ADMIN'}
                  onChange={(e) =>
                    setNewRole(e.target.checked ? 'ADMIN' : 'MEMBER')
                  }
                  disabled={addMutation.isPending}
                />
              }
              label="מנהל מערכת"
            />
          </DialogContent>
          <DialogActions sx={{ direction: 'rtl', px: 3, pb: 2 }}>
            <Button
              onClick={handleCloseAddDialog}
              variant="outlined"
              disabled={addMutation.isPending}
            >
              ביטול
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!newEmail.trim() || addMutation.isPending}
            >
              {addMutation.isPending ? 'מוסיף...' : 'הוסף משתמש'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ direction: 'rtl' }}>הסרת משתמש</DialogTitle>
        <DialogContent sx={{ direction: 'rtl' }}>
          <Typography>
            האם להסיר את{' '}
            <strong>{deleteTarget?.name || deleteTarget?.email}</strong>{' '}
            מרשימת המורשים?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            המשתמש לא יוכל יותר להתחבר למערכת.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ direction: 'rtl', px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            variant="outlined"
            disabled={deleteMutation.isPending}
          >
            ביטול
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'מסיר...' : 'הסר משתמש'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Global success/error snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          variant="filled"
        >
          {snackbar.text}
        </Alert>
      </Snackbar>
    </Box>
  );
}
