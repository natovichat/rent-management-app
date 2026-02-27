'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Switch,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Alert,
  Divider,
} from '@mui/material';
import {
  AccountBalance as PlanningIcon,
  Warning as DamageIcon,
  Receipt as ExpenseIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import {
  propertyEventsApi,
  PropertyEventType,
  ExpenseEventType,
  RentalPaymentStatus,
} from '@/lib/api/property-events';
import { rentalAgreementsApi } from '@/lib/api/leases';

// ─── Event type selection card ────────────────────────────────────────────────

const EVENT_TYPES: Array<{
  type: PropertyEventType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}> = [
  {
    type: 'ExpenseEvent',
    label: 'הוצאה',
    description: 'תשלום, תיקון, ביטוח, ניהול',
    icon: <ExpenseIcon fontSize="large" />,
    color: '#f44336',
  },
  {
    type: 'RentalPaymentRequestEvent',
    label: 'גביית שכ"ד',
    description: 'בקשת תשלום מדייר',
    icon: <PaymentIcon fontSize="large" />,
    color: '#4caf50',
  },
  {
    type: 'PropertyDamageEvent',
    label: 'נזק לנכס',
    description: 'דיווח על נזק שנגרם',
    icon: <DamageIcon fontSize="large" />,
    color: '#ff9800',
  },
  {
    type: 'PlanningProcessEvent',
    label: 'תכנון',
    description: 'תהליך תכנוני, התחדשות עירונית',
    icon: <PlanningIcon fontSize="large" />,
    color: '#2196f3',
  },
];

const EXPENSE_TYPE_LABELS: Record<ExpenseEventType, string> = {
  MANAGEMENT_FEE: 'דמי ניהול',
  REPAIRS: 'תיקונים',
  MAINTENANCE: 'אחזקה',
  TAX: 'מס / ארנונה',
  INSURANCE: 'ביטוח',
  UTILITIES: 'שירותים',
  OTHER: 'אחר',
};

const PAYMENT_STATUS_LABELS: Record<RentalPaymentStatus, string> = {
  PENDING: 'ממתין',
  PAID: 'שולם',
  OVERDUE: 'באיחור',
};

const MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
];

// ─── Schemas ──────────────────────────────────────────────────────────────────

const expenseSchema = z.object({
  eventDate: z.string().min(1, 'תאריך הוא שדה חובה'),
  description: z.string().optional(),
  expenseType: z.enum(['MANAGEMENT_FEE', 'REPAIRS', 'MAINTENANCE', 'TAX', 'INSURANCE', 'UTILITIES', 'OTHER'] as const),
  amount: z.coerce.number().min(0.01, 'סכום חייב להיות גדול מ-0'),
  paidToAccountId: z.string().optional(),
  affectsPropertyValue: z.boolean().optional(),
});

const rentalPaymentSchema = z.object({
  eventDate: z.string().min(1, 'תאריך הוא שדה חובה'),
  description: z.string().optional(),
  rentalAgreementId: z.string().min(1, 'חוזה שכירות הוא שדה חובה'),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2000).max(2100),
  amountDue: z.coerce.number().min(0.01, 'סכום חייב להיות גדול מ-0'),
  paymentDate: z.string().optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'OVERDUE'] as const).optional(),
});

const damageSchema = z.object({
  eventDate: z.string().min(1, 'תאריך הוא שדה חובה'),
  description: z.string().optional(),
  damageType: z.string().optional(),
  estimatedDamageCost: z.coerce.number().optional(),
});

const planningSchema = z.object({
  eventDate: z.string().min(1, 'תאריך הוא שדה חובה'),
  description: z.string().optional(),
  planningStage: z.string().optional(),
  developerName: z.string().optional(),
  projectedSizeAfter: z.string().optional(),
});

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  propertyId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PropertyEventForm({ propertyId, onSuccess, onCancel }: Props) {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<PropertyEventType | null>(null);

  // Fetch rental agreements for the rental payment form
  const { data: leasesData } = useQuery({
    queryKey: ['leases-for-event', propertyId],
    queryFn: () => rentalAgreementsApi.getRentalAgreements(1, 100, { propertyId }),
    enabled: selectedType === 'RentalPaymentRequestEvent',
  });
  const leases = leasesData?.data || [];

  const today = new Date().toISOString().split('T')[0];

  type ExpenseFormData = z.infer<typeof expenseSchema>;
  type RentalFormData = z.infer<typeof rentalPaymentSchema>;
  type DamageFormData = z.infer<typeof damageSchema>;
  type PlanningFormData = z.infer<typeof planningSchema>;

  // ── Expense form ──
  const expenseForm = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { eventDate: today, expenseType: 'REPAIRS', amount: 0, affectsPropertyValue: false, description: '' },
  });

  // ── Rental payment form ──
  const rentalForm = useForm<RentalFormData>({
    resolver: zodResolver(rentalPaymentSchema),
    defaultValues: {
      eventDate: today, month: new Date().getMonth() + 1, year: new Date().getFullYear(),
      amountDue: 0, paymentStatus: 'PENDING', description: '', rentalAgreementId: '', paymentDate: '',
    },
  });

  // ── Damage form ──
  const damageForm = useForm<DamageFormData>({
    resolver: zodResolver(damageSchema),
    defaultValues: { eventDate: today, description: '', damageType: '', estimatedDamageCost: undefined },
  });

  // ── Planning form ──
  const planningForm = useForm<PlanningFormData>({
    resolver: zodResolver(planningSchema),
    defaultValues: { eventDate: today, description: '', planningStage: '', developerName: '', projectedSizeAfter: '' },
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      switch (selectedType) {
        case 'ExpenseEvent':
          return propertyEventsApi.createExpenseEvent(propertyId, data);
        case 'RentalPaymentRequestEvent':
          return propertyEventsApi.createRentalPaymentRequestEvent(propertyId, data);
        case 'PropertyDamageEvent':
          return propertyEventsApi.createPropertyDamageEvent(propertyId, data);
        case 'PlanningProcessEvent':
          return propertyEventsApi.createPlanningProcessEvent(propertyId, data);
        default:
          throw new Error('Unknown event type');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-events', propertyId] });
      onSuccess();
    },
  });

  // ── Step 1: type selection ──
  if (!selectedType) {
    return (
      <Box sx={{ p: 1 }}>
        <Typography variant="subtitle1" fontWeight={600} mb={2} textAlign="center">
          בחר סוג אירוע
        </Typography>
        <Grid container spacing={2}>
          {EVENT_TYPES.map(({ type, label, description, icon, color }) => (
            <Grid item xs={6} key={type}>
              <Card
                variant="outlined"
                sx={{ borderColor: 'divider', '&:hover': { borderColor: color, boxShadow: 2 }, transition: 'all 0.2s' }}
              >
                <CardActionArea onClick={() => setSelectedType(type)} sx={{ p: 1 }}>
                  <CardContent sx={{ textAlign: 'center', p: 1.5 }}>
                    <Box sx={{ color, mb: 1 }}>{icon}</Box>
                    <Typography variant="subtitle2" fontWeight={700}>{label}</Typography>
                    <Typography variant="caption" color="text.secondary">{description}</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 2, textAlign: 'left' }}>
          <Button onClick={onCancel}>ביטול</Button>
        </Box>
      </Box>
    );
  }

  const eventMeta = EVENT_TYPES.find((e) => e.type === selectedType)!;

  // ── Common header ──
  const Header = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      <Box sx={{ color: eventMeta.color }}>{eventMeta.icon}</Box>
      <Typography variant="subtitle1" fontWeight={700}>{eventMeta.label}</Typography>
      <Button size="small" variant="text" sx={{ mr: 'auto' }} onClick={() => setSelectedType(null)}>
        ← שנה סוג
      </Button>
    </Box>
  );

  if (mutation.isError) {
    const errMsg = (mutation.error as any)?.response?.data?.message || 'שגיאה בשמירת האירוע';
    return (
      <Box sx={{ p: 1 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{Array.isArray(errMsg) ? errMsg.join(', ') : errMsg}</Alert>
        <Button onClick={() => mutation.reset()}>נסה שנית</Button>
      </Box>
    );
  }

  // ── Step 2a: Expense form ──
  if (selectedType === 'ExpenseEvent') {
    return (
      <Box component="form" onSubmit={expenseForm.handleSubmit((d) => mutation.mutate(d))} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Header />
        <Controller name="expenseType" control={expenseForm.control} render={({ field }) => (
          <FormControl fullWidth required>
            <InputLabel>סוג הוצאה *</InputLabel>
            <Select {...field} label="סוג הוצאה *">
              {(Object.entries(EXPENSE_TYPE_LABELS) as [ExpenseEventType, string][]).map(([v, l]) => (
                <MenuItem key={v} value={v}>{l}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )} />
        <TextField label="סכום (₪) *" type="number" {...expenseForm.register('amount')} error={!!expenseForm.formState.errors.amount} helperText={expenseForm.formState.errors.amount?.message} fullWidth inputProps={{ min: 0.01, step: 0.01 }} />
        <TextField label="תאריך *" type="date" {...expenseForm.register('eventDate')} fullWidth InputLabelProps={{ shrink: true }} />
        <TextField label="תיאור" {...expenseForm.register('description')} fullWidth multiline rows={2} />
        <Controller name="affectsPropertyValue" control={expenseForm.control} render={({ field }) => (
          <FormControlLabel control={<Switch {...field} checked={!!field.value} />} label="משפיע על שווי הנכס" />
        )} />
        <Divider />
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button onClick={onCancel}>ביטול</Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>{mutation.isPending ? 'שומר...' : 'שמור'}</Button>
        </Box>
      </Box>
    );
  }

  // ── Step 2b: Rental payment form ──
  if (selectedType === 'RentalPaymentRequestEvent') {
    return (
      <Box component="form" onSubmit={rentalForm.handleSubmit((d) => mutation.mutate(d))} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Header />
        <Controller name="rentalAgreementId" control={rentalForm.control} render={({ field }) => (
          <FormControl fullWidth required error={!!rentalForm.formState.errors.rentalAgreementId}>
            <InputLabel>חוזה שכירות *</InputLabel>
            <Select {...field} label="חוזה שכירות *">
              {leases.map((l) => (
                <MenuItem key={l.id} value={l.id}>
                  {l.property?.address || 'נכס'} - {l.tenant?.name || 'דייר'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )} />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Controller name="month" control={rentalForm.control} render={({ field }) => (
              <FormControl fullWidth required>
                <InputLabel>חודש *</InputLabel>
                <Select {...field} label="חודש *">
                  {MONTHS.map((m, i) => <MenuItem key={i + 1} value={i + 1}>{m}</MenuItem>)}
                </Select>
              </FormControl>
            )} />
          </Grid>
          <Grid item xs={6}>
            <TextField label="שנה *" type="number" {...rentalForm.register('year')} fullWidth inputProps={{ min: 2000, max: 2100 }} />
          </Grid>
        </Grid>
        <TextField label="סכום לגבייה (₪) *" type="number" {...rentalForm.register('amountDue')} error={!!rentalForm.formState.errors.amountDue} helperText={rentalForm.formState.errors.amountDue?.message} fullWidth inputProps={{ min: 0.01, step: 0.01 }} />
        <Controller name="paymentStatus" control={rentalForm.control} render={({ field }) => (
          <FormControl fullWidth>
            <InputLabel>סטטוס תשלום</InputLabel>
            <Select {...field} label="סטטוס תשלום">
              {(Object.entries(PAYMENT_STATUS_LABELS) as [RentalPaymentStatus, string][]).map(([v, l]) => (
                <MenuItem key={v} value={v}>{l}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )} />
        <TextField label="תאריך דרישה *" type="date" {...rentalForm.register('eventDate')} fullWidth InputLabelProps={{ shrink: true }} />
        <TextField label="תאריך תשלום בפועל" type="date" {...rentalForm.register('paymentDate')} fullWidth InputLabelProps={{ shrink: true }} />
        <TextField label="תיאור" {...rentalForm.register('description')} fullWidth multiline rows={2} />
        <Divider />
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button onClick={onCancel}>ביטול</Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>{mutation.isPending ? 'שומר...' : 'שמור'}</Button>
        </Box>
      </Box>
    );
  }

  // ── Step 2c: Damage form ──
  if (selectedType === 'PropertyDamageEvent') {
    return (
      <Box component="form" onSubmit={damageForm.handleSubmit((d) => mutation.mutate(d))} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Header />
        <TextField label="תאריך *" type="date" {...damageForm.register('eventDate')} fullWidth InputLabelProps={{ shrink: true }} />
        <TextField label="סוג נזק" {...damageForm.register('damageType')} fullWidth placeholder='לדוגמה: נזק מים, שבר, שריפה' />
        <TextField label="עלות נזק משוערת (₪)" type="number" {...damageForm.register('estimatedDamageCost')} fullWidth inputProps={{ min: 0, step: 0.01 }} />
        <TextField label="תיאור" {...damageForm.register('description')} fullWidth multiline rows={3} />
        <Divider />
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button onClick={onCancel}>ביטול</Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>{mutation.isPending ? 'שומר...' : 'שמור'}</Button>
        </Box>
      </Box>
    );
  }

  // ── Step 2d: Planning form ──
  return (
    <Box component="form" onSubmit={planningForm.handleSubmit((d) => mutation.mutate(d))} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Header />
      <TextField label="תאריך *" type="date" {...planningForm.register('eventDate')} fullWidth InputLabelProps={{ shrink: true }} />
      <TextField label="שלב תכנון" {...planningForm.register('planningStage')} fullWidth placeholder='לדוגמה: הגשת תב"ע, אישור, בנייה' />
      <TextField label="שם יזם / חברה" {...planningForm.register('developerName')} fullWidth />
      <TextField label="גודל צפוי לאחר תכנון" {...planningForm.register('projectedSizeAfter')} fullWidth placeholder='לדוגמה: 120 מ"ר' />
      <TextField label="תיאור" {...planningForm.register('description')} fullWidth multiline rows={3} />
      <Divider />
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button onClick={onCancel}>ביטול</Button>
        <Button type="submit" variant="contained" disabled={mutation.isPending}>{mutation.isPending ? 'שומר...' : 'שמור'}</Button>
      </Box>
    </Box>
  );
}
