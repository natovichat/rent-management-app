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
  FormControl,
  InputLabel,
  Select,
  Snackbar,
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { mortgagesApi, Mortgage, MortgageFilters } from '@/lib/api/mortgages';

type MortgageStatus = 'ACTIVE' | 'PAID_OFF' | 'REFINANCED' | 'DEFAULTED';
import { useAccount } from '@/contexts/AccountContext';
import MortgageForm from './MortgageForm';
import GenericCsvImport from '../import/GenericCsvImport';
import MortgageFilterPanel from './MortgageFilterPanel';
import QuickNavigator from '@/components/navigation/QuickNavigator';

/**
 * Get status color for mortgage.
 */
const getStatusColor = (status: MortgageStatus) => {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'PAID_OFF':
      return 'info';
    case 'REFINANCED':
      return 'warning';
    case 'DEFAULTED':
      return 'error';
    default:
      return 'default';
  }
};

/**
 * Get status label in Hebrew.
 */
const getStatusLabel = (status: MortgageStatus) => {
  switch (status) {
    case 'ACTIVE':
      return 'פעיל';
    case 'PAID_OFF':
      return 'סולק';
    case 'REFINANCED':
      return 'מימון מחדש';
    case 'DEFAULTED':
      return 'ברירת מחדל';
    default:
      return status;
  }
};

/**
 * Component for displaying and managing the list of mortgages.
 */
export default function MortgageList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { selectedAccountId } = useAccount();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const [filters, setFilters] = useState<MortgageFilters>({});
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMortgage, setSelectedMortgage] = useState<Mortgage | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mortgageToDelete, setMortgageToDelete] = useState<Mortgage | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setPage(1);
  }, [filters, debouncedSearch]);

  // Build filters object for API call (use debounced search value)
  const apiFilters: MortgageFilters = useMemo(() => ({
    ...filters,
    ...(debouncedSearch && { search: debouncedSearch }),
  }), [filters, debouncedSearch]);

  // Fetch all mortgages (filtered by account via backend)
  const { data, isLoading } = useQuery({
    queryKey: ['mortgages', selectedAccountId, page, pageSize, apiFilters],
    queryFn: () => mortgagesApi.getMortgages(page, pageSize, apiFilters),
    enabled: !!selectedAccountId,
  });

  const mortgages = data?.data || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: mortgagesApi.deleteMortgage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mortgages'] });
      setDeleteDialogOpen(false);
      setMortgageToDelete(null);
      setSnackbar({ open: true, message: 'משכנתא נמחקה בהצלחה', severity: 'success' });
    },
    onError: (error: any) => {
      const message = error?.response?.status === 409
        ? 'לא ניתן למחוק משכנתא עם תשלומים'
        : 'שגיאה במחיקת משכנתא';
      setSnackbar({ open: true, message, severity: 'error' });
    },
  });

  const columns: GridColDef[] = [
    {
      field: 'property',
      headerName: 'נכס',
      flex: 1,
      minWidth: 200,
      align: 'right',
      headerAlign: 'right',
      valueGetter: (params) => {
        const property = params?.value;
        if (!property) return '';
        return property.address || '';
      },
    },
    {
      field: 'bank',
      headerName: 'בנק',
      flex: 1,
      minWidth: 150,
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'loanAmount',
      headerName: 'סכום הלוואה',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => {
        return `₪${Number(params.value).toLocaleString()}`;
      },
    },
    {
      field: 'interestRate',
      headerName: 'ריבית (%)',
      width: 120,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => {
        return params.value ? `${Number(params.value).toFixed(2)}%` : '-';
      },
    },
    {
      field: 'monthlyPayment',
      headerName: 'תשלום חודשי',
      width: 130,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => {
        return params.value ? `₪${Number(params.value).toLocaleString()}` : '-';
      },
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
              router.push(`/mortgages/${params.id}`);
            }}
          />,
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="עריכה"
            onClick={() => {
              setSelectedMortgage(params.row);
              setOpenDialog(true);
            }}
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="מחיקה"
            onClick={() => {
              setMortgageToDelete(params.row);
              setDeleteDialogOpen(true);
            }}
          />,
        ];
        return actions;
      },
    },
  ];

  const handleDelete = () => {
    if (mortgageToDelete) {
      deleteMutation.mutate(mortgageToDelete.id);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMortgage(null);
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['mortgages'] });
    handleCloseDialog();
    setSnackbar({ open: true, message: 'משכנתא נשמרה בהצלחה', severity: 'success' });
  };

  return (
    <Box sx={{ p: 3, direction: 'rtl' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          משכנתאות והלוואות
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <QuickNavigator label="מעבר לטבלה" size="small" width={200} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <GenericCsvImport
              importType="mortgages"
              entityLabel="משכנתאות"
              queryKey={['mortgages', selectedAccountId]}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedMortgage(null);
                setOpenDialog(true);
              }}
            >
              משכנתא חדשה
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="חפש לפי כתובת נכס, שם בנק או מספר הלוואה..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
        />
      </Box>

      {/* Advanced Filters */}
      <MortgageFilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        onClear={() => setFilters({})}
      />

      {/* DataGrid */}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={mortgages}
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
            },
            '& .MuiDataGrid-cell': {
              direction: 'rtl',
              textAlign: 'right',
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

      {/* Create/Edit Dialog */}
      <MortgageForm
        mortgage={selectedMortgage}
        open={openDialog}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>מחיקת משכנתא</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את המשכנתא?
            {mortgageToDelete && (
              <>
                <br />
                <strong>{mortgageToDelete.bank}</strong> - {mortgageToDelete.property?.address}
              </>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>ביטול</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            מחק
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}
