'use client';

import { useState, useMemo, useEffect } from 'react';
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
  investmentCompaniesApi,
  InvestmentCompany,
  CreateInvestmentCompanyDto,
  InvestmentCompanyFilters,
} from '@/services/investmentCompanies';
import InvestmentCompanyForm from './InvestmentCompanyForm';
import InvestmentCompanyFilterPanel from './InvestmentCompanyFilterPanel';

const formatCurrency = (value: number | string | undefined): string => {
  if (!value) return '-';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '-';
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(numValue);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('he-IL');
};

export default function InvestmentCompanyList() {
  const queryClient = useQueryClient();
  const { selectedAccountId } = useAccount();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const [filters, setFilters] = useState<InvestmentCompanyFilters>({});
  const [openForm, setOpenForm] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<InvestmentCompany | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<InvestmentCompany | null>(null);
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
  const apiFilters: InvestmentCompanyFilters = useMemo(() => ({
    ...filters,
    ...(debouncedSearch && { search: debouncedSearch }),
  }), [filters, debouncedSearch]);

  // Fetch investment companies
  const { data, isLoading } = useQuery({
    queryKey: ['investment-companies', selectedAccountId, page, pageSize, apiFilters],
    queryFn: () => investmentCompaniesApi.getAll(page, pageSize, apiFilters),
    enabled: !!selectedAccountId,
  });


  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => investmentCompaniesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment-companies'] });
      setDeleteDialogOpen(false);
      setCompanyToDelete(null);
      setSnackbar({
        open: true,
        message: 'חברת השקעה נמחקה בהצלחה',
        severity: 'success',
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'שגיאה במחיקת חברת השקעה',
        severity: 'error',
      });
    },
  });

  const columns: GridColDef<InvestmentCompany>[] = [
    {
      field: 'name',
      headerName: 'שם',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'registrationNumber',
      headerName: 'מספר רישום',
      width: 150,
    },
    {
      field: 'country',
      headerName: 'מדינה',
      width: 120,
    },
    {
      field: 'investmentAmount',
      headerName: 'סכום השקעה',
      width: 150,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => formatCurrency(params.value),
    },
    {
      field: 'ownershipPercentage',
      headerName: 'אחוז בעלות',
      width: 120,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (value) => (value ? `${value}%` : '-'),
    },
    {
      field: 'createdAt',
      headerName: 'תאריך יצירה',
      width: 120,
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'פעולות',
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="עריכה"
          onClick={() => {
            setSelectedCompany(params.row);
            setOpenForm(true);
          }}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="מחיקה"
          onClick={() => {
            setCompanyToDelete(params.row);
            setDeleteDialogOpen(true);
          }}
        />,
      ],
    },
  ];

  const handleFormSuccess = () => {
    setOpenForm(false);
    setSelectedCompany(null);
    setSnackbar({
      open: true,
      message: selectedCompany ? 'חברת השקעה עודכנה בהצלחה' : 'חברת השקעה נוספה בהצלחה',
      severity: 'success',
    });
  };

  const handleDelete = () => {
    if (companyToDelete) {
      deleteMutation.mutate(companyToDelete.id);
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
            ניהול חברות השקעה
          </Typography>
          <Typography variant="body2" color="text.secondary">
            רשימת כל חברות ההשקעה במערכת
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedCompany(null);
            setOpenForm(true);
          }}
        >
          חברת השקעה חדשה
        </Button>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="חפש לפי שם, מספר רישום או מדינה..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
        />
      </Box>

      {/* Advanced Filters */}
      <InvestmentCompanyFilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        onClear={() => setFilters({})}
      />

      {/* DataGrid */}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={data?.data || []}
          columns={columns}
          loading={isLoading}
          sx={{
            direction: 'rtl',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
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
          setSelectedCompany(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedCompany ? 'עריכת חברת השקעה' : 'חברת השקעה חדשה'}
        </DialogTitle>
        <DialogContent>
          <InvestmentCompanyForm
            company={selectedCompany}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setOpenForm(false);
              setSelectedCompany(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>מחיקת חברת השקעה</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את חברת ההשקעה "{companyToDelete?.name}"?
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
