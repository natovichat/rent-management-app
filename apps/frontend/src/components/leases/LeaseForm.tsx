'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  TextField,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  RentalAgreement,
  rentalAgreementsApi,
  CreateRentalAgreementDto,
  RentalAgreementStatus,
} from '@/lib/api/leases';
import { propertiesApi } from '@/lib/api/properties';
import { personsApi } from '@/lib/api/persons';

const leaseSchema = z.object({
  propertyId: z.string().min(1, 'נכס הוא שדה חובה'),
  tenantId: z.string().min(1, 'שוכר הוא שדה חובה'),
  monthlyRent: z.coerce.number().min(1, 'שכ"ד חייב להיות גדול מ-0'),
  startDate: z.string().min(1, 'תאריך התחלה הוא שדה חובה'),
  endDate: z.string().min(1, 'תאריך סיום הוא שדה חובה'),
  status: z.enum(['FUTURE', 'ACTIVE', 'EXPIRED', 'TERMINATED']).default('ACTIVE'),
  hasExtensionOption: z.boolean().optional(),
  extensionUntilDate: z.string().optional(),
  extensionMonthlyRent: z.union([z.number(), z.string()]).optional().transform((v) => (v === '' || v === undefined ? undefined : Number(v))),
  notes: z.string().optional(),
});

type LeaseFormData = z.infer<typeof leaseSchema>;

const formatDateForInput = (dateString?: string) => {
  if (!dateString) return '';
  return new Date(dateString).toISOString().split('T')[0];
};

interface LeaseFormProps {
  lease?: RentalAgreement | null;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Form for creating/editing a rental agreement (lease).
 */
export default function LeaseForm({ lease, onSuccess, onCancel }: LeaseFormProps) {
  const queryClient = useQueryClient();

  const { data: propertiesData } = useQuery({
    queryKey: ['properties-for-lease'],
    queryFn: () => propertiesApi.getProperties(1, 100),
  });

  const { data: personsData } = useQuery({
    queryKey: ['persons-for-lease'],
    queryFn: () => personsApi.getPersons(1, 100),
  });

  const properties = propertiesData?.data || [];
  const persons = personsData?.data || [];

  const mutation = useMutation({
    mutationFn: (data: CreateRentalAgreementDto) =>
      lease
        ? rentalAgreementsApi.updateRentalAgreement(lease.id, data)
        : rentalAgreementsApi.createRentalAgreement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rental-agreements'] });
      onSuccess();
    },
  });

  const defaultValues: LeaseFormData = {
    propertyId: lease?.propertyId || '',
    tenantId: lease?.tenantId || '',
    monthlyRent: lease?.monthlyRent ?? 0,
    startDate: formatDateForInput(lease?.startDate) || '',
    endDate: formatDateForInput(lease?.endDate) || '',
    status: (lease?.status as RentalAgreementStatus) || 'ACTIVE',
    hasExtensionOption: lease?.hasExtensionOption ?? false,
    extensionUntilDate: formatDateForInput(lease?.extensionUntilDate) || '',
    extensionMonthlyRent: lease?.extensionMonthlyRent ?? undefined,
    notes: lease?.notes || '',
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<LeaseFormData>({
    resolver: zodResolver(leaseSchema),
    defaultValues,
  });

  useEffect(() => {
    reset({
      propertyId: lease?.propertyId || '',
      tenantId: lease?.tenantId || '',
      monthlyRent: lease?.monthlyRent ?? 0,
      startDate: formatDateForInput(lease?.startDate) || '',
      endDate: formatDateForInput(lease?.endDate) || '',
      status: (lease?.status as RentalAgreementStatus) || 'ACTIVE',
      hasExtensionOption: lease?.hasExtensionOption ?? false,
      extensionUntilDate: formatDateForInput(lease?.extensionUntilDate) || '',
      extensionMonthlyRent: lease?.extensionMonthlyRent ?? undefined,
      notes: lease?.notes || '',
    });
  }, [lease?.id, reset]);

  const hasExtensionOption = watch('hasExtensionOption');

  const onSubmit = (data: LeaseFormData) => {
    mutation.mutate({
      propertyId: data.propertyId,
      tenantId: data.tenantId,
      monthlyRent: Number(data.monthlyRent),
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status,
      hasExtensionOption: data.hasExtensionOption,
      extensionUntilDate: data.hasExtensionOption ? data.extensionUntilDate : undefined,
      extensionMonthlyRent: data.hasExtensionOption && data.extensionMonthlyRent
        ? Number(data.extensionMonthlyRent)
        : undefined,
      notes: data.notes || undefined,
    });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}
    >
      {mutation.isError && (
        <Alert severity="error">
          {(mutation.error as any)?.response?.data?.message || 'שגיאה בשמירת חוזה'}
        </Alert>
      )}

      <Controller
        name="propertyId"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth error={!!errors.propertyId} required>
            <InputLabel>נכס *</InputLabel>
            <Select {...field} value={field.value ?? ''} label="נכס *" error={!!errors.propertyId}>
              {properties.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.address}
                  {p.fileNumber ? ` (${p.fileNumber})` : ''}
                </MenuItem>
              ))}
            </Select>
            {errors.propertyId && (
              <Alert severity="error" sx={{ mt: 0.5 }}>
                {errors.propertyId.message}
              </Alert>
            )}
          </FormControl>
        )}
      />

      <Controller
        name="tenantId"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth error={!!errors.tenantId} required>
            <InputLabel>שוכר *</InputLabel>
            <Select {...field} value={field.value ?? ''} label="שוכר *" error={!!errors.tenantId}>
              {persons.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                  {p.email ? ` (${p.email})` : ''}
                </MenuItem>
              ))}
            </Select>
            {errors.tenantId && (
              <Alert severity="error" sx={{ mt: 0.5 }}>
                {errors.tenantId.message}
              </Alert>
            )}
          </FormControl>
        )}
      />

      <TextField
        label='שכ"ד חודשי *'
        type="number"
        {...register('monthlyRent', { valueAsNumber: true })}
        error={!!errors.monthlyRent}
        helperText={errors.monthlyRent?.message}
        required
        fullWidth
        inputProps={{ min: 1, step: 1 }}
      />

      <TextField
        label="תאריך התחלה *"
        type="date"
        {...register('startDate')}
        error={!!errors.startDate}
        helperText={errors.startDate?.message}
        required
        fullWidth
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        label="תאריך סיום *"
        type="date"
        {...register('endDate')}
        error={!!errors.endDate}
        helperText={errors.endDate?.message}
        required
        fullWidth
        InputLabelProps={{ shrink: true }}
      />

      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth required>
            <InputLabel>סטטוס *</InputLabel>
            <Select {...field} label="סטטוס *">
              <MenuItem value="FUTURE">עתידי</MenuItem>
              <MenuItem value="ACTIVE">פעיל</MenuItem>
              <MenuItem value="EXPIRED">פג תוקף</MenuItem>
              <MenuItem value="TERMINATED">הופסק</MenuItem>
            </Select>
          </FormControl>
        )}
      />

      <Controller
        name="hasExtensionOption"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={<Switch {...field} checked={field.value} />}
            label="אפשרות הארכה"
          />
        )}
      />

      {hasExtensionOption && (
        <>
          <TextField
            label="תאריך הארכה עד"
            type="date"
            {...register('extensionUntilDate')}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label='שכ"ד בהארכה'
            type="number"
            {...register('extensionMonthlyRent', { valueAsNumber: true })}
            fullWidth
            inputProps={{ min: 0, step: 1 }}
          />
        </>
      )}

      <TextField
        label="הערות"
        {...register('notes')}
        multiline
        rows={3}
        fullWidth
      />

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
        <Button onClick={onCancel}>ביטול</Button>
        <Button
          type="submit"
          variant="contained"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'שומר...' : lease ? 'עדכן' : 'צור חוזה'}
        </Button>
      </Box>
    </Box>
  );
}
