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
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  TextField,
  InputAdornment,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import {
  ownerPaymentsApi,
  OwnerPayment,
  OwnerPaymentStatus,
  UpdateOwnerPaymentDto,
  CreateOwnerPaymentDto,
} from '@/lib/api/owner-payments';
import { rentalAgreementsApi, RentalAgreement } from '@/lib/api/leases';
import { ownershipsApi } from '@/lib/api/ownerships';

// ── Helpers ────────────────────────────────────────────────────────────────

const HEBREW_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(amount);

const formatPercent = (pct: number) =>
  `${Number(pct).toFixed(1)}%`;

const STATUS_LABELS: Record<string, string> = {
  PAID: 'שולם',
  PENDING: 'ממתין',
  PARTIAL: 'שולם חלקי',
};

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  PAID: 'success',
  PENDING: 'error',
  PARTIAL: 'warning',
};

const monthLabel = (year: number, month: number) =>
  `${HEBREW_MONTHS[month - 1]} ${year}`;

// ── Summary Cards ──────────────────────────────────────────────────────────

function SummaryCards({ rows }: { rows: OwnerPayment[] }) {
  const theme = useTheme();
  const totalDue = rows.reduce((acc, r) => acc + r.amountDue, 0);
  const totalPaid = rows.reduce((acc, r) => acc + r.amountPaid, 0);
  const paidCount = rows.filter((r) => r.status === 'PAID').length;
  const pendingCount = rows.filter((r) => r.status !== 'PAID').length;

  const cards = [
    { label: 'סה״כ לתשלום לבעלים', value: formatCurrency(totalDue), color: theme.palette.text.primary },
    { label: 'שולם לבעלים', value: formatCurrency(totalPaid), color: theme.palette.success.main },
    { label: 'יתרה', value: formatCurrency(totalDue - totalPaid), color: totalDue - totalPaid > 0 ? theme.palette.error.main : theme.palette.success.main },
    { label: 'חודשים ששולמו', value: `${paidCount}`, color: theme.palette.success.main },
    { label: 'ממתינים לתשלום', value: `${pendingCount}`, color: pendingCount > 0 ? theme.palette.error.main : theme.palette.text.secondary },
  ];

  return (
    <Grid container spacing={1.5} sx={{ mb: 2 }} direction="row-reverse">
      {cards.map((c) => (
        <Grid item xs={6} sm={4} md={2.4} key={c.label}>
          <Card variant="outlined" sx={{ textAlign: 'center', py: 1 }}>
            <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
              <Typography variant="caption" color="text.secondary" display="block">
                {c.label}
              </Typography>
              <Typography variant="h6" fontWeight={700} color={c.color} fontSize="1rem">
                {c.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

// ── Mobile Card Row ────────────────────────────────────────────────────────

interface MobileCardProps {
  row: OwnerPayment;
  onStatusChange: (row: OwnerPayment, status: OwnerPaymentStatus) => void;
  isUpdating: boolean;
}

function MobilePaymentCard({ row, onStatusChange, isUpdating }: MobileCardProps) {
  return (
    <Card variant="outlined" sx={{ mb: 1, direction: 'rtl' }}>
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
          <Typography variant="body2" fontWeight={600}>
            {monthLabel(row.year, row.month)}
          </Typography>
          <Chip
            label={STATUS_LABELS[row.status] ?? row.status}
            color={STATUS_COLORS[row.status] ?? 'default'}
            size="small"
            variant="outlined"
          />
        </Stack>

        {row.person && (
          <Typography variant="caption" color="text.secondary" display="block">
            בעלים: {row.person.name} ({formatPercent(row.ownershipPercentage)})
          </Typography>
        )}

        <Stack direction="row" justifyContent="space-between" mt={1}>
          <Box>
            <Typography variant="caption" color="text.secondary">לתשלום</Typography>
            <Typography variant="body2" fontWeight={600}>{formatCurrency(row.amountDue)}</Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="caption" color="text.secondary">מתוך שכ״ד</Typography>
            <Typography variant="body2">{formatCurrency(row.totalRent)}</Typography>
          </Box>
          <Box textAlign="left">
            <Typography variant="caption" color="text.secondary">שולם</Typography>
            <Typography variant="body2" fontWeight={600} color={row.amountPaid > 0 ? 'success.main' : 'text.secondary'}>
              {row.amountPaid > 0 ? formatCurrency(row.amountPaid) : '—'}
            </Typography>
          </Box>
        </Stack>

        <Box mt={1}>
          <FormControl fullWidth size="small" disabled={isUpdating}>
            <InputLabel>שינוי סטטוס</InputLabel>
            <Select
              value={row.status}
              label="שינוי סטטוס"
              onChange={(e) => onStatusChange(row, e.target.value as OwnerPaymentStatus)}
            >
              <MenuItem value="PAID">שולם</MenuItem>
              <MenuItem value="PENDING">ממתין</MenuItem>
              <MenuItem value="PARTIAL">שולם חלקי</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </CardContent>
    </Card>
  );
}

// ── Mark Paid Dialog ──────────────────────────────────────────────────────

interface MarkPaidDialogProps {
  open: boolean;
  row: OwnerPayment | null;
  onClose: () => void;
  onConfirm: (data: { amountPaid: number; paymentDate: string }) => void;
  isLoading: boolean;
}

function MarkPaidDialog({ open, row, onClose, onConfirm, isLoading }: MarkPaidDialogProps) {
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Reset on open
  if (row && open && amountPaid === '') {
    // Pre-fill with amountDue
  }

  const handleOpen = () => {
    if (row) setAmountPaid(String(row.amountDue));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth TransitionProps={{ onEnter: handleOpen }}>
      <DialogTitle>סימון תשלום לבעלים</DialogTitle>
      <DialogContent>
        {row && (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {row.person?.name} | {monthLabel(row.year, row.month)}
            </Typography>
            <Typography variant="body2">
              סכום מבוקש: <strong>{formatCurrency(row.amountDue)}</strong>
            </Typography>
            <TextField
              label="סכום ששולם"
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">₪</InputAdornment>,
              }}
              fullWidth
              autoFocus
            />
            <TextField
              label="תאריך תשלום"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>ביטול</Button>
        <Button
          variant="contained"
          onClick={() => onConfirm({ amountPaid: Number(amountPaid), paymentDate })}
          disabled={isLoading || !amountPaid}
          startIcon={isLoading ? <CircularProgress size={16} /> : null}
        >
          {isLoading ? 'שומר...' : 'אשר תשלום'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function OwnerPaymentsPage() {
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [selectedLeaseId, setSelectedLeaseId] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | ''>('');
  const [statusFilter, setStatusFilter] = useState<OwnerPaymentStatus | 'ALL'>('ALL');
  const [markPaidRow, setMarkPaidRow] = useState<OwnerPayment | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const showSnack = (message: string, severity: 'success' | 'error' = 'success') =>
    setSnackbar({ open: true, message, severity });

  // ── Fetch leases ──────────────────────────────────────────────────────
  const { data: leasesData, isLoading: leasesLoading } = useQuery({
    queryKey: ['rental-agreements-for-owner-payments'],
    queryFn: () => rentalAgreementsApi.getRentalAgreements(1, 200),
  });
  const allLeases: RentalAgreement[] = leasesData?.data ?? [];

  // ── Fetch schedule ────────────────────────────────────────────────────
  const { data: scheduleRows = [], isLoading: scheduleLoading, error: scheduleError } = useQuery({
    queryKey: ['owner-payments-schedule', selectedLeaseId],
    queryFn: () => ownerPaymentsApi.getSchedule(selectedLeaseId),
    enabled: !!selectedLeaseId,
  });

  // ── Unique persons from schedule ──────────────────────────────────────
  const availablePersons = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of scheduleRows) {
      if (r.person && r.personId) map.set(r.personId, r.person.name);
    }
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [scheduleRows]);

  const availableYears = useMemo(() => {
    const years = new Set(scheduleRows.map((r) => r.year));
    return [...years].sort((a, b) => b - a);
  }, [scheduleRows]);

  // ── Filtered rows ─────────────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    let rows = scheduleRows;
    if (selectedPersonId) rows = rows.filter((r) => r.personId === selectedPersonId);
    if (selectedYear !== '') rows = rows.filter((r) => r.year === selectedYear);
    if (statusFilter !== 'ALL') rows = rows.filter((r) => r.status === statusFilter);
    return rows;
  }, [scheduleRows, selectedPersonId, selectedYear, statusFilter]);

  // ── Mutations ─────────────────────────────────────────────────────────

  const updateMutation = useMutation({
    mutationFn: async ({
      row,
      status,
      amountPaid,
      paymentDate,
    }: {
      row: OwnerPayment;
      status: OwnerPaymentStatus;
      amountPaid?: number;
      paymentDate?: string;
    }) => {
      if (row.isVirtual) {
        // Create a new record
        const createDto: CreateOwnerPaymentDto = {
          ownershipId: row.ownershipId,
          rentalAgreementId: row.rentalAgreementId,
          year: row.year,
          month: row.month,
          totalRent: row.totalRent,
          amountPaid: amountPaid ?? (status === 'PAID' ? row.amountDue : 0),
          status,
          paymentDate,
        };
        return ownerPaymentsApi.createOwnerPayment(createDto);
      } else {
        const updateDto: UpdateOwnerPaymentDto = { status };
        if (amountPaid !== undefined) updateDto.amountPaid = amountPaid;
        if (paymentDate) updateDto.paymentDate = paymentDate;
        return ownerPaymentsApi.updateOwnerPayment(row.id, updateDto);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-payments-schedule', selectedLeaseId] });
      showSnack('הסטטוס עודכן בהצלחה');
      setMarkPaidRow(null);
    },
    onError: () => {
      showSnack('שגיאה בעדכון הסטטוס', 'error');
    },
  });

  const handleStatusChange = useCallback(
    (row: OwnerPayment, status: OwnerPaymentStatus) => {
      if (status === 'PAID') {
        setMarkPaidRow(row);
      } else {
        updateMutation.mutate({ row, status });
      }
    },
    [updateMutation],
  );

  const handleMarkPaidConfirm = ({ amountPaid, paymentDate }: { amountPaid: number; paymentDate: string }) => {
    if (!markPaidRow) return;
    updateMutation.mutate({ row: markPaidRow, status: 'PAID', amountPaid, paymentDate });
  };

  const leaseLabel = (lease: RentalAgreement) => {
    const prop = typeof lease.property === 'object' && lease.property
      ? (lease.property as { address?: string }).address ?? ''
      : '';
    const tenant = typeof lease.tenant === 'object' && lease.tenant
      ? ` — ${(lease.tenant as { name?: string }).name ?? ''}`
      : '';
    return `${prop}${tenant}` || lease.id;
  };

  // ── Table columns ──────────────────────────────────────────────────────

  const columns: GridColDef<OwnerPayment>[] = [
    {
      field: 'monthLabel',
      headerName: 'חודש',
      flex: 1,
      minWidth: 120,
      align: 'right',
      headerAlign: 'right',
      valueGetter: (params) => monthLabel(params.row.year, params.row.month),
    },
    {
      field: 'personName',
      headerName: 'בעלים',
      flex: 1,
      minWidth: 130,
      align: 'right',
      headerAlign: 'right',
      valueGetter: (params) => params.row.person?.name ?? params.row.personId,
    },
    {
      field: 'ownershipPercentage',
      headerName: '% בעלות',
      width: 90,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatPercent(params.value as number),
    },
    {
      field: 'totalRent',
      headerName: 'שכ״ד חודשי',
      width: 120,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatCurrency(params.value as number),
    },
    {
      field: 'amountDue',
      headerName: 'לתשלום לבעלים',
      width: 140,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatCurrency(params.value as number),
    },
    {
      field: 'amountPaid',
      headerName: 'שולם',
      width: 120,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) =>
        (params.value as number) > 0 ? formatCurrency(params.value as number) : '—',
    },
    {
      field: 'status',
      headerName: 'סטטוס',
      width: 130,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams<OwnerPayment, string>) => {
        const status = params.value as string;
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
      width: 170,
      align: 'right',
      headerAlign: 'right',
      sortable: false,
      renderCell: (params: GridRenderCellParams<OwnerPayment>) => {
        const row = params.row;
        return (
          <Select
            size="small"
            value={row.status}
            onChange={(e) => handleStatusChange(row, e.target.value as OwnerPaymentStatus)}
            sx={{ fontSize: '0.75rem', height: 32, minWidth: 140 }}
            disabled={updateMutation.isPending}
          >
            <MenuItem value="PAID">שולם</MenuItem>
            <MenuItem value="PENDING">ממתין</MenuItem>
            <MenuItem value="PARTIAL">שולם חלקי</MenuItem>
          </Select>
        );
      },
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, direction: 'rtl' }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        תשלומים לבעלים
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        מעקב תשלומי שכירות לבעלים לפי אחוזי בעלות בנכס
      </Typography>

      {/* ── Filters ── */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center" direction="row-reverse">
          {/* Lease selector */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>חוזה שכירות</InputLabel>
              <Select
                value={selectedLeaseId}
                onChange={(e) => {
                  setSelectedLeaseId(e.target.value as string);
                  setSelectedPersonId('');
                  setSelectedYear('');
                  setStatusFilter('ALL');
                }}
                label="חוזה שכירות"
              >
                <MenuItem value=""><em>בחר חוזה...</em></MenuItem>
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

          {/* Person filter */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small" disabled={!selectedLeaseId || availablePersons.length === 0}>
              <InputLabel>בעלים</InputLabel>
              <Select
                value={selectedPersonId}
                onChange={(e) => setSelectedPersonId(e.target.value as string)}
                label="בעלים"
              >
                <MenuItem value="">הכל</MenuItem>
                {availablePersons.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Year filter */}
          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth size="small" disabled={!selectedLeaseId}>
              <InputLabel>שנה</InputLabel>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value as number | '')}
                label="שנה"
              >
                <MenuItem value="">הכל</MenuItem>
                {availableYears.map((y) => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Status filter */}
          <Grid item xs={6} sm={3} md={3}>
            <FormControl fullWidth size="small" disabled={!selectedLeaseId}>
              <InputLabel>סטטוס תשלום</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OwnerPaymentStatus | 'ALL')}
                label="סטטוס תשלום"
              >
                <MenuItem value="ALL">הכל</MenuItem>
                <MenuItem value="PAID">שולם</MenuItem>
                <MenuItem value="PENDING">ממתין</MenuItem>
                <MenuItem value="PARTIAL">שולם חלקי</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* ── Error ── */}
      {scheduleError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          שגיאה בטעינת נתוני תשלומים. נסה לרענן את הדף.
        </Alert>
      )}

      {/* ── Empty state ── */}
      {!selectedLeaseId && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">
            בחר חוזה שכירות כדי לראות את לוח תשלומי הבעלים
          </Typography>
        </Box>
      )}

      {/* ── Loading skeleton ── */}
      {selectedLeaseId && scheduleLoading && (
        <Stack spacing={1}>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={isMobile ? 100 : 52} />
          ))}
        </Stack>
      )}

      {/* ── Content ── */}
      {selectedLeaseId && !scheduleLoading && filteredRows.length >= 0 && (
        <>
          {/* Summary */}
          <SummaryCards rows={filteredRows} />
          <Divider sx={{ mb: 2 }} />

          {filteredRows.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">אין תשלומים תואמים לסינון שנבחר</Typography>
            </Box>
          ) : isMobile ? (
            /* Mobile card layout */
            <Box>
              {filteredRows.map((row) => (
                <MobilePaymentCard
                  key={row.id}
                  row={row}
                  onStatusChange={handleStatusChange}
                  isUpdating={updateMutation.isPending}
                />
              ))}
            </Box>
          ) : (
            /* Desktop DataGrid */
            <Box sx={{ direction: 'rtl' }}>
              <DataGrid
                rows={filteredRows}
                columns={columns}
                pageSizeOptions={[12, 24, 50, 100]}
                initialState={{ pagination: { paginationModel: { pageSize: 50 } } }}
                sx={{
                  direction: 'rtl',
                  '& .MuiDataGrid-columnHeaders': { backgroundColor: 'rgba(0,0,0,0.04)' },
                  '& .MuiDataGrid-cell': { direction: 'rtl' },
                  '& .MuiDataGrid-columnHeader': { direction: 'rtl' },
                  '& .row-paid': { backgroundColor: 'rgba(46,125,50,0.05)' },
                  '& .row-pending': { backgroundColor: 'rgba(211,47,47,0.04)' },
                }}
                autoHeight
                disableRowSelectionOnClick
                getRowClassName={(params) => {
                  if (params.row.status === 'PAID') return 'row-paid';
                  if (params.row.status === 'PENDING') return 'row-pending';
                  return '';
                }}
              />
            </Box>
          )}
        </>
      )}

      {/* ── Mark Paid Dialog ── */}
      <MarkPaidDialog
        open={!!markPaidRow}
        row={markPaidRow}
        onClose={() => setMarkPaidRow(null)}
        onConfirm={handleMarkPaidConfirm}
        isLoading={updateMutation.isPending}
      />

      {/* ── Snackbar ── */}
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
