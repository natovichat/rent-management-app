'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Snackbar,
  Typography,
  useMediaQuery,
  useTheme,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  RestoreFromTrash as RestoreIcon,
} from '@mui/icons-material';
import {
  ownershipsApi,
  Ownership,
  OwnershipType,
} from '@/lib/api/ownerships';
import { useShowDeleted } from '@/lib/hooks/useShowDeleted';
import { getUserProfile } from '@/lib/auth';
import OwnershipForm from './OwnershipForm';

const OWNERSHIP_TYPE_LABELS: Record<string, string> = {
  FULL: 'בעלות מלאה',
  PARTIAL: 'בעלות חלקית',
  PARTNERSHIP: 'שותפות',
  COMPANY: 'חברה',
  REAL: 'חקרי',
  LEGAL: 'משפטית',
};

const MOBILE_OWNERSHIP_TYPE_LABELS: Record<string, string> = {
  ...OWNERSHIP_TYPE_LABELS,
  REAL: 'ממשי',
  LEGAL: 'משפטי',
};

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('he-IL');
};

const formatPercentage = (value: number | string | undefined): string => {
  if (value === undefined || value === null) return '-';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `${num}%`;
};

function MobileOwnershipCard({
  ownership,
  onEdit,
  onDelete,
}: {
  ownership: Ownership;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const ownershipTypeLabel =
    MOBILE_OWNERSHIP_TYPE_LABELS[ownership.ownershipType] ??
    OWNERSHIP_TYPE_LABELS[ownership.ownershipType] ??
    ownership.ownershipType;

  return (
    <Card sx={{ mb: 1.5, borderRadius: 2 }} variant="outlined">
      <CardContent sx={{ pb: 0 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          {ownership.property?.address ?? '—'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {ownership.person?.name ?? '—'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatPercentage(ownership.ownershipPercentage)} בעלות
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {ownershipTypeLabel}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          התחלה: {formatDate(ownership.startDate)}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
        <IconButton size="small" onClick={onEdit}>
          <EditIcon />
        </IconButton>
        <IconButton size="small" color="error" onClick={onDelete}>
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
}

export default function OwnershipList() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const queryClient = useQueryClient();
  const { showDeleted } = useShowDeleted();
  const [isAdmin, setIsAdmin] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [openForm, setOpenForm] = useState(false);
  const [selectedOwnership, setSelectedOwnership] = useState<Ownership | null>(
    null,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ownershipToDelete, setOwnershipToDelete] =
    useState<Ownership | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const profile = getUserProfile();
    setIsAdmin(profile?.role === 'ADMIN');
  }, []);

  const includeDeleted = isAdmin && showDeleted;

  const { data, isLoading } = useQuery({
    queryKey: ['ownerships', page, pageSize, includeDeleted],
    queryFn: () => ownershipsApi.getOwnerships(page, pageSize, includeDeleted),
  });

  const ownerships = data?.data || [];
  const meta = data?.meta;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ownershipsApi.deleteOwnership(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerships'] });
      setDeleteDialogOpen(false);
      setOwnershipToDelete(null);
      setSnackbar({
        open: true,
        message: 'בעלות נמחקה בהצלחה',
        severity: 'success',
      });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      setSnackbar({
        open: true,
        message:
          err.response?.data?.message || 'שגיאה במחיקת בעלות',
        severity: 'error',
      });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => ownershipsApi.restoreOwnership(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerships'] });
      setSnackbar({ open: true, message: 'בעלות שוחזרה בהצלחה', severity: 'success' });
    },
    onError: () => {
      setSnackbar({ open: true, message: 'שגיאה בשחזור בעלות', severity: 'error' });
    },
  });

  const columns: GridColDef<Ownership>[] = [
    {
      field: 'property',
      headerName: 'נכס',
      flex: 1,
      minWidth: 200,
      align: 'right',
      headerAlign: 'right',
      valueGetter: (params) => params.row.property?.address || '-',
    },
    {
      field: 'person',
      headerName: 'אדם',
      flex: 1,
      minWidth: 150,
      align: 'right',
      headerAlign: 'right',
      valueGetter: (params) => params.row.person?.name || '-',
    },
    {
      field: 'ownershipPercentage',
      headerName: 'אחוז בעלות',
      width: 130,
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => formatPercentage(params.value),
    },
    {
      field: 'ownershipType',
      headerName: 'סוג בעלות',
      width: 130,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) =>
        OWNERSHIP_TYPE_LABELS[params.value as string] || params.value,
    },
    {
      field: 'startDate',
      headerName: 'תאריך התחלה',
      width: 130,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      field: 'endDate',
      headerName: 'תאריך סיום',
      width: 130,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'פעולות',
      width: 150,
      align: 'left',
      headerAlign: 'left',
      getActions: (params) => {
        const isDeleted = !!params.row.deletedAt;
        if (isDeleted && isAdmin) {
          return [
            <GridActionsCellItem
              key="restore"
              icon={<RestoreIcon />}
              label="שחזר"
              onClick={() => restoreMutation.mutate(params.row.id)}
            />,
          ];
        }
        return [
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="עריכה"
            onClick={() => {
              setSelectedOwnership(params.row);
              setOpenForm(true);
            }}
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="מחיקה"
            onClick={() => {
              setOwnershipToDelete(params.row);
              setDeleteDialogOpen(true);
            }}
          />,
        ];
      },
    },
  ];

  const handleFormSuccess = () => {
    setOpenForm(false);
    setSelectedOwnership(null);
    setSnackbar({
      open: true,
      message: selectedOwnership ? 'בעלות עודכנה בהצלחה' : 'בעלות נוספה בהצלחה',
      severity: 'success',
    });
  };

  const handleDelete = () => {
    if (ownershipToDelete) {
      deleteMutation.mutate(ownershipToDelete.id);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h5" component="h2">
          רשימת בעלויות
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedOwnership(null);
            setOpenForm(true);
          }}
        >
          הוסף בעלות
        </Button>
      </Box>

      {isMobile ? (
        <Box>
          {isLoading ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">טוען...</Typography>
            </Box>
          ) : ownerships.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              אין בעלויות
            </Typography>
          ) : (
            ownerships.map((ownership) => (
              <MobileOwnershipCard
                key={ownership.id}
                ownership={ownership}
                onEdit={() => {
                  setSelectedOwnership(ownership);
                  setOpenForm(true);
                }}
                onDelete={() => {
                  setOwnershipToDelete(ownership);
                  setDeleteDialogOpen(true);
                }}
              />
            ))
          )}
        </Box>
      ) : (
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={ownerships}
            columns={columns}
            loading={isLoading}
            pagination
            paginationMode="server"
            rowCount={meta?.total ?? 0}
            pageSizeOptions={[10, 20, 50]}
            paginationModel={{
              page: page - 1,
              pageSize,
            }}
            onPaginationModelChange={(model) => {
              setPage(model.page + 1);
              setPageSize(model.pageSize);
            }}
            sx={{
              direction: 'rtl',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
              },
              '& .MuiDataGrid-cell': {
                direction: 'rtl',
              },
              '& .MuiDataGrid-columnHeader': {
                direction: 'rtl',
              },
              '& .row-deleted': {
                color: 'text.disabled',
                textDecoration: 'line-through',
                bgcolor: 'action.hover',
                opacity: 0.6,
              },
            }}
            getRowClassName={(params) => params.row.deletedAt ? 'row-deleted' : ''}
          />
        </Box>
      )}

      {/* Create/Edit Form Dialog */}
      <Dialog
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setSelectedOwnership(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedOwnership ? 'עריכת בעלות' : 'הוספת בעלות'}
        </DialogTitle>
        <DialogContent>
          <OwnershipForm
            ownership={selectedOwnership}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setOpenForm(false);
              setSelectedOwnership(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setOwnershipToDelete(null);
        }}
      >
        <DialogTitle>אישור מחיקה</DialogTitle>
        <DialogContent>
          <DialogContentText>
            האם אתה בטוח שברצונך למחוק בעלות זו?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setOwnershipToDelete(null);
            }}
          >
            ביטול
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'מוחק...' : 'מחק'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {isMobile && (
        <Fab
          color="primary"
          aria-label="הוסף בעלות"
          sx={{ position: 'fixed', bottom: 80, left: 16, zIndex: 1200 }}
          onClick={() => {
            setSelectedOwnership(null);
            setOpenForm(true);
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
}
