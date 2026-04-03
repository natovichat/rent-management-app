'use client';

import { useState, useMemo } from 'react';
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
  Paper,
  Stack,
  Skeleton,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { rentalAgreementsApi, paymentEventsApi, RentalAgreement, PaymentEvent, RentalPaymentStatus } from '@/lib/api/leases';

// ── Helpers ────────────────────────────────────────────────────────────────

const HEBREW_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(amount);

type PaymentStatusFilter = RentalPaymentStatus | 'NOT_PAID' | 'ALL';

interface ScheduleRow {
  id: string;
  year: number;
  month: number;
  monthLabel: string;
  expectedAmount: number;
  actualAmount: number;
  status: RentalPaymentStatus | 'NOT_PAID';
  eventId?: string;
  propertyId?: string;
}

const STATUS_LABELS: Record<string, string> = {
  PAID: 'שולם',
  CHECK_RECEIVED: 'ניתן צ׳ק',
  PENDING: 'לא שולם',
  LATE: 'איחור',
  PARTIAL: 'שולם חלקי',
  NOT_PAID: 'לא שולם',
};

const STATUS_COLORS: Record<string, 'success' | 'info' | 'error' | 'warning' | 'default'> = {
  PAID: 'success',
  CHECK_RECEIVED: 'info',
  PENDING: 'error',
  LATE: 'warning',
  PARTIAL: 'warning',
  NOT_PAID: 'error',
};

function buildSchedule(lease: RentalAgreement, events: PaymentEvent[]): ScheduleRow[] {
  if (!lease.startDate) return [];

  const start = new Date(lease.startDate);
  const end = lease.endDate ? new Date(lease.endDate) : new Date();
  const today = new Date();
  const cap = today < end ? today : end;

  // Map events by year-month key
  const eventMap = new Map<string, PaymentEvent>();
  for (const ev of events) {
    eventMap.set(`${ev.year}-${ev.month}`, ev);
  }

  const rows: ScheduleRow[] = [];
  let cur = new Date(start.getFullYear(), start.getMonth(), 1);
  const capYM = cap.getFullYear() * 12 + cap.getMonth();

  while (cur.getFullYear() * 12 + cur.getMonth() <= capYM) {
    const y = cur.getFullYear();
    const m = cur.getMonth() + 1; // 1-based
    const key = `${y}-${m}`;
    const ev = eventMap.get(key);

    rows.push({
      id: key,
      year: y,
      month: m,
      monthLabel: `${HEBREW_MONTHS[m - 1]} ${y}`,
      expectedAmount: lease.monthlyRent,
      actualAmount: ev ? ev.amountDue : 0,
      status: ev ? ev.paymentStatus : 'NOT_PAID',
      eventId: ev?.id,
      propertyId: ev?.propertyId,
    });

    cur = new Date(y, m, 1); // advance one month
  }

  return rows;
}

// ── Summary Bar ───────────────────────────────────────────────────────────

function SummaryBar({ rows }: { rows: ScheduleRow[] }) {
  const expectedTotal = rows.reduce((acc, r) => acc + r.expectedAmount, 0);
  const paidTotal = rows
    .filter((r) => r.status === 'PAID' || r.status === 'CHECK_RECEIVED')
    .reduce((acc, r) => acc + r.actualAmount, 0);
  const balance = paidTotal - expectedTotal;
  const isCredit = balance >= 0;

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={3} alignItems="center" justifyContent="flex-end" direction="row-reverse">
        <Grid item xs={12} sm={4}>
          <Stack alignItems="center" spacing={0.5}>
            <Typography variant="body2" color="text.secondary">סה״כ לתשלום</Typography>
            <Typography variant="h6" fontWeight={700}>{formatCurrency(expectedTotal)}</Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Stack alignItems="center" spacing={0.5}>
            <Typography variant="body2" color="text.secondary">שולם בפועל</Typography>
            <Typography variant="h6" fontWeight={700} color="success.main">{formatCurrency(paidTotal)}</Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Stack alignItems="center" spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              {isCredit ? 'זכות' : 'חוב'}
            </Typography>
            <Typography
              variant="h6"
              fontWeight={700}
              color={balance === 0 ? 'text.primary' : isCredit ? 'success.main' : 'error.main'}
            >
              {balance === 0 ? '—' : `${isCredit ? '+' : ''}${formatCurrency(balance)}`}
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}

// ── Main Component ────────────────────────────────────────────────────────

export default function PaymentsPage() {
  const queryClient = useQueryClient();
  const [selectedLeaseId, setSelectedLeaseId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatusFilter>('ALL');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  // Fetch all leases for the selector dropdown (no status filter — show all)
  const { data: leasesData, isLoading: leasesLoading, error: leasesError } = useQuery({
    queryKey: ['rental-agreements-all-for-payments'],
    queryFn: () => rentalAgreementsApi.getRentalAgreements(1, 200),
  });
  const allLeases: RentalAgreement[] = leasesData?.data ?? [];

  const selectedLease = useMemo(
    () => allLeases.find((l) => l.id === selectedLeaseId) ?? null,
    [allLeases, selectedLeaseId],
  );

  // Fetch payment events for selected lease
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['payment-events', selectedLeaseId],
    queryFn: () => paymentEventsApi.getByRentalAgreement(selectedLeaseId),
    enabled: !!selectedLeaseId,
  });

  const scheduleRows = useMemo(() => {
    if (!selectedLease) return [];
    return buildSchedule(selectedLease, events);
  }, [selectedLease, events]);

  const filteredRows = useMemo(() => {
    if (statusFilter === 'ALL') return scheduleRows;
    if (statusFilter === 'NOT_PAID')
      return scheduleRows.filter((r) => r.status === 'NOT_PAID' || r.status === 'PENDING' || r.status === 'LATE');
    return scheduleRows.filter((r) => r.status === statusFilter);
  }, [scheduleRows, statusFilter]);

  // Mutation for updating payment status
  const updateStatusMutation = useMutation({
    mutationFn: ({
      propertyId,
      eventId,
      status,
    }: {
      propertyId: string;
      eventId: string;
      status: RentalPaymentStatus;
    }) =>
      paymentEventsApi.updatePaymentEvent(propertyId, eventId, { paymentStatus: status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-events', selectedLeaseId] });
      queryClient.invalidateQueries({ queryKey: ['rental-agreements'] });
      setSnackbar({ open: true, message: 'הסטטוס עודכן בהצלחה', severity: 'success' });
    },
    onError: () => {
      setSnackbar({ open: true, message: 'שגיאה בעדכון הסטטוס', severity: 'error' });
    },
  });

  const columns: GridColDef<ScheduleRow>[] = [
    {
      field: 'monthLabel',
      headerName: 'חודש',
      flex: 1,
      minWidth: 130,
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'expectedAmount',
      headerName: 'סכום מבוקש',
      width: 140,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatCurrency(params.value as number),
    },
    {
      field: 'actualAmount',
      headerName: 'סכום ששולם',
      width: 140,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) =>
        (params.value as number) > 0 ? formatCurrency(params.value as number) : '—',
    },
    {
      field: 'status',
      headerName: 'סטטוס',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams<ScheduleRow, string>) => {
        const status = params.value ?? 'NOT_PAID';
        return (
          <Chip
            label={STATUS_LABELS[status] ?? status}
            color={STATUS_COLORS[status] ?? 'default'}
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'שינוי סטטוס',
      width: 180,
      align: 'right',
      headerAlign: 'right',
      sortable: false,
      renderCell: (params: GridRenderCellParams<ScheduleRow>) => {
        const row = params.row;
        if (!row.eventId || !row.propertyId) return <Typography variant="caption" color="text.disabled">ללא אירוע</Typography>;

        const currentStatus = row.status as RentalPaymentStatus;
        const options: RentalPaymentStatus[] = ['PAID', 'CHECK_RECEIVED', 'PENDING'];
        const next = options.find((s) => s !== currentStatus);
        if (!next) return null;

        return (
          <Select
            size="small"
            value={currentStatus}
            onChange={(e) => {
              updateStatusMutation.mutate({
                propertyId: row.propertyId!,
                eventId: row.eventId!,
                status: e.target.value as RentalPaymentStatus,
              });
            }}
            sx={{ fontSize: '0.75rem', height: 32, minWidth: 140 }}
            disabled={updateStatusMutation.isPending}
          >
            {options.map((s) => (
              <MenuItem key={s} value={s}>{STATUS_LABELS[s]}</MenuItem>
            ))}
          </Select>
        );
      },
    },
  ];

  const leaseLabel = (lease: RentalAgreement) => {
    const prop = typeof lease.property === 'object' && lease.property
      ? `${(lease.property as { address?: string }).address ?? ''}`
      : '';
    const tenant = typeof lease.tenant === 'object' && lease.tenant
      ? ` — ${(lease.tenant as { name?: string }).name ?? ''}`
      : '';
    return `${prop}${tenant}` || lease.id;
  };

  return (
    <Box sx={{ p: 3, direction: 'rtl' }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        תשלומי שכירות
      </Typography>

      {/* Error banner */}
      {leasesError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          שגיאה בטעינת רשימת החוזים. נסה לרענן את הדף.
        </Alert>
      )}

      {/* Filters */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center" direction="row-reverse">
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>חוזה שכירות</InputLabel>
              <Select
                value={selectedLeaseId}
                onChange={(e) => {
                  setSelectedLeaseId(e.target.value as string);
                  setStatusFilter('ALL');
                }}
                label="חוזה שכירות"
              >
                <MenuItem value="">
                  <em>בחר חוזה...</em>
                </MenuItem>
                {leasesLoading ? (
                  <MenuItem disabled>טוען...</MenuItem>
                ) : (
                  allLeases.map((l) => (
                    <MenuItem key={l.id} value={l.id}>
                      {leaseLabel(l)}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small" disabled={!selectedLeaseId}>
              <InputLabel>סטטוס תשלום</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as PaymentStatusFilter)}
                label="סטטוס תשלום"
              >
                <MenuItem value="ALL">הכל</MenuItem>
                <MenuItem value="PAID">שולם</MenuItem>
                <MenuItem value="CHECK_RECEIVED">ניתן צ׳ק</MenuItem>
                <MenuItem value="NOT_PAID">לא שולם</MenuItem>
                <MenuItem value="PARTIAL">שולם חלקי</MenuItem>
                <MenuItem value="LATE">איחור</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {selectedLease && (
            <Grid item xs={12} sm={3}>
              <Typography variant="body2" color="text.secondary" textAlign="right">
                {HEBREW_MONTHS[new Date(selectedLease.startDate).getMonth()]} {new Date(selectedLease.startDate).getFullYear()}
                {' — '}
                {HEBREW_MONTHS[new Date(selectedLease.endDate).getMonth()]} {new Date(selectedLease.endDate).getFullYear()}
                {' | '}
                {formatCurrency(selectedLease.monthlyRent)} / חודש
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Summary */}
      {selectedLease && !eventsLoading && scheduleRows.length > 0 && (
        <>
          <SummaryBar rows={scheduleRows} />
          <Divider sx={{ mb: 2 }} />
        </>
      )}

      {/* Table */}
      {!selectedLeaseId ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">בחר חוזה שכירות כדי לראות את לוח התשלומים</Typography>
        </Box>
      ) : eventsLoading ? (
        <Stack spacing={1}>
          {[...Array(6)].map((_, i) => <Skeleton key={i} variant="rectangular" height={52} />)}
        </Stack>
      ) : (
        <Box sx={{ direction: 'rtl' }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            pageSizeOptions={[12, 24, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 50 } } }}
            sx={{
              direction: 'rtl',
              '& .MuiDataGrid-columnHeaders': { backgroundColor: 'rgba(0,0,0,0.04)' },
              '& .MuiDataGrid-cell': { direction: 'rtl' },
              '& .MuiDataGrid-columnHeader': { direction: 'rtl' },
            }}
            autoHeight
            disableRowSelectionOnClick
            getRowClassName={(params) => {
              const s = params.row.status;
              if (s === 'PAID') return 'row-paid';
              if (s === 'CHECK_RECEIVED') return 'row-check';
              if (s === 'NOT_PAID' || s === 'PENDING' || s === 'LATE') return 'row-unpaid';
              return '';
            }}
          />
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
