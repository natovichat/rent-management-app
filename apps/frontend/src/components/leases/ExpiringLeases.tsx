'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
  Tooltip,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EventIcon from '@mui/icons-material/Event';
import { rentalAgreementsApi, RentalAgreement, RentalAgreementStatus, RenewalStatus } from '@/lib/api/leases';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('he-IL');

const getDaysUntilExpiry = (endDate: string): number => {
  const end = new Date(endDate);
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

const getExpiryUrgency = (days: number): 'error' | 'warning' | 'info' => {
  if (days <= 0) return 'error';   // already expired
  if (days <= 30) return 'error';
  if (days <= 60) return 'warning';
  return 'info';
};

const STATUS_LABELS: Record<RentalAgreementStatus, string> = {
  ACTIVE: 'פעיל',
  FUTURE: 'עתידי',
  EXPIRED: 'פג תוקף',
  TERMINATED: 'בוטל',
};

const STATUS_COLORS: Record<RentalAgreementStatus, 'success' | 'info' | 'error' | 'default'> = {
  ACTIVE: 'success',
  FUTURE: 'info',
  EXPIRED: 'error',
  TERMINATED: 'default',
};

const RENEWAL_STATUS_LABELS: Record<RenewalStatus, string> = {
  PENDING: 'ממתין',
  IN_PROGRESS: 'בתהליך',
  RENEWED: 'חודש',
  NOT_RENEWING: 'לא מחדש',
};

const RENEWAL_STATUS_COLORS: Record<RenewalStatus, 'default' | 'warning' | 'success' | 'error'> = {
  PENDING: 'default',
  IN_PROGRESS: 'warning',
  RENEWED: 'success',
  NOT_RENEWING: 'error',
};

const MONTHS_OPTIONS = [
  { value: 1, label: 'בחודש הקרוב' },
  { value: 3, label: 'ב-3 חודשים' },
  { value: 6, label: 'ב-6 חודשים' },
];

interface MobileExpiringCardProps {
  item: RentalAgreement;
  onRenewalStatusChange: (id: string, status: RenewalStatus) => void;
  isUpdating: boolean;
}

function MobileExpiringCard({ item, onRenewalStatusChange, isUpdating }: MobileExpiringCardProps) {
  const days = getDaysUntilExpiry(item.endDate);
  const urgency = getExpiryUrgency(days);

  return (
    <Card
      sx={{ mb: 1.5, borderRadius: 2, borderLeft: 4, borderColor: `${urgency}.main` }}
      variant="outlined"
    >
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="subtitle1" fontWeight={600}>
            {item.property?.address || '-'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            שוכר: {item.tenant?.name || '-'}
          </Typography>
          <Typography variant="body2">
            שכ&quot;ד: {formatCurrency(item.monthlyRent ?? 0)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={STATUS_LABELS[item.status] ?? item.status}
              color={STATUS_COLORS[item.status] ?? 'default'}
              size="small"
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <EventIcon fontSize="small" color={urgency} />
              <Typography variant="body2" color={`${urgency}.main`} fontWeight={600}>
                {formatDate(item.endDate)}
                {days < 0 ? ` (פג לפני ${Math.abs(days)} ימים)` : ` (${days} ימים)`}
              </Typography>
            </Box>
          </Box>
          <FormControl size="small" fullWidth>
            <InputLabel>סטטוס חידוש</InputLabel>
            <Select
              value={item.renewalStatus}
              label="סטטוס חידוש"
              disabled={isUpdating}
              onChange={(e) => onRenewalStatusChange(item.id, e.target.value as RenewalStatus)}
            >
              {(Object.keys(RENEWAL_STATUS_LABELS) as RenewalStatus[]).map((s) => (
                <MenuItem key={s} value={s}>
                  {RENEWAL_STATUS_LABELS[s]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </CardContent>
    </Card>
  );
}

/**
 * Displays leases expiring within a configurable number of months,
 * with inline renewal status management.
 */
export default function ExpiringLeases() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const queryClient = useQueryClient();
  const [months, setMonths] = useState(3);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const { data: leases = [], isLoading } = useQuery({
    queryKey: ['expiring-leases', months],
    queryFn: () => rentalAgreementsApi.getExpiringAgreements(months),
  });

  const renewalMutation = useMutation({
    mutationFn: ({ id, renewalStatus }: { id: string; renewalStatus: RenewalStatus }) =>
      rentalAgreementsApi.updateRenewalStatus(id, renewalStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expiring-leases'] });
      queryClient.invalidateQueries({ queryKey: ['rental-agreements'] });
      setSnackbar({ open: true, message: 'סטטוס חידוש עודכן', severity: 'success' });
    },
    onError: () => {
      setSnackbar({ open: true, message: 'שגיאה בעדכון סטטוס', severity: 'error' });
    },
  });

  const handleRenewalStatusChange = (id: string, renewalStatus: RenewalStatus) => {
    renewalMutation.mutate({ id, renewalStatus });
  };

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
      field: 'endDate',
      headerName: 'תאריך סיום',
      width: 130,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatDate(params.value ?? ''),
    },
    {
      field: 'status',
      headerName: 'סטטוס',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const status = params.value as RentalAgreementStatus;
        return (
          <Chip
            label={STATUS_LABELS[status] ?? status}
            color={STATUS_COLORS[status] ?? 'default'}
            size="small"
          />
        );
      },
    },
    {
      field: 'daysLeft',
      headerName: 'ימים לסיום',
      width: 140,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (params) => getDaysUntilExpiry(params.row.endDate),
      renderCell: (params) => {
        const days = params.value as number;
        const urgency = getExpiryUrgency(days);
        const label = days < 0 ? `פג לפני ${Math.abs(days)} ימים` : `${days} ימים`;
        const tooltip = days < 0 ? 'כבר פג תוקף!' : days <= 30 ? 'דחוף!' : days <= 60 ? 'שים לב' : '';
        return (
          <Tooltip title={tooltip}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {urgency !== 'info' && <WarningAmberIcon fontSize="small" color={urgency} />}
              <Typography
                variant="body2"
                color={`${urgency}.main`}
                fontWeight={urgency !== 'info' ? 700 : 400}
              >
                {label}
              </Typography>
            </Box>
          </Tooltip>
        );
      },
    },
    {
      field: 'renewalStatus',
      headerName: 'סטטוס חידוש',
      width: 170,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const status = params.value as RenewalStatus;
        return (
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={status}
              disabled={renewalMutation.isPending}
              onChange={(e) =>
                handleRenewalStatusChange(params.row.id, e.target.value as RenewalStatus)
              }
              renderValue={(val) => (
                <Chip
                  label={RENEWAL_STATUS_LABELS[val as RenewalStatus]}
                  color={RENEWAL_STATUS_COLORS[val as RenewalStatus]}
                  size="small"
                />
              )}
              sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
            >
              {(Object.keys(RENEWAL_STATUS_LABELS) as RenewalStatus[]).map((s) => (
                <MenuItem key={s} value={s}>
                  <Chip
                    label={RENEWAL_STATUS_LABELS[s]}
                    color={RENEWAL_STATUS_COLORS[s]}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      },
    },
  ];

  const urgentCount = leases.filter((l) => getDaysUntilExpiry(l.endDate) <= 30).length;

  return (
    <Box sx={{ direction: 'rtl' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>טווח זמן</InputLabel>
            <Select
              value={months}
              label="טווח זמן"
              onChange={(e) => setMonths(Number(e.target.value))}
            >
              {MONTHS_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {urgentCount > 0 && (
            <Chip
              icon={<WarningAmberIcon />}
              label={`${urgentCount} חוזים דחופים (עד 30 יום)`}
              color="error"
              variant="outlined"
            />
          )}
        </Box>

        <Typography variant="body2" color="text.secondary">
          {leases.length} חוזים עומדים לפקוע
        </Typography>
      </Box>

      {leases.length === 0 && !isLoading && (
        <Alert severity="success" sx={{ mb: 2 }}>
          אין חוזים שעומדים לפקוע בטווח הזמן שנבחר
        </Alert>
      )}

      <Box sx={{ height: isMobile ? 'auto' : 550, width: '100%' }}>
        {isMobile ? (
          <Box>
            {isLoading ? (
              <Typography color="text.secondary" textAlign="center" py={4}>
                טוען...
              </Typography>
            ) : (
              leases.map((item) => (
                <MobileExpiringCard
                  key={item.id}
                  item={item}
                  onRenewalStatusChange={handleRenewalStatusChange}
                  isUpdating={renewalMutation.isPending}
                />
              ))
            )}
          </Box>
        ) : (
          <DataGrid
            rows={leases}
            columns={columns}
            loading={isLoading}
            getRowId={(row) => row.id}
            rowHeight={60}
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
          />
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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
