'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import {
  Box,
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { leasesApi, Lease, LeaseFilters } from '@/lib/api/leases';
import { useAccount } from '@/contexts/AccountContext';
import LeaseForm from './LeaseForm';
import LeaseFilterPanel from './LeaseFilterPanel';

/**
 * Get status color for lease.
 */
const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'FUTURE':
      return 'info';
    case 'EXPIRED':
      return 'warning';
    case 'TERMINATED':
      return 'error';
    default:
      return 'default';
  }
};

/**
 * Get status label in Hebrew.
 */
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'פעיל';
    case 'FUTURE':
      return 'עתידי';
    case 'EXPIRED':
      return 'פג תוקף';
    case 'TERMINATED':
      return 'בוטל';
    default:
      return status;
  }
};

/**
 * Component for displaying and managing the list of leases.
 */
export default function LeaseList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { selectedAccountId } = useAccount();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const [filters, setFilters] = useState<LeaseFilters>({});
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leaseToDelete, setLeaseToDelete] = useState<Lease | null>(null);
  const [terminateDialogOpen, setTerminateDialogOpen] = useState(false);
  const [leaseToTerminate, setLeaseToTerminate] = useState<Lease | null>(null);

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setPage(1);
  }, [filters, debouncedSearch]);

  // Build filters object for API call (use debounced search value)
  const apiFilters: LeaseFilters = useMemo(() => ({
    ...filters,
    ...(debouncedSearch && { search: debouncedSearch }),
  }), [filters, debouncedSearch]);

  // Fetch all leases (filtered by account via backend)
  const { data, isLoading } = useQuery({
    queryKey: ['leases', selectedAccountId, page, pageSize, apiFilters],
    queryFn: () => leasesApi.getAll(page, pageSize, apiFilters),
    enabled: !!selectedAccountId,
  });

  const leases = data?.data || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: leasesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leases'] });
      setDeleteDialogOpen(false);
      setLeaseToDelete(null);
    },
  });

  // Terminate mutation
  const terminateMutation = useMutation({
    mutationFn: leasesApi.terminate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leases'] });
      setTerminateDialogOpen(false);
      setLeaseToTerminate(null);
    },
  });

  const columns: GridColDef[] = [
    {
      field: 'unit',
      headerName: 'נכס',
      flex: 1,
      minWidth: 200,
      align: 'right',
      headerAlign: 'right',
      valueGetter: (params) => {
        const unit = params?.value;
        if (!unit) return '';
        return `${unit.property?.address} - דירה ${unit.apartmentNumber}`;
      },
    },
    {
      field: 'tenant',
      headerName: 'דייר',
      flex: 1,
      minWidth: 150,
      align: 'right',
      headerAlign: 'right',
      valueGetter: (params) => params?.value?.name || '',
    },
    {
      field: 'startDate',
      headerName: 'תאריך התחלה',
      width: 120,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => {
        return new Date(params.value).toLocaleDateString('he-IL');
      },
    },
    {
      field: 'endDate',
      headerName: 'תאריך סיום',
      width: 120,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => {
        return new Date(params.value).toLocaleDateString('he-IL');
      },
    },
    {
      field: 'monthlyRent',
      headerName: 'שכירות חודשית',
      width: 130,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => {
        return `₪${Number(params.value).toLocaleString()}`;
      },
    },
    {
      field: 'status',
      headerName: 'סטטוס',
      width: 110,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={getStatusLabel(params.value)}
          color={getStatusColor(params.value) as any}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'פעולות',
      width: 150,
      align: 'left',
      headerAlign: 'left',
      getActions: (params) => {
        const actions = [
          <GridActionsCellItem
            key="view"
            icon={<VisibilityIcon />}
            label="צפייה"
            onClick={() => {
              router.push(`/leases/${params.row.id}`);
            }}
          />,
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="עריכה"
            onClick={() => {
              setSelectedLease(params.row);
              setOpenDialog(true);
            }}
            disabled={params.row.status === 'TERMINATED'}
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="מחיקה"
            onClick={() => {
              setLeaseToDelete(params.row);
              setDeleteDialogOpen(true);
            }}
          />,
        ];

        if (params.row.status === 'ACTIVE' || params.row.status === 'FUTURE') {
          actions.push(
            <GridActionsCellItem
              key="terminate"
              icon={<CancelIcon />}
              label="ביטול חוזה"
              onClick={() => {
                setLeaseToTerminate(params.row);
                setTerminateDialogOpen(true);
              }}
            />
          );
        }

        return actions;
      },
    },
  ];

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedLease(null);
  };

  const handleDelete = () => {
    if (leaseToDelete) {
      deleteMutation.mutate(leaseToDelete.id);
    }
  };

  const handleTerminate = () => {
    if (leaseToTerminate) {
      terminateMutation.mutate(leaseToTerminate.id);
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
            ניהול חוזים
          </Typography>
          <Typography variant="body2" color="text.secondary">
            רשימת כל החוזים במערכת
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          חוזה חדש
        </Button>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="חפש לפי כתובת נכס, שם דייר או מספר דירה..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
        />
      </Box>

      {/* Advanced Filters */}
      <LeaseFilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        onClear={() => setFilters({})}
      />

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={leases}
          columns={columns}
          loading={isLoading}
          paginationMode="server"
          rowCount={data?.meta?.total || 0}
          paginationModel={{ page: page - 1, pageSize }}
          onPaginationModelChange={(model) => {
            setPage(model.page + 1);
            setPageSize(model.pageSize);
          }}
          pageSizeOptions={[10, 25, 50, 100]}
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
          getRowId={(row) => row.id}
        />
      </Box>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedLease ? 'עריכת חוזה' : 'חוזה חדש'}
        </DialogTitle>
        <DialogContent>
          <LeaseForm
            lease={selectedLease}
            onSuccess={() => {
              handleCloseDialog();
              queryClient.invalidateQueries({ queryKey: ['leases'] });
            }}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>אישור מחיקה</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את החוזה?
          </Typography>
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

      {/* Terminate Confirmation Dialog */}
      <Dialog open={terminateDialogOpen} onClose={() => setTerminateDialogOpen(false)}>
        <DialogTitle>ביטול חוזה</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            פעולה זו תבטל את החוזה לפני תאריך הסיום. לא ניתן לבטל פעולה זו.
          </Alert>
          <Typography>
            האם אתה בטוח שברצונך לבטל את החוזה?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTerminateDialogOpen(false)}>ביטול</Button>
          <Button
            onClick={handleTerminate}
            color="error"
            disabled={terminateMutation.isPending}
          >
            {terminateMutation.isPending ? 'מבטל...' : 'בטל חוזה'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
