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
import { mortgagesApi, Mortgage } from '@/lib/api/mortgages';
import { getApiErrorMessage } from '@/lib/api-error';
import MortgageForm from '@/components/mortgages/MortgageForm';

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
      {/* Top row: icon + name + delete */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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

        <Tooltip title="מחיקת משכנתא">
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(mortgage.id)}
            disabled={deleting}
            sx={{ flexShrink: 0 }}
          >
            {deleting ? <CircularProgress size={16} /> : <DeleteIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Bottom row: amount + chips */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', mt: 0.5, pr: 4 }}>
        <Typography variant="body2" fontWeight={700} color="primary">
          ₪{amount.toLocaleString('he-IL')}
        </Typography>
        {monthly && (
          <Typography variant="caption" color="text.secondary">
            · ₪{monthly.toLocaleString('he-IL')}/חודש
          </Typography>
        )}
        {rate && (
          <Chip label={`${rate}%`} size="small" variant="outlined" color="warning" />
        )}
        <Chip
          label={STATUS_LABELS[mortgage.status as MortgageStatus] ?? mortgage.status}
          size="small"
          color={STATUS_COLORS[mortgage.status as MortgageStatus] ?? 'default'}
        />
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
    onError: (err: unknown) =>
      setSnackbar({
        open: true,
        message: getApiErrorMessage(err, 'לא ניתן למחוק את המשכנתא.'),
        severity: 'error',
      }),
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

      {addOpen && (
        <MortgageForm
          open
          mortgage={null}
          propertyId={propertyId}
          onClose={() => setAddOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['property-mortgages', propertyId] });
            queryClient.invalidateQueries({ queryKey: ['mortgages'] });
            setSnackbar({ open: true, message: 'משכנתא נוספה בהצלחה', severity: 'success' });
          }}
        />
      )}

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
