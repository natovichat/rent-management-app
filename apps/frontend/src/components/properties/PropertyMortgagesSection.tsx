'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Button,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Skeleton,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  CircularProgress,
  Stack,
  LinearProgress,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  AccountBalance as BankIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { mortgagesApi, Mortgage, CreateMortgageDto } from '@/lib/api/mortgages';

// ─── Types ─────────────────────────────────────────────────────────────────────

type MortgageStatus = 'ACTIVE' | 'PAID_OFF' | 'REFINANCED' | 'DEFAULTED';

const STATUS_LABELS: Record<MortgageStatus, string> = {
  ACTIVE: 'פעיל',
  PAID_OFF: 'שולם',
  REFINANCED: 'מומחזר',
  DEFAULTED: 'חדל תשלום',
};

const STATUS_COLORS: Record<MortgageStatus, 'success' | 'default' | 'info' | 'error'> = {
  ACTIVE: 'success',
  PAID_OFF: 'default',
  REFINANCED: 'info',
  DEFAULTED: 'error',
};

// ─── MortgageRow ───────────────────────────────────────────────────────────────

function MortgageRow({
  mortgage,
  onDelete,
  deleting,
}: {
  mortgage: Mortgage;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const amount = Number(mortgage.loanAmount);
  const monthly = mortgage.monthlyPayment ? Number(mortgage.monthlyPayment) : null;
  const rate = mortgage.interestRate ? Number(mortgage.interestRate) : null;

  // Estimate progress if we have dates
  let progress: number | null = null;
  if (mortgage.startDate && mortgage.endDate) {
    const start = new Date(mortgage.startDate).getTime();
    const end = new Date(mortgage.endDate).getTime();
    const now = Date.now();
    progress = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
  }

  return (
    <Box
      sx={{
        py: 1.5,
        px: 1,
        borderRadius: 1,
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <BankIcon sx={{ color: 'text.secondary', flexShrink: 0 }} />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {mortgage.bank}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(mortgage.startDate).toLocaleDateString('he-IL')}
            {mortgage.endDate && ` – ${new Date(mortgage.endDate).toLocaleDateString('he-IL')}`}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" fontWeight={700} color="primary">
              ₪{amount.toLocaleString('he-IL')}
            </Typography>
            {monthly && (
              <Typography variant="caption" color="text.secondary">
                ₪{monthly.toLocaleString('he-IL')}/חודש
              </Typography>
            )}
          </Box>

          {rate && (
            <Chip
              label={`${rate}%`}
              size="small"
              variant="outlined"
              color="warning"
            />
          )}

          <Chip
            label={STATUS_LABELS[mortgage.status as MortgageStatus] ?? mortgage.status}
            size="small"
            color={STATUS_COLORS[mortgage.status as MortgageStatus] ?? 'default'}
          />
        </Box>

        <Tooltip title="מחיקת משכנתא">
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(mortgage.id)}
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={16} /> : <DeleteIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      {progress !== null && mortgage.status === 'ACTIVE' && (
        <Box sx={{ mt: 1, px: 4.5 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 4, borderRadius: 2, opacity: 0.7 }}
          />
          <Typography variant="caption" color="text.secondary">
            {Math.round(progress)}% מהתקופה עברה
          </Typography>
        </Box>
      )}
    </Box>
  );
}

// ─── Add Mortgage Dialog ─────────────────────────────────────────────────────

function AddMortgageDialog({
  open,
  propertyId,
  onClose,
  onSuccess,
}: {
  open: boolean;
  propertyId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const today = new Date().toISOString().split('T')[0];

  const [bank, setBank] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<MortgageStatus>('ACTIVE');
  const [earlyRepaymentPenalty, setEarlyRepaymentPenalty] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!bank || !loanAmount || !startDate) {
      setError('יש למלא בנק, סכום הלוואה ותאריך התחלה');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const dto: CreateMortgageDto = {
        propertyId,
        bank,
        loanAmount: parseFloat(loanAmount),
        startDate,
        status,
        ...(endDate && { endDate }),
        ...(interestRate && { interestRate: parseFloat(interestRate) }),
        ...(monthlyPayment && { monthlyPayment: parseFloat(monthlyPayment) }),
        ...(earlyRepaymentPenalty && { earlyRepaymentPenalty: parseFloat(earlyRepaymentPenalty) }),
        ...(notes && { notes }),
      };
      await mortgagesApi.createMortgage(dto);
      onSuccess();
      onClose();
    } catch {
      setError('שגיאה ביצירת המשכנתא');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>הוספת משכנתא</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="בנק *"
            value={bank}
            onChange={e => setBank(e.target.value)}
            fullWidth
            autoFocus
          />

          <TextField
            label="סכום הלוואה (₪) *"
            type="number"
            value={loanAmount}
            onChange={e => setLoanAmount(e.target.value)}
            fullWidth
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="ריבית שנתית (%)"
              type="number"
              value={interestRate}
              onChange={e => setInterestRate(e.target.value)}
              inputProps={{ step: 0.01 }}
            />
            <TextField
              label="תשלום חודשי (₪)"
              type="number"
              value={monthlyPayment}
              onChange={e => setMonthlyPayment(e.target.value)}
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="תאריך התחלה *"
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="תאריך סיום"
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <FormControl fullWidth>
            <InputLabel>סטטוס</InputLabel>
            <Select value={status} onChange={e => setStatus(e.target.value as MortgageStatus)} label="סטטוס">
              {(Object.keys(STATUS_LABELS) as MortgageStatus[]).map(s => (
                <MenuItem key={s} value={s}>{STATUS_LABELS[s]}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="עמלת פירעון מוקדם (₪)"
            type="number"
            value={earlyRepaymentPenalty}
            onChange={e => setEarlyRepaymentPenalty(e.target.value)}
            fullWidth
          />

          <TextField
            label="הערות"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ביטול</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'שומר...' : 'הוסף משכנתא'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Section ────────────────────────────────────────────────────────────

interface Props {
  propertyId: string;
}

export default function PropertyMortgagesSection({ propertyId }: Props) {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  const { data: mortgages = [], isLoading } = useQuery({
    queryKey: ['property-mortgages', propertyId],
    queryFn: () => mortgagesApi.getPropertyMortgages(propertyId),
    enabled: !!propertyId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mortgagesApi.deleteMortgage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-mortgages', propertyId] });
      setSnackbar({ open: true, message: 'משכנתא נמחקה בהצלחה', severity: 'success' });
    },
    onError: () => setSnackbar({ open: true, message: 'שגיאה במחיקת המשכנתא', severity: 'error' }),
  });

  const activeMortgages = mortgages.filter(m => m.status === 'ACTIVE');
  const totalLoan = mortgages.reduce((s, m) => s + Number(m.loanAmount), 0);

  return (
    <>
      <Accordion
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          '&:before': { display: 'none' },
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
            <BankIcon color="warning" />
            <Typography fontWeight={700}>משכנתאות</Typography>
            {!isLoading && (
              <Stack direction="row" spacing={0.5}>
                {activeMortgages.length > 0 && (
                  <Chip label={`${activeMortgages.length} פעיל`} size="small" color="success" />
                )}
                {totalLoan > 0 && (
                  <Chip
                    label={`₪${(totalLoan / 1_000_000).toFixed(2)}M`}
                    size="small"
                    variant="outlined"
                    color="warning"
                  />
                )}
                {mortgages.length === 0 && (
                  <Chip label="אין משכנתאות" size="small" variant="outlined" />
                )}
              </Stack>
            )}
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ pt: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
            <Button size="small" startIcon={<AddIcon />} onClick={() => setAddOpen(true)} variant="outlined">
              הוסף משכנתא
            </Button>
          </Box>

          {isLoading ? (
            <Stack spacing={1}>
              {[1, 2].map(i => <Skeleton key={i} height={70} variant="rectangular" sx={{ borderRadius: 1 }} />)}
            </Stack>
          ) : mortgages.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
              <BankIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
              <Typography variant="body2">אין משכנתאות לנכס זה</Typography>
            </Box>
          ) : (
            <Stack divider={<Divider />}>
              {mortgages.map(m => (
                <MortgageRow
                  key={m.id}
                  mortgage={m}
                  onDelete={id => deleteMutation.mutate(id)}
                  deleting={deleteMutation.isPending && deleteMutation.variables === m.id}
                />
              ))}
            </Stack>
          )}
        </AccordionDetails>
      </Accordion>

      <AddMortgageDialog
        open={addOpen}
        propertyId={propertyId}
        onClose={() => setAddOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['property-mortgages', propertyId] });
          setSnackbar({ open: true, message: 'משכנתא נוספה בהצלחה', severity: 'success' });
        }}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
}
