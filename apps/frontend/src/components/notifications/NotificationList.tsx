'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import {
  Box,
  Button,
  TextField,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Refresh as RetryIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { notificationsApi, Notification, NotificationFilters, NotificationStatus, NotificationType } from '@/services/notifications';
import { useAccount } from '@/contexts/AccountContext';

/**
 * NotificationList component - Displays notifications in a DataGrid with RTL support.
 * 
 * Features:
 * - Server-side pagination
 * - Filter by status, type, lease, date range
 * - Retry failed notifications
 * - View notification details
 * - Generate notifications manually
 * - Process pending notifications
 * - Hebrew RTL layout
 * 
 * Column Order (RTL - right to left):
 * 1. נכס (Property Address) - Primary column
 * 2. דייר (Tenant Name)
 * 3. סוג התראה (Type)
 * 4. ימים לפני תפוגה (Days Before Expiration)
 * 5. סטטוס (Status)
 * 6. תאריך שליחה (Sent At)
 * 7. פעולות (Actions)
 */
export default function NotificationList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { selectedAccountId } = useAccount();
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<NotificationFilters>({});
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  // Fetch notifications
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications', selectedAccountId, page, pageSize, filters],
    queryFn: () => notificationsApi.getAll({
      ...filters,
      page,
      pageSize,
    }),
    enabled: !!selectedAccountId,
  });

  // Generate notifications mutation
  const generateMutation = useMutation({
    mutationFn: () => notificationsApi.generate(),
    onSuccess: (result) => {
      setSnackbar({
        open: true,
        message: `נוצרו ${result.createdCount} התראות חדשות`,
        severity: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: 'שגיאה ביצירת התראות',
        severity: 'error',
      });
    },
  });

  // Process notifications mutation
  const processMutation = useMutation({
    mutationFn: () => notificationsApi.process(),
    onSuccess: (result) => {
      setSnackbar({
        open: true,
        message: `עובדו ${result.processed} התראות: ${result.sent} נשלחו, ${result.failed} נכשלו`,
        severity: result.failed > 0 ? 'error' : 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: 'שגיאה בעיבוד התראות',
        severity: 'error',
      });
    },
  });

  // Retry notification mutation
  const retryMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.retry(id),
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: 'התראה נשלחה מחדש בהצלחה',
        severity: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: 'שגיאה בשליחה מחדש',
        severity: 'error',
      });
    },
  });

  // Bulk retry mutation
  const retryBulkMutation = useMutation({
    mutationFn: (ids: string[]) => notificationsApi.retryBulk(ids),
    onSuccess: (result) => {
      setSnackbar({
        open: true,
        message: `${result.retried} התראות נשלחו מחדש`,
        severity: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: 'שגיאה בשליחה מחדש',
        severity: 'error',
      });
    },
  });

  const handleRetry = (id: string) => {
    retryMutation.mutate(id);
  };

  const handleViewDetails = (notification: Notification) => {
    setSelectedNotification(notification);
    setDetailsDialogOpen(true);
  };

  const handleGenerate = () => {
    generateMutation.mutate();
  };

  const handleProcess = () => {
    processMutation.mutate();
  };

  const handleRetryBulk = () => {
    const failedNotifications = data?.data.filter(n => n.status === 'FAILED') || [];
    if (failedNotifications.length === 0) {
      setSnackbar({
        open: true,
        message: 'אין התראות כושלות לשליחה מחדש',
        severity: 'info',
      });
      return;
    }
    retryBulkMutation.mutate(failedNotifications.map(n => n.id));
  };

  const columns: GridColDef<Notification>[] = useMemo(() => [
    {
      field: 'propertyAddress',
      headerName: 'נכס',
      flex: 1,
      minWidth: 200,
      align: 'right',
      headerAlign: 'right',
      valueGetter: (params) => params.row.lease?.unit?.property?.address || 'לא זמין',
      renderCell: (params) => (
        <Typography
          sx={{ cursor: 'pointer', color: 'primary.main' }}
          onClick={() => router.push(`/properties/${params.row.lease?.unit?.property?.id}`)}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'tenantName',
      headerName: 'דייר',
      flex: 1,
      minWidth: 150,
      align: 'right',
      headerAlign: 'right',
      valueGetter: (params) => params.row.lease?.tenant?.name || 'לא זמין',
    },
    {
      field: 'type',
      headerName: 'סוג התראה',
      width: 150,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value === 'LEASE_EXPIRING' ? 'חוזה מסתיים' : 'חוזה פג תוקף'}
          color={params.value === 'LEASE_EXPIRING' ? 'warning' : 'error'}
          size="small"
        />
      ),
    },
    {
      field: 'daysBeforeExpiration',
      headerName: 'ימים לפני תפוגה',
      width: 130,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'status',
      headerName: 'סטטוס',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const statusColors: Record<NotificationStatus, 'default' | 'primary' | 'success' | 'error'> = {
          PENDING: 'default',
          SENT: 'success',
          FAILED: 'error',
        };
        const statusLabels: Record<NotificationStatus, string> = {
          PENDING: 'ממתין',
          SENT: 'נשלח',
          FAILED: 'נכשל',
        };
        return (
          <Chip
            label={statusLabels[params.value as NotificationStatus]}
            color={statusColors[params.value as NotificationStatus]}
            size="small"
          />
        );
      },
    },
    {
      field: 'sentAt',
      headerName: 'תאריך שליחה',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => {
        if (!params.value) return 'לא נשלח';
        return new Date(params.value).toLocaleDateString('he-IL');
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'פעולות',
      width: 150,
      align: 'left',
      headerAlign: 'left',
      getActions: (params) => [
        <GridActionsCellItem
          key="view"
          icon={<VisibilityIcon />}
          label="צפייה"
          onClick={() => handleViewDetails(params.row)}
        />,
        ...(params.row.status === 'FAILED' ? [
          <GridActionsCellItem
            key="retry"
            icon={<RetryIcon />}
            label="שליחה מחדש"
            onClick={() => handleRetry(params.row.id)}
            disabled={retryMutation.isPending}
          />,
        ] : []),
      ],
    },
  ], [router, retryMutation.isPending]);

  const failedCount = useMemo(() => 
    data?.data.filter(n => n.status === 'FAILED').length || 0,
    [data?.data]
  );

  const pendingCount = useMemo(() => 
    data?.data.filter(n => n.status === 'PENDING').length || 0,
    [data?.data]
  );

  return (
    <Box sx={{ p: 3, direction: 'rtl' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          התראות
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            disabled={isLoading}
          >
            רענון
          </Button>
          <Button
            variant="outlined"
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
          >
            צור התראות
          </Button>
          {pendingCount > 0 && (
            <Button
              variant="contained"
              onClick={handleProcess}
              disabled={processMutation.isPending}
            >
              שלח התראות ממתינות ({pendingCount})
            </Button>
          )}
          {failedCount > 0 && (
            <Button
              variant="contained"
              color="error"
              onClick={handleRetryBulk}
              disabled={retryBulkMutation.isPending}
            >
              שליחה מחדש לכושלות ({failedCount})
            </Button>
          )}
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>סטטוס</InputLabel>
          <Select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as NotificationStatus || undefined })}
            label="סטטוס"
          >
            <MenuItem value="">הכל</MenuItem>
            <MenuItem value="PENDING">ממתין</MenuItem>
            <MenuItem value="SENT">נשלח</MenuItem>
            <MenuItem value="FAILED">נכשל</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>סוג התראה</InputLabel>
          <Select
            value={filters.type || ''}
            onChange={(e) => setFilters({ ...filters, type: e.target.value as NotificationType || undefined })}
            label="סוג התראה"
          >
            <MenuItem value="">הכל</MenuItem>
            <MenuItem value="LEASE_EXPIRING">חוזה מסתיים</MenuItem>
            <MenuItem value="LEASE_EXPIRED">חוזה פג תוקף</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="תאריך התחלה"
          type="date"
          value={filters.startDate || ''}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value || undefined })}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
        />

        <TextField
          label="תאריך סיום"
          type="date"
          value={filters.endDate || ''}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value || undefined })}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
        />

        {(filters.status || filters.type || filters.startDate || filters.endDate) && (
          <Button
            variant="outlined"
            onClick={() => setFilters({})}
          >
            נקה מסננים
          </Button>
        )}
      </Box>

      {/* DataGrid */}
      <Box sx={{ height: 600, width: '100%', direction: 'ltr' }}>
        <DataGrid
          rows={data?.data || []}
          rowCount={data?.pagination.total || 0}
          columns={columns}
          loading={isLoading}
          paginationMode="server"
          paginationModel={{ page: page - 1, pageSize }}
          onPaginationModelChange={(model) => {
            setPage(model.page + 1);
            setPageSize(model.pageSize);
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          sx={{
            direction: 'rtl',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              direction: 'rtl',
            },
            '& .MuiDataGrid-columnHeader': {
              direction: 'rtl',
            },
            '& .MuiDataGrid-cell': {
              direction: 'rtl',
              textAlign: 'right',
            },
          }}
        />
      </Box>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>פרטי התראה</DialogTitle>
        <DialogContent>
          {selectedNotification && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Typography><strong>נכס:</strong> {selectedNotification.lease?.unit?.property?.address || 'לא זמין'}</Typography>
              <Typography><strong>דייר:</strong> {selectedNotification.lease?.tenant?.name || 'לא זמין'}</Typography>
              <Typography><strong>סוג התראה:</strong> {selectedNotification.type === 'LEASE_EXPIRING' ? 'חוזה מסתיים' : 'חוזה פג תוקף'}</Typography>
              <Typography><strong>ימים לפני תפוגה:</strong> {selectedNotification.daysBeforeExpiration}</Typography>
              <Typography><strong>סטטוס:</strong> {
                selectedNotification.status === 'PENDING' ? 'ממתין' :
                selectedNotification.status === 'SENT' ? 'נשלח' : 'נכשל'
              }</Typography>
              {selectedNotification.sentAt && (
                <Typography><strong>תאריך שליחה:</strong> {new Date(selectedNotification.sentAt).toLocaleString('he-IL')}</Typography>
              )}
              {selectedNotification.error && (
                <Typography color="error"><strong>שגיאה:</strong> {selectedNotification.error}</Typography>
              )}
              <Typography><strong>תאריך יצירה:</strong> {new Date(selectedNotification.createdAt).toLocaleString('he-IL')}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedNotification?.status === 'FAILED' && (
            <Button
              onClick={() => {
                handleRetry(selectedNotification.id);
                setDetailsDialogOpen(false);
              }}
              variant="contained"
              disabled={retryMutation.isPending}
            >
              שליחה מחדש
            </Button>
          )}
          <Button onClick={() => setDetailsDialogOpen(false)}>סגור</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ zIndex: 9999 }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', fontSize: '1.1rem', fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
