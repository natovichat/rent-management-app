'use client';

import { useState, useMemo, useCallback } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowSelectionModel,
} from '@mui/x-data-grid';
import {
  rentalAgreementsApi,
  paymentEventsApi,
  RentalAgreement,
  PaymentEvent,
  RentalPaymentStatus,
} from '@/lib/api/leases';
import { propertyEventsApi } from '@/lib/api/property-events';

// ── Helpers ────────────────────────────────────────────────────────────────

const HEBREW_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(amount);

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

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
  rentalAgreementId?: string;
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
      propertyId: ev?.propertyId || lease.propertyId,
      rentalAgreementId: lease.id,
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

  // Date range filter state
  const [fromYear, setFromYear] = useState<number | ''>('');
  const [fromMonth, setFromMonth] = useState<number | ''>('');
  const [toYear, setToYear] = useState<number | ''>('');
  const [toMonth, setToMonth] = useState<number | ''>('');

  // Row selection state
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([]);

  // Bulk action state
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [bulkTargetStatus, setBulkTargetStatus] = useState<RentalPaymentStatus>('PAID');

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
    let rows = scheduleRows;

    // Status filter
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'NOT_PAID') {
        rows = rows.filter((r) => r.status === 'NOT_PAID' || r.status === 'PENDING' || r.status === 'LATE');
      } else {
        rows = rows.filter((r) => r.status === statusFilter);
      }
    }

    // Date range filter
    if (fromYear !== '' && fromMonth !== '') {
      const fromYM = (fromYear as number) * 12 + (fromMonth as number);
      rows = rows.filter((r) => r.year * 12 + r.month >= fromYM);
    }
    if (toYear !== '' && toMonth !== '') {
      const toYM = (toYear as number) * 12 + (toMonth as number);
      rows = rows.filter((r) => r.year * 12 + r.month <= toYM);
    }

    return rows;
  }, [scheduleRows, statusFilter, fromYear, fromMonth, toYear, toMonth]);

  // Mutation for updating payment status (single row)
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

  // Bulk status update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ rows, newStatus }: { rows: ScheduleRow[]; newStatus: RentalPaymentStatus }) => {
      const today = new Date().toISOString().split('T')[0];
      const results = await Promise.allSettled(
        rows.map(async (row) => {
          const paymentDate = newStatus === 'PAID' ? today : undefined;
          const propertyId = row.propertyId!;

          if (row.eventId) {
            // Update existing event
            return paymentEventsApi.updatePaymentEvent(propertyId, row.eventId, {
              paymentStatus: newStatus,
              ...(paymentDate ? { paymentDate } : {}),
            });
          } else {
            // Create new rent collection event
            return propertyEventsApi.createRentalPaymentRequestEvent(propertyId, {
              rentalAgreementId: row.rentalAgreementId!,
              month: row.month,
              year: row.year,
              amountDue: row.expectedAmount,
              paymentStatus: newStatus,
              ...(paymentDate ? { paymentDate } : {}),
            } as any);
          }
        }),
      );

      const failed = results.filter((r) => r.status === 'rejected').length;
      const succeeded = results.filter((r) => r.status === 'fulfilled').length;
      return { succeeded, failed };
    },
    onSuccess: ({ succeeded, failed }) => {
      queryClient.invalidateQueries({ queryKey: ['payment-events', selectedLeaseId] });
      queryClient.invalidateQueries({ queryKey: ['rental-agreements'] });
      setRowSelectionModel([]);
      setBulkActionDialogOpen(false);
      if (failed > 0) {
        setSnackbar({
          open: true,
          message: `עודכנו ${succeeded} רשומות בהצלחה, ${failed} נכשלו`,
          severity: 'error',
        });
      } else {
        setSnackbar({
          open: true,
          message: `${succeeded} רשומות עודכנו בהצלחה`,
          severity: 'success',
        });
      }
    },
    onError: () => {
      setSnackbar({ open: true, message: 'שגיאה בעדכון הרשומות', severity: 'error' });
    },
  });

  const handleBulkUpdate = useCallback(() => {
    const selectedRows = filteredRows.filter((r) => rowSelectionModel.includes(r.id));
    bulkUpdateMutation.mutate({ rows: selectedRows, newStatus: bulkTargetStatus });
  }, [filteredRows, rowSelectionModel, bulkTargetStatus, bulkUpdateMutation]);

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

        const currentStatus = (row.status === 'NOT_PAID' ? 'PENDING' : row.status) as RentalPaymentStatus;
        const options: RentalPaymentStatus[] = ['PAID', 'CHECK_RECEIVED', 'PENDING', 'LATE', 'PARTIAL'];

        return (
          <Select
            size="small"
            value={currentStatus}
            onChange={(e) => {
              const newStatus = e.target.value as RentalPaymentStatus;
              if (row.eventId && row.propertyId) {
                updateStatusMutation.mutate({
                  propertyId: row.propertyId,
                  eventId: row.eventId,
                  status: newStatus,
                });
              } else if (row.propertyId && row.rentalAgreementId) {
                // Create new event with selected status
                const today = new Date().toISOString().split('T')[0];
                propertyEventsApi.createRentalPaymentRequestEvent(row.propertyId, {
                  rentalAgreementId: row.rentalAgreementId,
                  month: row.month,
                  year: row.year,
                  amountDue: row.expectedAmount,
                  paymentStatus: newStatus,
                  ...(newStatus === 'PAID' ? { paymentDate: today } : {}),
                } as any).then(() => {
                  queryClient.invalidateQueries({ queryKey: ['payment-events', selectedLeaseId] });
                  setSnackbar({ open: true, message: 'אירוע נוצר והסטטוס עודכן', severity: 'success' });
                }).catch(() => {
                  setSnackbar({ open: true, message: 'שגיאה ביצירת האירוע', severity: 'error' });
                });
              }
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

  const selectedRowCount = rowSelectionModel.length;

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
          {/* Lease selector */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>חוזה שכירות</InputLabel>
              <Select
                value={selectedLeaseId}
                onChange={(e) => {
                  setSelectedLeaseId(e.target.value as string);
                  setStatusFilter('ALL');
                  setRowSelectionModel([]);
                  setFromYear('');
                  setFromMonth('');
                  setToYear('');
                  setToMonth('');
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

          {/* Status filter */}
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

        {/* Date range filter */}
        {selectedLeaseId && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              סינון לפי טווח תאריכים
            </Typography>
            <Grid container spacing={1.5} alignItems="center" direction="row-reverse">
              <Grid item xs={6} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>משנה</InputLabel>
                  <Select
                    value={fromYear}
                    onChange={(e) => setFromYear(e.target.value as number | '')}
                    label="משנה"
                  >
                    <MenuItem value=""><em>ללא</em></MenuItem>
                    {YEAR_OPTIONS.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>מחודש</InputLabel>
                  <Select
                    value={fromMonth}
                    onChange={(e) => setFromMonth(e.target.value as number | '')}
                    label="מחודש"
                  >
                    <MenuItem value=""><em>ללא</em></MenuItem>
                    {HEBREW_MONTHS.map((m, i) => <MenuItem key={i + 1} value={i + 1}>{m}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>עד שנה</InputLabel>
                  <Select
                    value={toYear}
                    onChange={(e) => setToYear(e.target.value as number | '')}
                    label="עד שנה"
                  >
                    <MenuItem value=""><em>ללא</em></MenuItem>
                    {YEAR_OPTIONS.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>עד חודש</InputLabel>
                  <Select
                    value={toMonth}
                    onChange={(e) => setToMonth(e.target.value as number | '')}
                    label="עד חודש"
                  >
                    <MenuItem value=""><em>ללא</em></MenuItem>
                    {HEBREW_MONTHS.map((m, i) => <MenuItem key={i + 1} value={i + 1}>{m}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Summary */}
      {selectedLease && !eventsLoading && scheduleRows.length > 0 && (
        <>
          <SummaryBar rows={scheduleRows} />
          <Divider sx={{ mb: 2 }} />
        </>
      )}

      {/* Bulk action bar */}
      {selectedRowCount > 0 && (
        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            direction: 'rtl',
            backgroundColor: 'primary.50',
            borderColor: 'primary.main',
          }}
        >
          <Typography variant="body2" fontWeight={600}>
            {selectedRowCount} שורות נבחרו
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="outlined"
              size="small"
              onClick={() => setRowSelectionModel([])}
            >
              בטל בחירה
            </Button>
            <Tooltip title="עדכן סטטוס לכל השורות שנבחרו">
              <Button
                variant="contained"
                size="small"
                onClick={() => setBulkActionDialogOpen(true)}
              >
                עדכן סטטוס ({selectedRowCount})
              </Button>
            </Tooltip>
          </Stack>
        </Paper>
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
            checkboxSelection
            rowSelectionModel={rowSelectionModel}
            onRowSelectionModelChange={(newModel) => setRowSelectionModel(newModel)}
            sx={{
              direction: 'rtl',
              '& .MuiDataGrid-columnHeaders': { backgroundColor: 'rgba(0,0,0,0.04)' },
              '& .MuiDataGrid-cell': { direction: 'rtl' },
              '& .MuiDataGrid-columnHeader': { direction: 'rtl' },
            }}
            autoHeight
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

      {/* Bulk status update dialog */}
      <Dialog
        open={bulkActionDialogOpen}
        onClose={() => setBulkActionDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>עדכון סטטוס ל-{selectedRowCount} רשומות</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" mb={2}>
              בחר את הסטטוס החדש עבור כל השורות שנבחרו.
              {bulkTargetStatus === 'PAID' && (
                <Box component="span" sx={{ display: 'block', mt: 0.5, color: 'success.main', fontWeight: 600 }}>
                  תאריך התשלום בפועל יוגדר להיום אוטומטית.
                </Box>
              )}
              {'\n'}רשומות ללא אירוע קיים — ייווצר אירוע גבייה חדש עם סכום החוזה.
            </Typography>
            <FormControl fullWidth>
              <InputLabel>סטטוס חדש</InputLabel>
              <Select
                value={bulkTargetStatus}
                onChange={(e) => setBulkTargetStatus(e.target.value as RentalPaymentStatus)}
                label="סטטוס חדש"
              >
                <MenuItem value="PAID">{STATUS_LABELS.PAID}</MenuItem>
                <MenuItem value="CHECK_RECEIVED">{STATUS_LABELS.CHECK_RECEIVED}</MenuItem>
                <MenuItem value="PENDING">{STATUS_LABELS.PENDING}</MenuItem>
                <MenuItem value="LATE">{STATUS_LABELS.LATE}</MenuItem>
                <MenuItem value="PARTIAL">{STATUS_LABELS.PARTIAL}</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkActionDialogOpen(false)} disabled={bulkUpdateMutation.isPending}>
            ביטול
          </Button>
          <Button
            variant="contained"
            onClick={handleBulkUpdate}
            disabled={bulkUpdateMutation.isPending}
            startIcon={bulkUpdateMutation.isPending ? <CircularProgress size={16} /> : null}
          >
            {bulkUpdateMutation.isPending ? 'מעדכן...' : 'עדכן'}
          </Button>
        </DialogActions>
      </Dialog>

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
