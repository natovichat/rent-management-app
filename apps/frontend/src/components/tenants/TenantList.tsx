'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  TextField,
  InputAdornment,
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useRouter } from 'next/navigation';
import { tenantsApi, Tenant } from '@/lib/api/tenants';
import { useAccount } from '@/contexts/AccountContext';
import TenantForm from './TenantForm';
import { useDebounce } from '@/hooks/useDebounce';

/**
 * Component for displaying and managing the list of tenants.
 */
export default function TenantList() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { selectedAccountId } = useAccount();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch all tenants (filtered by account via backend)
  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['tenants', selectedAccountId, debouncedSearch],
    queryFn: () => tenantsApi.getAll(debouncedSearch || undefined),
    enabled: !!selectedAccountId,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: tenantsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      setDeleteDialogOpen(false);
      setTenantToDelete(null);
      setError(null);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to delete tenant');
    },
  });

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'שם',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Button
          onClick={() => router.push(`/tenants/${params.row.id}`)}
          sx={{
            textTransform: 'none',
            color: 'primary.main',
            fontWeight: 500,
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          {params.value}
        </Button>
      ),
    },
    {
      field: 'email',
      headerName: 'אימייל',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'phone',
      headerName: 'טלפון',
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'leases',
      headerName: 'חוזים פעילים',
      width: 120,
      valueGetter: (params) => {
        const leases = params?.value || [];
        return leases.filter((l: any) => l.status === 'ACTIVE').length;
      },
    },
    {
      field: 'createdAt',
      headerName: 'תאריך יצירה',
      width: 120,
      valueFormatter: (params) => {
        return new Date(params.value).toLocaleDateString('he-IL');
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'פעולות',
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          key="view"
          icon={<VisibilityIcon />}
          label="צפייה"
          onClick={() => {
            router.push(`/tenants/${params.row.id}`);
          }}
        />,
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="עריכה"
          onClick={() => {
            setSelectedTenant(params.row);
            setOpenDialog(true);
          }}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="מחיקה"
          onClick={() => {
            setTenantToDelete(params.row);
            setDeleteDialogOpen(true);
            setError(null);
          }}
        />,
      ],
    },
  ];

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTenant(null);
  };

  const handleDelete = () => {
    if (tenantToDelete) {
      deleteMutation.mutate(tenantToDelete.id);
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
        <div>
          <Typography variant="h4" component="h1" gutterBottom>
            ניהול דיירים
          </Typography>
          <Typography variant="body2" color="text.secondary">
            רשימת כל הדיירים במערכת
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          דייר חדש
        </Button>
      </Box>

      {/* Search Input */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="חפש לפי שם, אימייל או טלפון..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setSearchQuery('')}
                  edge="end"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ direction: 'rtl' }}
        />
      </Box>

      {tenants.length === 0 && !isLoading && !debouncedSearch ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            אין דיירים במערכת
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            התחל על ידי הוספת דייר ראשון
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            הוסף דייר ראשון
          </Button>
        </Box>
      ) : tenants.length === 0 && !isLoading && debouncedSearch ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            לא נמצאו תוצאות
          </Typography>
          <Typography variant="body2" color="text.secondary">
            נסה לשנות את מילות החיפוש
          </Typography>
        </Box>
      ) : (
        <DataGrid
          rows={tenants}
          columns={columns}
          loading={isLoading}
          autoHeight
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          sx={{
            '& .MuiDataGrid-cell': {
              direction: 'rtl',
            },
            '& .MuiDataGrid-columnHeader': {
              direction: 'rtl',
            },
          }}
        />
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedTenant ? 'עריכת דייר' : 'דייר חדש'}
        </DialogTitle>
        <DialogContent>
          <TenantForm
            tenant={selectedTenant}
            onSuccess={() => {
              handleCloseDialog();
              queryClient.invalidateQueries({ queryKey: ['tenants'] });
            }}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>אישור מחיקה</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Typography>
            האם אתה בטוח שברצונך למחוק את הדייר "{tenantToDelete?.name}"?
          </Typography>
          {tenantToDelete?.leases && tenantToDelete.leases.length > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              לדייר זה יש חוזים פעילים. לא ניתן למחוק דייר עם חוזים פעילים.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>ביטול</Button>
          <Button
            onClick={handleDelete}
            color="error"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'מוחק...' : 'מחק'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
