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
  Expense,
  ExpenseType,
  ExpenseFilters,
  CreateExpenseDto,
} from '@/lib/api/financials';
import { propertiesApi } from '@/services/properties';
import { useAccount } from '@/contexts/AccountContext';
import { ExpenseForm } from './ExpenseForm';

const EXPENSE_TYPE_LABELS: Record<ExpenseType, string> = {
  [ExpenseType.MAINTENANCE]: 'תחזוקה',
  [ExpenseType.TAX]: 'מס',
  [ExpenseType.INSURANCE]: 'ביטוח',
  [ExpenseType.UTILITIES]: 'חשמל/מים/גז',
  [ExpenseType.RENOVATION]: 'שיפוץ',
  [ExpenseType.LEGAL]: 'משפטי',
  [ExpenseType.OTHER]: 'אחר',
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

export default function ExpensesListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { selectedAccountId } = useAccount();
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const [filters, setFilters] = useState<ExpenseFilters>({});
  const [openForm, setOpenForm] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
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
  const apiFilters: ExpenseFilters = useMemo(() => ({
    ...filters,
  }), [filters]);

  // Fetch expenses
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses', selectedAccountId, apiFilters],
    queryFn: () => financialsApi.getExpenses(apiFilters),
    enabled: !!selectedAccountId,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateExpenseDto) => financialsApi.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setOpenForm(false);
      setSelectedExpense(null);
      setSnackbar({
        open: true,
        message: 'הוצאה נוספה בהצלחה',
        severity: 'success',
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'שגיאה בהוספת הוצאה',
        severity: 'error',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateExpenseDto> }) =>
      financialsApi.updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setOpenForm(false);
      setSelectedExpense(null);
      setSnackbar({
        open: true,
        message: 'הוצאה עודכנה בהצלחה',
        severity: 'success',
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'שגיאה בעדכון הוצאה',
        severity: 'error',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => financialsApi.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
      setSnackbar({
        open: true,
        message: 'הוצאה נמחקה בהצלחה',
        severity: 'success',
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'שגיאה במחיקת הוצאה',
        severity: 'error',
      });
    },
  });

  const columns: GridColDef<Expense>[] = [
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
      field: 'expenseDate',
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
          label={EXPENSE_TYPE_LABELS[params.value as ExpenseType] || params.value}
          size="small"
        />
      ),
    },
    {
      field: 'category',
      headerName: 'קטגוריה',
      flex: 1,
      minWidth: 150,
      align: 'right',
      headerAlign: 'right',
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
            setSelectedExpense(params.row);
            setOpenForm(true);
          }}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="מחיקה"
          onClick={() => {
            setExpenseToDelete(params.row);
            setDeleteDialogOpen(true);
          }}
        />,
      ],
    },
  ];

  const handleFormSubmit = async (data: CreateExpenseDto) => {
    if (selectedExpense) {
      await updateMutation.mutateAsync({
        id: selectedExpense.id,
        data,
      });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleDelete = () => {
    if (expenseToDelete) {
      deleteMutation.mutate(expenseToDelete.id);
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
            ניהול הוצאות
          </Typography>
          <Typography variant="body2" color="text.secondary">
            רשימת כל ההוצאות במערכת
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedExpense(null);
            setOpenForm(true);
          }}
        >
          הוצאה חדשה
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
              setFilters({ ...filters, type: (e.target.value as ExpenseType) || undefined })
            }
          >
            <MenuItem value="">הכל</MenuItem>
            {Object.entries(EXPENSE_TYPE_LABELS).map(([value, label]) => (
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
          rows={expenses}
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
        <ExpenseForm
          open={openForm}
          onClose={() => {
            setOpenForm(false);
            setSelectedExpense(null);
          }}
          onSubmit={handleFormSubmit}
          propertyId={selectedExpense?.propertyId || filters.propertyId}
          initialData={selectedExpense || undefined}
          properties={propertiesData?.data}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>מחיקת הוצאה</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את ההוצאה הזו? פעולה זו לא ניתנת לביטול.
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
