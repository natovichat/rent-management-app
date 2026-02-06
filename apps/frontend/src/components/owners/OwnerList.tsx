'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAccount } from '@/contexts/AccountContext';
import {
  ownersApi,
  Owner,
  CreateOwnerDto,
} from '@/lib/api/owners';
import OwnerForm from './OwnerForm';
import OwnerCsvActions from './OwnerCsvActions';

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('he-IL');
};

export default function OwnerList() {
  const queryClient = useQueryClient();
  const { selectedAccountId } = useAccount();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const [openForm, setOpenForm] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState<Owner | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Fetch owners with backend search and pagination
  const { data, isLoading } = useQuery({
    queryKey: ['owners', selectedAccountId, page, pageSize, debouncedSearch],
    queryFn: () => ownersApi.getOwners(page, pageSize, debouncedSearch || undefined),
    enabled: !!selectedAccountId,
  });

  const owners = data?.data || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => ownersApi.deleteOwner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners'] });
      setDeleteDialogOpen(false);
      setOwnerToDelete(null);
      setSnackbar({
        open: true,
        message: 'בעלים נמחק בהצלחה',
        severity: 'success',
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'שגיאה במחיקת בעלים',
        severity: 'error',
      });
    },
  });

  const columns: GridColDef<Owner>[] = [
    {
      field: 'name',
      headerName: 'שם',
      flex: 1,
      minWidth: 200,
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'email',
      headerName: 'אימייל',
      flex: 1,
      minWidth: 150,
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'phone',
      headerName: 'טלפון',
      flex: 1,
      minWidth: 120,
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'address',
      headerName: 'כתובת',
      flex: 1,
      minWidth: 200,
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'ownerships',
      headerName: 'מספר נכסים',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (params) => {
        const ownerships = params?.value || [];
        return ownerships.length;
      },
    },
    {
      field: 'createdAt',
      headerName: 'תאריך יצירה',
      width: 120,
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
            setSelectedOwner(params.row);
            setOpenForm(true);
          }}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="מחיקה"
          onClick={() => {
            setOwnerToDelete(params.row);
            setDeleteDialogOpen(true);
          }}
        />,
      ],
    },
  ];

  const handleFormSuccess = () => {
    setOpenForm(false);
    setSelectedOwner(null);
    setSnackbar({
      open: true,
      message: selectedOwner ? 'בעלים עודכן בהצלחה' : 'בעלים נוסף בהצלחה',
      severity: 'success',
    });
  };

  const handleDelete = () => {
    if (ownerToDelete) {
      deleteMutation.mutate(ownerToDelete.id);
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
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            ניהול בעלים
          </Typography>
          <Typography variant="body2" color="text.secondary">
            רשימת כל הבעלים במערכת
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <OwnerCsvActions />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedOwner(null);
              setOpenForm(true);
            }}
          >
            בעלים חדש
          </Button>
        </Box>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="חפש לפי שם, אימייל או טלפון..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
        />
      </Box>

      {/* DataGrid */}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={owners}
          columns={columns}
          loading={isLoading}
          sx={{
            direction: 'rtl',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              direction: 'rtl',
            },
            '& .MuiDataGrid-columnHeader': {
              direction: 'rtl',
              '& .MuiDataGrid-columnHeaderTitle': {
                textAlign: 'right',
                width: '100%',
                paddingRight: '8px',
              },
            },
            '& .MuiDataGrid-cell': {
              direction: 'rtl',
              textAlign: 'right',
              paddingRight: '16px',
            },
          }}
          paginationMode="server"
          rowCount={data?.meta?.total || 0}
          paginationModel={{ page: page - 1, pageSize }}
          onPaginationModelChange={(model) => {
            setPage(model.page + 1);
            setPageSize(model.pageSize);
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          getRowId={(row) => row.id}
        />
      </Box>

      {/* Create/Edit Form Dialog */}
      <Dialog
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setSelectedOwner(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedOwner ? 'עריכת בעלים' : 'בעלים חדש'}
        </DialogTitle>
        <DialogContent>
          <OwnerForm
            owner={selectedOwner}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setOpenForm(false);
              setSelectedOwner(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>מחיקת בעלים</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את הבעלים "{ownerToDelete?.name}"?
            פעולה זו לא ניתנת לביטול.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>ביטול</Button>
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

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
