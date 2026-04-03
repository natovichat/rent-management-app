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
  People as PeopleIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { ownershipsApi, Ownership, CreateOwnershipDto, OwnershipType } from '@/lib/api/ownerships';
import { api } from '@/lib/api';

// ─── Helpers ───────────────────────────────────────────────────────────────────

const OWNERSHIP_TYPE_LABELS: Record<OwnershipType, string> = {
  FULL:    'בעלות מלאה',
  PARTIAL: 'בעלות חלקית',
  SHARED:  'בעלות משותפת',
  TRUST:   'נאמנות',
  REAL:    'זכות קניינית',
  NOMINEE: 'נאמן רשמי',
};

const OWNERSHIP_TYPE_COLORS: Record<OwnershipType, 'success' | 'primary' | 'secondary' | 'warning' | 'info' | 'default'> = {
  FULL:    'success',
  PARTIAL: 'primary',
  SHARED:  'secondary',
  TRUST:   'warning',
  REAL:    'info',
  NOMINEE: 'default',
};

interface PersonOption {
  id: string;
  name: string;
  type?: 'INDIVIDUAL' | 'COMPANY' | 'PARTNERSHIP';
  email?: string;
  phone?: string;
}

// ─── Mini PersonRow ─────────────────────────────────────────────────────────────

function OwnershipRow({
  ownership,
  onDelete,
  deleting,
}: {
  ownership: Ownership;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const owner = ownership.person;
  const pct = typeof ownership.ownershipPercentage === 'string'
    ? parseFloat(ownership.ownershipPercentage)
    : ownership.ownershipPercentage;

  return (
    <Box
      sx={{
        py: 1.5,
        px: 1,
        borderRadius: 1,
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      {/* Top row: avatar + name/phone + delete */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ bgcolor: 'primary.light', width: 36, height: 36, flexShrink: 0 }}>
          {owner?.type === 'COMPANY' ? (
            <BusinessIcon sx={{ fontSize: 18 }} />
          ) : (
            <PersonIcon sx={{ fontSize: 18 }} />
          )}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {owner?.name ?? '—'}
          </Typography>
          {owner?.phone && (
            <Typography variant="caption" color="text.secondary">
              {owner.phone}
            </Typography>
          )}
        </Box>

        <Tooltip title="מחיקת בעלות">
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(ownership.id)}
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
          label={`${pct}%`}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 700 }}
        />
        <Chip
          label={OWNERSHIP_TYPE_LABELS[ownership.ownershipType] ?? ownership.ownershipType}
          size="small"
          color={OWNERSHIP_TYPE_COLORS[ownership.ownershipType] ?? 'default'}
        />
        {ownership.endDate && (
          <Chip
            label={`עד ${new Date(ownership.endDate).toLocaleDateString('he-IL')}`}
            size="small"
            variant="outlined"
            color="warning"
          />
        )}
      </Box>
    </Box>
  );
}

// ─── Add Ownership Dialog ────────────────────────────────────────────────────

function AddOwnershipDialog({
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
  const [personId, setPersonId] = useState('');
  const [ownershipType, setOwnershipType] = useState<OwnershipType>('FULL');
  const [percentage, setPercentage] = useState('100');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [managementFee, setManagementFee] = useState('');
  const [familyDivision, setFamilyDivision] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { data: personsData } = useQuery({
    queryKey: ['persons-for-ownership'],
    queryFn: async () => {
      const res = await api.get('/persons', { params: { limit: 200 } });
      return res.data;
    },
    enabled: open,
  });

  const persons: PersonOption[] = personsData?.data ?? personsData ?? [];

  async function handleSubmit() {
    if (!personId || !percentage || !startDate) {
      setError('יש למלא אדם, אחוז ותאריך התחלה');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const dto: CreateOwnershipDto = {
        personId,
        ownershipPercentage: parseFloat(percentage),
        ownershipType,
        startDate,
        ...(endDate && { endDate }),
        ...(managementFee && { managementFee: parseFloat(managementFee) }),
        ...(notes && { notes }),
      };
      await ownershipsApi.createOwnership(propertyId, dto);
      onSuccess();
      onClose();
      // Reset
      setPersonId(''); setPercentage('100'); setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate(''); setManagementFee(''); setNotes(''); setFamilyDivision(false);
    } catch {
      setError('שגיאה ביצירת הבעלות');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>הוספת בעלות</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <FormControl fullWidth>
            <InputLabel>אדם *</InputLabel>
            <Select value={personId} onChange={e => setPersonId(e.target.value)} label="אדם *">
              {persons.map((p: PersonOption) => (
                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>סוג בעלות</InputLabel>
            <Select
              value={ownershipType}
              onChange={e => setOwnershipType(e.target.value as OwnershipType)}
              label="סוג בעלות"
            >
              {(Object.keys(OWNERSHIP_TYPE_LABELS) as OwnershipType[]).map(t => (
                <MenuItem key={t} value={t}>{OWNERSHIP_TYPE_LABELS[t]}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="אחוז בעלות *"
            type="number"
            value={percentage}
            onChange={e => setPercentage(e.target.value)}
            inputProps={{ min: 0, max: 100, step: 0.01 }}
            fullWidth
          />

          <TextField
            label="תאריך התחלה *"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="תאריך סיום (אם רלוונטי)"
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="דמי ניהול (₪/חודש)"
            type="number"
            value={managementFee}
            onChange={e => setManagementFee(e.target.value)}
            fullWidth
          />

          <FormControlLabel
            control={<Checkbox checked={familyDivision} onChange={e => setFamilyDivision(e.target.checked)} />}
            label="חלוקה משפחתית"
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
          {submitting ? 'שומר...' : 'הוסף בעלות'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Section ───────────────────────────────────────────────────────────

interface Props {
  propertyId: string;
}

export default function PropertyOwnershipsSection({ propertyId }: Props) {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  const { data: ownerships = [], isLoading } = useQuery({
    queryKey: ['property-ownerships', propertyId],
    queryFn: () => ownershipsApi.getPropertyOwnerships(propertyId),
    enabled: !!propertyId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ownershipsApi.deleteOwnership(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-ownerships', propertyId] });
      setSnackbar({ open: true, message: 'בעלות נמחקה בהצלחה', severity: 'success' });
    },
    onError: () => setSnackbar({ open: true, message: 'שגיאה במחיקת הבעלות', severity: 'error' }),
  });

  const totalPct = ownerships.reduce((sum, o) => {
    const pct = typeof o.ownershipPercentage === 'string' ? parseFloat(o.ownershipPercentage) : o.ownershipPercentage;
    return sum + (pct || 0);
  }, 0);

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
            <PeopleIcon color="primary" />
            <Typography fontWeight={700}>בעלויות</Typography>
            {!isLoading && (
              <Chip
                label={`${ownerships.length} בעלים${totalPct > 0 ? ` · ${totalPct.toFixed(0)}%` : ''}`}
                size="small"
                color={totalPct === 100 ? 'success' : totalPct > 0 ? 'warning' : 'default'}
                variant="outlined"
              />
            )}
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ pt: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
            <Button size="small" startIcon={<AddIcon />} onClick={() => setAddOpen(true)} variant="outlined">
              הוסף בעלות
            </Button>
          </Box>

          {isLoading ? (
            <Stack spacing={1}>
              {[1, 2].map(i => <Skeleton key={i} height={56} variant="rectangular" sx={{ borderRadius: 1 }} />)}
            </Stack>
          ) : ownerships.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
              <PeopleIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
              <Typography variant="body2">אין בעלויות רשומות לנכס זה</Typography>
            </Box>
          ) : (
            <Stack divider={<Divider />}>
              {ownerships.map(o => (
                <OwnershipRow
                  key={o.id}
                  ownership={o}
                  onDelete={id => deleteMutation.mutate(id)}
                  deleting={deleteMutation.isPending && deleteMutation.variables === o.id}
                />
              ))}
            </Stack>
          )}

          {totalPct > 0 && totalPct !== 100 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              סך הבעלויות הרשומות: {totalPct.toFixed(2)}% (נדרש 100%)
            </Alert>
          )}
        </AccordionDetails>
      </Accordion>

      <AddOwnershipDialog
        open={addOpen}
        propertyId={propertyId}
        onClose={() => setAddOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['property-ownerships', propertyId] });
          setSnackbar({ open: true, message: 'בעלות נוספה בהצלחה', severity: 'success' });
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
