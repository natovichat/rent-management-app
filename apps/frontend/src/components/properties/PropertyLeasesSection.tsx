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
  Avatar,
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
  FormControlLabel,
  Checkbox,
  Skeleton,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Article as ArticleIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import {
  leasesApi,
  RentalAgreement,
  RentalAgreementStatus,
  CreateRentalAgreementDto,
} from '@/lib/api/leases';
import { api } from '@/lib/api';

// ─── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<RentalAgreementStatus, string> = {
  FUTURE: 'עתידי',
  ACTIVE: 'פעיל',
  EXPIRED: 'הסתיים',
  TERMINATED: 'בוטל',
};

const STATUS_COLORS: Record<RentalAgreementStatus, 'success' | 'info' | 'default' | 'error'> = {
  FUTURE: 'info',
  ACTIVE: 'success',
  EXPIRED: 'default',
  TERMINATED: 'error',
};

// ─── LeaseRow ──────────────────────────────────────────────────────────────────

function LeaseRow({
  lease,
  onDelete,
  deleting,
}: {
  lease: RentalAgreement;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const tenant = lease.tenant;
  const rent = Number(lease.monthlyRent);

  return (
    <Box
      sx={{
        py: 1.5,
        px: 1,
        borderRadius: 1,
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      {/* Top row: avatar + name/dates + delete */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ bgcolor: 'secondary.light', width: 36, height: 36, flexShrink: 0 }}>
          <PersonIcon sx={{ fontSize: 18 }} />
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {tenant?.name ?? 'שוכר לא ידוע'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(lease.startDate).toLocaleDateString('he-IL')}
            {' – '}
            {new Date(lease.endDate).toLocaleDateString('he-IL')}
          </Typography>
        </Box>

        <Tooltip title="מחיקת חוזה">
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(lease.id)}
            disabled={deleting}
            sx={{ flexShrink: 0 }}
          >
            {deleting ? <CircularProgress size={16} /> : <DeleteIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Bottom row: chips */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mt: 0.5, pr: 5 }}>
        <Chip
          label={`₪${rent.toLocaleString('he-IL')}/חודש`}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 700 }}
        />
        <Chip
          label={STATUS_LABELS[lease.status]}
          size="small"
          color={STATUS_COLORS[lease.status]}
        />
        {lease.hasExtensionOption && (
          <Chip label="אופציה" size="small" variant="outlined" color="info" />
        )}
      </Box>
    </Box>
  );
}

// ─── Add Lease Dialog ────────────────────────────────────────────────────────

interface Tenant {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

function AddLeaseDialog({
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
  const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [tenantId, setTenantId] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(nextYear);
  const [status, setStatus] = useState<RentalAgreementStatus>('ACTIVE');
  const [hasExtensionOption, setHasExtensionOption] = useState(false);
  const [extensionUntilDate, setExtensionUntilDate] = useState('');
  const [extensionMonthlyRent, setExtensionMonthlyRent] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { data: personsData } = useQuery({
    queryKey: ['persons-for-lease'],
    queryFn: async () => {
      const res = await api.get('/persons', { params: { limit: 200 } });
      return res.data;
    },
    enabled: open,
  });

  const persons: Tenant[] = personsData?.data ?? personsData ?? [];

  async function handleSubmit() {
    if (!tenantId || !monthlyRent || !startDate || !endDate) {
      setError('יש למלא שוכר, שכ״ד חודשי ותאריכים');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const dto: CreateRentalAgreementDto = {
        propertyId,
        tenantId,
        monthlyRent: parseFloat(monthlyRent),
        startDate,
        endDate,
        status,
        hasExtensionOption,
        ...(hasExtensionOption && extensionUntilDate && { extensionUntilDate }),
        ...(hasExtensionOption && extensionMonthlyRent && { extensionMonthlyRent: parseFloat(extensionMonthlyRent) }),
        ...(notes && { notes }),
      };
      await leasesApi.createRentalAgreement(dto);
      onSuccess();
      onClose();
    } catch {
      setError('שגיאה ביצירת חוזה השכירות');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>הוספת חוזה שכירות</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <FormControl fullWidth>
            <InputLabel>שוכר *</InputLabel>
            <Select value={tenantId} onChange={e => setTenantId(e.target.value)} label="שוכר *">
              {persons.map((p: Tenant) => (
                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="שכ״ד חודשי (₪) *"
            type="number"
            value={monthlyRent}
            onChange={e => setMonthlyRent(e.target.value)}
            fullWidth
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="תאריך התחלה *"
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="תאריך סיום *"
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <FormControl fullWidth>
            <InputLabel>סטטוס</InputLabel>
            <Select value={status} onChange={e => setStatus(e.target.value as RentalAgreementStatus)} label="סטטוס">
              {(Object.keys(STATUS_LABELS) as RentalAgreementStatus[]).map(s => (
                <MenuItem key={s} value={s}>{STATUS_LABELS[s]}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={<Checkbox checked={hasExtensionOption} onChange={e => setHasExtensionOption(e.target.checked)} />}
            label="יש אופציית הארכה"
          />

          {hasExtensionOption && (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="אופציה עד תאריך"
                type="date"
                value={extensionUntilDate}
                onChange={e => setExtensionUntilDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="שכ״ד בהארכה (₪)"
                type="number"
                value={extensionMonthlyRent}
                onChange={e => setExtensionMonthlyRent(e.target.value)}
                fullWidth
              />
            </Box>
          )}

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
          {submitting ? 'שומר...' : 'הוסף חוזה'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Section ────────────────────────────────────────────────────────────

interface Props {
  propertyId: string;
}

export default function PropertyLeasesSection({ propertyId }: Props) {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['property-leases', propertyId],
    queryFn: () => leasesApi.getRentalAgreements(1, 50, { propertyId }),
    enabled: !!propertyId,
  });

  const leases: RentalAgreement[] = data?.data ?? [];
  const activeLeases = leases.filter(l => l.status === 'ACTIVE');

  const deleteMutation = useMutation({
    mutationFn: (id: string) => leasesApi.deleteRentalAgreement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-leases', propertyId] });
      setSnackbar({ open: true, message: 'חוזה נמחק בהצלחה', severity: 'success' });
    },
    onError: () => setSnackbar({ open: true, message: 'שגיאה במחיקת החוזה', severity: 'error' }),
  });

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
            <ArticleIcon color="secondary" />
            <Typography fontWeight={700}>חוזי שכירות</Typography>
            {!isLoading && (
              <Stack direction="row" spacing={0.5}>
                {activeLeases.length > 0 && (
                  <Chip label={`${activeLeases.length} פעיל`} size="small" color="success" />
                )}
                {leases.length > activeLeases.length && (
                  <Chip label={`${leases.length - activeLeases.length} נוספים`} size="small" variant="outlined" />
                )}
                {leases.length === 0 && (
                  <Chip label="אין חוזים" size="small" variant="outlined" color="default" />
                )}
              </Stack>
            )}
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ pt: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
            <Button size="small" startIcon={<AddIcon />} onClick={() => setAddOpen(true)} variant="outlined">
              הוסף חוזה שכירות
            </Button>
          </Box>

          {isLoading ? (
            <Stack spacing={1}>
              {[1, 2].map(i => <Skeleton key={i} height={56} variant="rectangular" sx={{ borderRadius: 1 }} />)}
            </Stack>
          ) : leases.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
              <ArticleIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
              <Typography variant="body2">אין חוזי שכירות לנכס זה</Typography>
            </Box>
          ) : (
            <Stack divider={<Divider />}>
              {leases.map(l => (
                <LeaseRow
                  key={l.id}
                  lease={l}
                  onDelete={id => deleteMutation.mutate(id)}
                  deleting={deleteMutation.isPending && deleteMutation.variables === l.id}
                />
              ))}
            </Stack>
          )}
        </AccordionDetails>
      </Accordion>

      <AddLeaseDialog
        open={addOpen}
        propertyId={propertyId}
        onClose={() => setAddOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['property-leases', propertyId] });
          setSnackbar({ open: true, message: 'חוזה שכירות נוסף בהצלחה', severity: 'success' });
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
