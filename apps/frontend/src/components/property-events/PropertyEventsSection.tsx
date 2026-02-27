'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Skeleton,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  AccountBalance as PlanningIcon,
  Warning as DamageIcon,
  Receipt as ExpenseIcon,
  Payment as PaymentIcon,
  Close as CloseIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import {
  propertyEventsApi,
  PropertyEvent,
  PropertyEventType,
  ExpenseEventType,
  RentalPaymentStatus,
} from '@/lib/api/property-events';
import PropertyEventForm from './PropertyEventForm';

// ─── Config ────────────────────────────────────────────────────────────────────

const EVENT_CONFIG: Record<
  PropertyEventType,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  ExpenseEvent: {
    label: 'הוצאה',
    color: '#c62828',
    bg: '#ffebee',
    icon: <ExpenseIcon fontSize="small" />,
  },
  RentalPaymentRequestEvent: {
    label: 'גביית שכ"ד',
    color: '#2e7d32',
    bg: '#e8f5e9',
    icon: <PaymentIcon fontSize="small" />,
  },
  PropertyDamageEvent: {
    label: 'נזק לנכס',
    color: '#e65100',
    bg: '#fff3e0',
    icon: <DamageIcon fontSize="small" />,
  },
  PlanningProcessEvent: {
    label: 'תכנון',
    color: '#1565c0',
    bg: '#e3f2fd',
    icon: <PlanningIcon fontSize="small" />,
  },
};

const EXPENSE_TYPE_LABELS: Record<ExpenseEventType, string> = {
  MANAGEMENT_FEE: 'דמי ניהול',
  REPAIRS: 'תיקונים',
  MAINTENANCE: 'אחזקה',
  TAX: 'מס / ארנונה',
  INSURANCE: 'ביטוח',
  UTILITIES: 'שירותים',
  OTHER: 'אחר',
};

const PAYMENT_STATUS_LABELS: Record<RentalPaymentStatus, { label: string; color: 'default' | 'success' | 'error' | 'warning' }> = {
  PENDING: { label: 'ממתין', color: 'warning' },
  PAID: { label: 'שולם', color: 'success' },
  OVERDUE: { label: 'באיחור', color: 'error' },
};

const MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatAmount(v?: number | string) {
  if (v == null) return '';
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return isNaN(n) ? '' : `₪${n.toLocaleString('he-IL')}`;
}

// ─── Single event card ─────────────────────────────────────────────────────────

function EventCard({
  event,
  onDelete,
}: {
  event: PropertyEvent;
  onDelete: (id: string) => void;
}) {
  const cfg = EVENT_CONFIG[event.eventType];

  const renderDetails = () => {
    switch (event.eventType) {
      case 'ExpenseEvent':
        return (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
            {event.expenseType && (
              <Chip size="small" label={EXPENSE_TYPE_LABELS[event.expenseType]} />
            )}
            {event.amount != null && (
              <Chip size="small" label={formatAmount(event.amount)} color="error" variant="outlined" />
            )}
            {event.affectsPropertyValue && (
              <Chip size="small" label="משפיע על שווי" color="warning" variant="outlined" />
            )}
          </Box>
        );
      case 'RentalPaymentRequestEvent': {
        const statusInfo = event.paymentStatus
          ? PAYMENT_STATUS_LABELS[event.paymentStatus]
          : null;
        return (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
            {event.month && event.year && (
              <Chip size="small" label={`${MONTHS[(event.month ?? 1) - 1]} ${event.year}`} />
            )}
            {event.amountDue != null && (
              <Chip size="small" label={formatAmount(event.amountDue)} color="success" variant="outlined" />
            )}
            {statusInfo && (
              <Chip size="small" label={statusInfo.label} color={statusInfo.color} />
            )}
          </Box>
        );
      }
      case 'PropertyDamageEvent':
        return (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
            {event.damageType && <Chip size="small" label={event.damageType} />}
            {event.estimatedDamageCost != null && (
              <Chip size="small" label={formatAmount(event.estimatedDamageCost)} color="warning" variant="outlined" />
            )}
          </Box>
        );
      case 'PlanningProcessEvent':
        return (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
            {event.planningStage && <Chip size="small" label={event.planningStage} />}
            {event.developerName && <Chip size="small" label={event.developerName} variant="outlined" />}
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
      {/* Timeline dot + line */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 0.5, minWidth: 32 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: cfg.bg,
            border: `2px solid ${cfg.color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: cfg.color,
            flexShrink: 0,
          }}
        >
          {cfg.icon}
        </Box>
      </Box>

      {/* Card */}
      <Paper
        variant="outlined"
        sx={{
          flex: 1,
          p: 1.5,
          mb: 1.5,
          borderLeft: `3px solid ${cfg.color}`,
          '&:hover': { boxShadow: 1 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              size="small"
              label={cfg.label}
              sx={{ backgroundColor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: '0.7rem' }}
            />
            <Typography variant="caption" color="text.secondary">
              {formatDate(event.eventDate)}
            </Typography>
          </Box>
          <Tooltip title="מחק אירוע">
            <IconButton size="small" onClick={() => onDelete(event.id)} sx={{ color: 'text.disabled' }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {renderDetails()}

        {event.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.8rem' }}>
            {event.description}
          </Typography>
        )}
      </Paper>
    </Box>
  );
}

// ─── Main section ──────────────────────────────────────────────────────────────

interface Props {
  propertyId: string;
}

export default function PropertyEventsSection({ propertyId }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const queryClient = useQueryClient();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<PropertyEventType | ''>('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['property-events', propertyId, filterType],
    queryFn: () =>
      propertyEventsApi.getPropertyEvents(
        propertyId,
        1,
        50,
        filterType || undefined,
      ),
  });

  const deleteMutation = useMutation({
    mutationFn: (eventId: string) =>
      propertyEventsApi.deletePropertyEvent(propertyId, eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-events', propertyId] });
      setSnackbar({ open: true, message: 'האירוע נמחק', severity: 'success' });
    },
    onError: () =>
      setSnackbar({ open: true, message: 'שגיאה במחיקת האירוע', severity: 'error' }),
  });

  const events = data?.data || [];

  return (
    <Box sx={{ overflowX: 'hidden', maxWidth: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1, minWidth: 0 }}>
          <FilterIcon fontSize="small" color="action" />
          <FormControl size="small" sx={{ minWidth: isMobile ? 130 : 160, flex: isMobile ? 1 : 'unset' }}>
            <InputLabel>סנן לפי סוג</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as PropertyEventType | '')}
              label="סנן לפי סוג"
            >
              <MenuItem value="">הכל</MenuItem>
              {(Object.entries(EVENT_CONFIG) as [PropertyEventType, typeof EVENT_CONFIG[PropertyEventType]][]).map(
                ([type, cfg]) => (
                  <MenuItem key={type} value={type}>
                    {cfg.label}
                  </MenuItem>
                ),
              )}
            </Select>
          </FormControl>
        </Box>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          size="small"
          onClick={() => setAddDialogOpen(true)}
          sx={{ flexShrink: 0 }}
        >
          הוסף אירוע
        </Button>
      </Box>

      {/* Stats row */}
      {events.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {(Object.entries(EVENT_CONFIG) as [PropertyEventType, typeof EVENT_CONFIG[PropertyEventType]][]).map(
            ([type, cfg]) => {
              const count = events.filter((e) => e.eventType === type).length;
              if (!count) return null;
              return (
                <Chip
                  key={type}
                  icon={cfg.icon as any}
                  label={`${cfg.label}: ${count}`}
                  size="small"
                  sx={{ backgroundColor: cfg.bg, color: cfg.color, '& .MuiChip-icon': { color: cfg.color } }}
                />
              );
            },
          )}
        </Box>
      )}

      <Divider sx={{ mb: 2 }} />

      {/* Timeline */}
      {isLoading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={72} />
          ))}
        </Box>
      ) : events.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
          <Typography variant="body2">אין אירועים{filterType ? ` מסוג ${EVENT_CONFIG[filterType].label}` : ''}</Typography>
          <Button
            startIcon={<AddIcon />}
            sx={{ mt: 1 }}
            onClick={() => setAddDialogOpen(true)}
          >
            הוסף אירוע ראשון
          </Button>
        </Box>
      ) : (
        <Box>
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </Box>
      )}

      {/* Add event dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography fontWeight={700}>הוספת אירוע לנכס</Typography>
          <IconButton onClick={() => setAddDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <PropertyEventForm
            propertyId={propertyId}
            onSuccess={() => {
              setAddDialogOpen(false);
              setSnackbar({ open: true, message: 'האירוע נשמר בהצלחה', severity: 'success' });
            }}
            onCancel={() => setAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
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
