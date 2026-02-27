'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
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
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Snackbar,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import {
  bankAccountsApi,
  BankAccount,
} from '@/lib/api/bank-accounts';
import BankAccountForm from './BankAccountForm';

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  CHECKING: 'עו"ש',
  SAVINGS: 'חסכון',
  BUSINESS: 'עסקי',
  PERSONAL_CHECKING: 'עו"ש אישי',
  PERSONAL_SAVINGS: 'חסכון אישי',
  TRUST_ACCOUNT: 'חשבון נאמנות',
  MORTGAGE_ACCOUNT: 'חשבון משכנתא',
};

const MOBILE_ACCOUNT_TYPE_LABELS: Record<string, string> = {
  TRUST_ACCOUNT: 'נאמנות',
  PERSONAL_CHECKING: 'עו"ש',
  PERSONAL_SAVINGS: 'חסכון',
  BUSINESS: 'עסקי',
  CHECKING: 'עו"ש',
  SAVINGS: 'חסכון',
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('he-IL');
};

function MobileBankAccountCard({
  account,
  onEdit,
  onDelete,
}: {
  account: BankAccount;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const accountTypeLabel =
    MOBILE_ACCOUNT_TYPE_LABELS[account.accountType] ??
    ACCOUNT_TYPE_LABELS[account.accountType] ??
    account.accountType;

  return (
    <Card sx={{ mb: 1.5, borderRadius: 2 }} variant="outlined">
      <CardContent sx={{ pb: 0 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          {account.bankName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {account.accountNumber}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {accountTypeLabel}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {account.accountHolder ?? '—'}
        </Typography>
        <Chip
          label={account.isActive ? 'פעיל' : 'לא פעיל'}
          color={account.isActive ? 'success' : 'default'}
          size="small"
          sx={{ mt: 0.5 }}
        />
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

export default function BankAccountList() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const [activeOnly, setActiveOnly] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<BankAccount | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Fetch bank accounts
  const { data, isLoading } = useQuery({
    queryKey: ['bank-accounts', activeOnly],
    queryFn: () => bankAccountsApi.getBankAccounts(1, 100, activeOnly ? true : undefined),
  });

  const allAccounts = data?.data || [];

  // Filter accounts by search
  const filteredAccounts = allAccounts.filter((account) => {
    if (!debouncedSearch) return true;
    const searchLower = debouncedSearch.toLowerCase();
    return (
      account.bankName.toLowerCase().includes(searchLower) ||
      account.accountNumber.toLowerCase().includes(searchLower) ||
      account.branchNumber?.toLowerCase().includes(searchLower) ||
      account.accountHolder?.toLowerCase().includes(searchLower)
    );
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => bankAccountsApi.deleteBankAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
      setSnackbar({
        open: true,
        message: 'חשבון בנק נמחק בהצלחה',
        severity: 'success',
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'שגיאה במחיקת חשבון בנק',
        severity: 'error',
      });
    },
  });

  // Activate/Deactivate mutation (via update)
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      bankAccountsApi.updateBankAccount(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      setSnackbar({
        open: true,
        message: 'סטטוס חשבון עודכן בהצלחה',
        severity: 'success',
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'שגיאה בעדכון סטטוס',
        severity: 'error',
      });
    },
  });

  const columns: GridColDef<BankAccount>[] = [
    {
      field: 'bankName',
      headerName: 'שם בנק',
      flex: 1,
      minWidth: 150,
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'branchNumber',
      headerName: 'מספר סניף',
      width: 120,
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'accountNumber',
      headerName: 'מספר חשבון',
      flex: 1,
      minWidth: 150,
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'accountType',
      headerName: 'סוג',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={ACCOUNT_TYPE_LABELS[params.value] || params.value}
          size="small"
        />
      ),
    },
    {
      field: 'accountHolder',
      headerName: 'בעל חשבון',
      flex: 1,
      minWidth: 150,
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'isActive',
      headerName: 'סטטוס',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value ? 'פעיל' : 'לא פעיל'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      ),
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
      width: 200,
      align: 'left',
      headerAlign: 'left',
      getActions: (params) => [
        <GridActionsCellItem
          key="toggle"
          icon={<EditIcon />}
          label={params.row.isActive ? 'השבת' : 'הפעל'}
          onClick={() => {
            toggleActiveMutation.mutate({
              id: params.row.id,
              isActive: !params.row.isActive,
            });
          }}
        />,
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="עריכה"
          onClick={() => {
            setSelectedAccount(params.row);
            setOpenForm(true);
          }}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="מחיקה"
          onClick={() => {
            setAccountToDelete(params.row);
            setDeleteDialogOpen(true);
          }}
        />,
      ],
    },
  ];

  const handleFormSuccess = (createdAccount?: BankAccount) => {
    setOpenForm(false);
    setSelectedAccount(null);
    setSnackbar({
      open: true,
      message: selectedAccount ? 'חשבון בנק עודכן בהצלחה' : 'חשבון בנק נוסף בהצלחה',
      severity: 'success',
    });
  };

  const handleDelete = () => {
    if (accountToDelete) {
      deleteMutation.mutate(accountToDelete.id);
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
            ניהול חשבונות בנק
          </Typography>
          <Typography variant="body2" color="text.secondary">
            רשימת כל חשבונות הבנק במערכת
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedAccount(null);
            setOpenForm(true);
          }}
        >
          חשבון בנק חדש
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          fullWidth
          placeholder="חפש לפי שם בנק, מספר חשבון, סניף או בעל חשבון..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ maxWidth: 400 }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
            />
          }
          label="רק פעילים"
        />
      </Box>

      {/* DataGrid or Mobile Card List */}
      {isMobile ? (
        <Box>
          {isLoading ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">טוען...</Typography>
            </Box>
          ) : filteredAccounts.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              אין חשבונות בנק
            </Typography>
          ) : (
            filteredAccounts.map((account) => (
              <MobileBankAccountCard
                key={account.id}
                account={account}
                onEdit={() => {
                  setSelectedAccount(account);
                  setOpenForm(true);
                }}
                onDelete={() => {
                  setAccountToDelete(account);
                  setDeleteDialogOpen(true);
                }}
              />
            ))
          )}
        </Box>
      ) : (
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredAccounts}
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
            initialState={{
              pagination: {
                paginationModel: { pageSize: 25 },
              },
            }}
            pageSizeOptions={[10, 25, 50, 100]}
            getRowId={(row) => row.id}
          />
        </Box>
      )}

      {/* Create/Edit Form Dialog */}
      <Dialog
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setSelectedAccount(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedAccount ? 'עריכת חשבון בנק' : 'חשבון בנק חדש'}
        </DialogTitle>
        <DialogContent>
          <BankAccountForm
            account={selectedAccount}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setOpenForm(false);
              setSelectedAccount(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>מחיקת חשבון בנק</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את חשבון הבנק "{accountToDelete?.bankName} - {accountToDelete?.accountNumber}"?
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

      {isMobile && (
        <Fab
          color="primary"
          aria-label="הוסף חשבון בנק"
          sx={{ position: 'fixed', bottom: 80, left: 16, zIndex: 1200 }}
          onClick={() => {
            setSelectedAccount(null);
            setOpenForm(true);
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
}
