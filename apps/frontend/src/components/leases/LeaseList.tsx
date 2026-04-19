'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
  Stack,
  IconButton,
  Fab,
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem, GridRenderCellParams } from '@mui/x-data-grid';
import Tooltip from '@mui/material/Tooltip';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import RestoreIcon from '@mui/icons-material/RestoreFromTrash';
import { rentalAgreementsApi, RentalAgreement, RentalAgreementStatus, RentalAgreementFilters } from '@/lib/api/leases';
import { useShowDeleted } from '@/lib/hooks/useShowDeleted';
import { getUserProfile } from '@/lib/auth';
import LeaseForm from './LeaseForm';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('he-IL');

/**
 * Count full months from lease startDate until today (or endDate if past), inclusive.
 * Example: Jan 2025 → Apr 2026 = 16 months.
 */
function calcExpectedPayment(startDate: string, endDate: string, monthlyRent: number): number {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  if (start > today) return 0;
  // Cap at min(today, endDate)
  const ref = today <= end ? today : end;
  const months =
    (ref.getFullYear() - start.getFullYear()) * 12 +
    (ref.getMonth() - start.getMonth()) +
    1;
  return Math.max(0, months) * monthlyRent;
}

/** Format a paidUntilDate as "MM/YYYY" */
function formatPaidUntil(dateString?: string): string {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('he-IL', { month: '2-digit', year: 'numeric' });
}

const getStatusColor = (status: RentalAgreementStatus) => {
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

const getStatusLabel = (status: RentalAgreementStatus) => {
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

interface MobileLeaseCardProps {
  item: RentalAgreement;
  onEdit: () => void;
  onDelete: () => void;
  onEditProperty?: () => void;
}

function MobileLeaseCard({ item, onEdit, onDelete, onEditProperty }: MobileLeaseCardProps) {
  return (
    <Card sx={{ mb: 1.5, borderRadius: 2 }} variant="outlined">
      <CardContent sx={{ pb: 0 }}>
        <Stack spacing={1}>
          <Typography variant="subtitle1" fontWeight={600}>
            {item.property?.address || '-'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            שוכר: {item.tenant?.name || '-'}
          </Typography>
          <Typography variant="body2">
            שכ&quot;ד חודשי: {formatCurrency(item.monthlyRent ?? 0)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatDate(item.startDate ?? '')} – {formatDate(item.endDate ?? '')}
          </Typography>
          <Chip
            label={getStatusLabel(item.status)}
            color={getStatusColor(item.status) as any}
            size="small"
            sx={{ alignSelf: 'flex-start' }}
          />
        </Stack>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
        {onEditProperty && (
          <IconButton size="small" onClick={onEditProperty} aria-label="עריכת נכס" color="primary">
            <HomeIcon />
          </IconButton>
        )}
        <IconButton size="small" onClick={onEdit} aria-label="עריכה">
          <EditIcon />
        </IconButton>
        <IconButton size="small" onClick={onDelete} aria-label="מחיקה" color="error">
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
}

/**
 * Component for displaying and managing the list of rental agreements (leases).
 */
export default function LeaseList() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const queryClient = useQueryClient();
  const { showDeleted } = useShowDeleted();
  const [isAdmin, setIsAdmin] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<RentalAgreementStatus | ''>('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLease, setSelectedLease] = useState<RentalAgreement | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leaseToDelete, setLeaseToDelete] = useState<RentalAgreement | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const profile = getUserProfile();
    setIsAdmin(profile?.role === 'ADMIN');
  }, []);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const includeDeleted = isAdmin && showDeleted;

  const apiFilters = useMemo((): RentalAgreementFilters | undefined => {
    const f: RentalAgreementFilters = {};
    if (statusFilter) f.status = statusFilter as RentalAgreementStatus;
    if (includeDeleted) f.includeDeleted = true;
    return Object.keys(f).length > 0 ? f : undefined;
  }, [statusFilter, includeDeleted]);

  const { data, isLoading } = useQuery({
    queryKey: ['rental-agreements', page, pageSize, statusFilter, includeDeleted],
    queryFn: () => rentalAgreementsApi.getRentalAgreements(page, pageSize, apiFilters),
  });

  const leases = data?.data || [];

  const deleteMutation = useMutation({
    mutationFn: rentalAgreementsApi.deleteRentalAgreement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rental-agreements'] });
      setDeleteDialogOpen(false);
      setLeaseToDelete(null);
      setSnackbar({ open: true, message: 'חוזה נמחק בהצלחה', severity: 'success' });
    },
    onError: () => {
      setSnackbar({ open: true, message: 'שגיאה במחיקת חוזה', severity: 'error' });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: rentalAgreementsApi.restoreRentalAgreement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rental-agreements'] });
      setSnackbar({ open: true, message: 'חוזה שוחזר בהצלחה', severity: 'success' });
    },
    onError: () => {
      setSnackbar({ open: true, message: 'שגיאה בשחזור חוזה', severity: 'error' });
    },
  });

  const columns: GridColDef<RentalAgreement>[] = [
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
      field: 'tenant',
      headerName: 'שוכר',
      flex: 1,
      minWidth: 150,
      align: 'right',
      headerAlign: 'right',
      valueGetter: (params) => params.row.tenant?.name || '-',
    },
    {
      field: 'monthlyRent',
      headerName: 'שכ"ד חודשי',
      width: 140,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatCurrency(params.value ?? 0),
    },
    {
      field: 'startDate',
      headerName: 'תאריך התחלה',
      width: 130,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatDate(params.value ?? ''),
    },
    {
      field: 'endDate',
      headerName: 'תאריך סיום',
      width: 130,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatDate(params.value ?? ''),
    },
    {
      field: 'expectedPayment',
      headerName: 'חייב לשלם',
      width: 140,
      align: 'right',
      headerAlign: 'right',
      description: 'סה"כ תשלומים צפויים מתחילת החוזה ועד היום',
      valueGetter: (params) =>
        calcExpectedPayment(
          params.row.startDate ?? '',
          params.row.endDate ?? '',
          params.row.monthlyRent ?? 0,
        ),
      valueFormatter: (params) =>
        params.value > 0 ? formatCurrency(params.value) : '—',
    },
    {
      field: 'paidAmount',
      headerName: 'שילם בפועל',
      width: 140,
      align: 'right',
      headerAlign: 'right',
      description: 'סה"כ תשלומים שהתקבלו (אירועי תשלום בסטטוס שולם)',
      valueGetter: (params) => params.row.paidAmount ?? 0,
      valueFormatter: (params) =>
        params.value > 0 ? formatCurrency(params.value) : '—',
    },
    {
      field: 'paidUntilDate',
      headerName: 'שילם עד חודש',
      width: 130,
      align: 'right',
      headerAlign: 'right',
      description: 'החודש האחרון (כולל) שעבורו התקבל תשלום',
      valueGetter: (params) => params.row.paidUntilDate,
      valueFormatter: (params) => formatPaidUntil(params.value),
    },
    {
      field: 'balance',
      headerName: 'חוב / זכות',
      width: 140,
      align: 'right',
      headerAlign: 'right',
      description: 'הפרש: כמה ששולם פחות כמה שהיה צריך לשלם (חיובי = זכות, שלילי = חוב)',
      valueGetter: (params) => {
        const expected = calcExpectedPayment(
          params.row.startDate ?? '',
          params.row.endDate ?? '',
          params.row.monthlyRent ?? 0,
        );
        return (params.row.paidAmount ?? 0) - expected;
      },
      renderCell: (params: GridRenderCellParams<RentalAgreement, number>) => {
        const val = params.value ?? 0;
        const isCredit = val >= 0;
        const label = val === 0 ? '—' : `${isCredit ? '+' : ''}${formatCurrency(val)}`;
        return (
          <Tooltip title={isCredit ? 'זכות (שולם יותר מהנדרש)' : 'חוב (טרם שולם)'}>
            <Box
              component="span"
              sx={{
                color: val === 0 ? 'text.secondary' : isCredit ? 'success.main' : 'error.main',
                fontWeight: val !== 0 ? 600 : 400,
              }}
            >
              {label}
            </Box>
          </Tooltip>
        );
      },
    },
    {
      field: 'status',
      headerName: 'סטטוס',
      width: 120,
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
      width: 200,
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
            key="edit-property"
            icon={<HomeIcon />}
            label="עריכת נכס"
            onClick={() => router.push(`/properties/${params.row.propertyId}?edit=1`)}
          />,
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="עריכה"
            onClick={() => {
              setSelectedLease(params.row);
              setOpenDialog(true);
            }}
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
      },
    },
  ];

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedLease(null);
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['rental-agreements'] });
    handleCloseDialog();
    setSnackbar({ open: true, message: 'חוזה נשמר בהצלחה', severity: 'success' });
  };

  const handleDelete = () => {
    if (leaseToDelete) {
      deleteMutation.mutate(leaseToDelete.id);
    }
  };

  return (
    <Box sx={{ direction: 'rtl' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>סנן לפי סטטוס</InputLabel>
            <Select
              value={statusFilter}
              label="סנן לפי סטטוס"
              onChange={(e) => setStatusFilter(e.target.value as RentalAgreementStatus | '')}
            >
              <MenuItem value="">הכל</MenuItem>
              <MenuItem value="ACTIVE">פעיל</MenuItem>
              <MenuItem value="FUTURE">עתידי</MenuItem>
              <MenuItem value="EXPIRED">פג תוקף</MenuItem>
              <MenuItem value="TERMINATED">בוטל</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedLease(null);
              setOpenDialog(true);
            }}
          >
            הוסף חוזה
          </Button>
        </Box>
      </Box>

      <Box sx={{ height: isMobile ? 'auto' : 600, width: '100%' }}>
        {isMobile ? (
          <Box>
            {isLoading ? (
              <Typography color="text.secondary" textAlign="center" py={4}>
                טוען...
              </Typography>
            ) : (
              <>
                {(data?.data || []).map((item) => (
                  <MobileLeaseCard
                key={item.id}
                item={item}
                onEdit={() => {
                  setSelectedLease(item);
                  setOpenDialog(true);
                }}
                onDelete={() => {
                  setLeaseToDelete(item);
                  setDeleteDialogOpen(true);
                }}
                onEditProperty={() => router.push(`/properties/${item.propertyId}?edit=1`)}
              />
                ))}
                {(!data?.data || data.data.length === 0) && (
                  <Typography color="text.secondary" textAlign="center" py={4}>
                    אין נתונים להצגה
                  </Typography>
                )}
              </>
            )}
          </Box>
        ) : (
          <DataGrid
            rows={leases}
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
              '& .row-deleted': {
                color: 'text.disabled',
                textDecoration: 'line-through',
                bgcolor: 'action.hover',
                opacity: 0.6,
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
            getRowClassName={(params) => params.row.deletedAt ? 'row-deleted' : ''}
          />
        )}
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedLease ? 'עריכת חוזה' : 'חוזה חדש'}</DialogTitle>
        <DialogContent>
          <LeaseForm
            lease={selectedLease}
            onSuccess={handleFormSuccess}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>מחיקת חוזה</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את החוזה?
            {leaseToDelete && (
              <>
                <br />
                <strong>{leaseToDelete.property?.address}</strong> - {leaseToDelete.tenant?.name}
              </>
            )}
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
          aria-label="הוסף חוזה"
          sx={{ position: 'fixed', bottom: 80, left: 16, zIndex: 1200 }}
          onClick={() => {
            setSelectedLease(null);
            setOpenDialog(true);
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
}
