'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  ownershipsApi,
  Ownership,
  OwnershipType,
} from '@/lib/api/ownerships';
import OwnershipForm from './OwnershipForm';

const OWNERSHIP_TYPE_LABELS: Record<string, string> = {
  FULL: 'בעלות מלאה',
  PARTIAL: 'בעלות חלקית',
  PARTNERSHIP: 'שותפות',
  COMPANY: 'חברה',
  REAL: 'חקרי',
  LEGAL: 'משפטית',
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

export default function OwnershipList() {
  const queryClient = useQueryClient();
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

  const { data, isLoading } = useQuery({
    queryKey: ['ownerships', page, pageSize],
    queryFn: () => ownershipsApi.getOwnerships(page, pageSize),
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
      field: 'owner',
      headerName: 'בעלים',
      flex: 1,
      minWidth: 150,
      align: 'right',
      headerAlign: 'right',
      valueGetter: (params) => params.row.owner?.name || '-',
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
      getActions: (params) => [
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
      ],
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
          }}
        />
      </Box>

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
    </Box>
  );
}
