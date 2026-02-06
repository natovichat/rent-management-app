'use client';

import { useState, useMemo } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Link,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import {
  financialsApi,
  Income,
  IncomeType,
  IncomeFilters,
  CreateIncomeDto,
} from '@/lib/api/financials';
import { propertiesApi } from '@/services/properties';
import { useAccount } from '@/contexts/AccountContext';
import { IncomeForm } from './IncomeForm';

const INCOME_TYPE_LABELS: Record<IncomeType, string> = {
  [IncomeType.RENT]: 'דמי שכירות',
  [IncomeType.SALE]: 'מכירה',
  [IncomeType.CAPITAL_GAIN]: 'רווח הון',
  [IncomeType.OTHER]: 'אחר',
};

const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '';
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(numValue);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('he-IL');
};

export default function IncomeListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { selectedAccountId } = useAccount();
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const [filters, setFilters] = useState<IncomeFilters>({});
  const [openForm, setOpenForm] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [incomeToDelete, setIncomeToDelete] = useState<Income | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Fetch properties for filter dropdown
  const { data: propertiesData } = useQuery({
    queryKey: ['properties', selectedAccountId, 'all'],
    queryFn: () => propertiesApi.getAll(1, 100, undefined),
    enabled: !!selectedAccountId,
  });

  // Build filters for API call
  const apiFilters: IncomeFilters = useMemo(() => ({
    ...filters,
  }), [filters]);

  // Fetch income
  const { data: income = [], isLoading } = useQuery({
    queryKey: ['income', selectedAccountId, apiFilters],
    queryFn: () => financialsApi.getIncome(apiFilters),
    enabled: !!selectedAccountId,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateIncomeDto) => financialsApi.createIncome(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
      setOpenForm(false);
      setSelectedIncome(null);
      setSnackbar({
        open: true,
        message: 'הכנסה נוספה בהצלחה',
        severity: 'success',
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'שגיאה בהוספת הכנסה',
        severity: 'error',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateIncomeDto> }) =>
      financialsApi.updateIncome(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
      setOpenForm(false);
      setSelectedIncome(null);
      setSnackbar({
        open: true,
        message: 'הכנסה עודכנה בהצלחה',
        severity: 'success',
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'שגיאה בעדכון הכנסה',
        severity: 'error',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => financialsApi.deleteIncome(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
      setDeleteDialogOpen(false);
      setIncomeToDelete(null);
      setSnackbar({
        open: true,
        message: 'הכנסה נמחקה בהצלחה',
        severity: 'success',
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'שגיאה במחיקת הכנסה',
        severity: 'error',
      });
    },
  });

  const columns: GridColDef<Income>[] = [
    {
      field: 'property',
      headerName: 'נכס',
      flex: 1,
      minWidth: 200,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => {
        const property = params.row.property;
        if (!property) return '-';
        return (
          <Link
            onClick={() => router.push(`/properties/${property.id}`)}
            sx={{
              cursor: 'pointer',
              color: 'primary.main',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {property.address}
          </Link>
        );
      },
    },
    {
      field: 'incomeDate',
      headerName: 'תאריך',
      width: 120,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      field: 'type',
      headerName: 'סוג',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={INCOME_TYPE_LABELS[params.value as IncomeType] || params.value}
          size="small"
          color="success"
        />
      ),
    },
    {
      field: 'amount',
      headerName: 'סכום',
      width: 120,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatCurrency(params.value),
    },
    {
      field: 'source',
      headerName: 'מקור',
      flex: 1,
      minWidth: 150,
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'description',
      headerName: 'תיאור',
      flex: 1,
      minWidth: 150,
      align: 'right',
      headerAlign: 'right',
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
          onClick={() => {
            router.push(`/properties/${params.row.propertyId}`);
          }}
        />,
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="עריכה"
          onClick={() => {
            setSelectedIncome(params.row);
            setOpenForm(true);
          }}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="מחיקה"
          onClick={() => {
            setIncomeToDelete(params.row);
            setDeleteDialogOpen(true);
          }}
        />,
      ],
    },
  ];

  const handleFormSubmit = async (data: CreateIncomeDto) => {
    if (selectedIncome) {
      await updateMutation.mutateAsync({
        id: selectedIncome.id,
        data,
      });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleDelete = () => {
    if (incomeToDelete) {
      deleteMutation.mutate(incomeToDelete.id);
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
            ניהול הכנסות
          </Typography>
          <Typography variant="body2" color="text.secondary">
            רשימת כל ההכנסות במערכת
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedIncome(null);
            setOpenForm(true);
          }}
        >
          הכנסה חדשה
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="חפש..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>נכס</InputLabel>
          <Select
            value={filters.propertyId || ''}
            label="נכס"
            onChange={(e) =>
              setFilters({ ...filters, propertyId: e.target.value || undefined })
            }
          >
            <MenuItem value="">הכל</MenuItem>
            {propertiesData?.data?.map((property) => (
              <MenuItem key={property.id} value={property.id}>
                {property.address}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>סוג</InputLabel>
          <Select
            value={filters.type || ''}
            label="סוג"
            onChange={(e) =>
              setFilters({ ...filters, type: (e.target.value as IncomeType) || undefined })
            }
          >
            <MenuItem value="">הכל</MenuItem>
            {Object.entries(INCOME_TYPE_LABELS).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* DataGrid */}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={income}
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
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25 },
            },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          getRowId={(row) => row.id}
        />
      </Box>

      {/* Create/Edit Form Dialog */}
      {openForm && (
        <IncomeForm
          open={openForm}
          onClose={() => {
            setOpenForm(false);
            setSelectedIncome(null);
          }}
          onSubmit={handleFormSubmit}
          propertyId={selectedIncome?.propertyId || filters.propertyId}
          initialData={selectedIncome || undefined}
          properties={propertiesData?.data}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>מחיקת הכנסה</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את ההכנסה הזו? פעולה זו לא ניתנת לביטול.
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
