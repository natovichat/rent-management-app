'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Box, Button, TextField, Alert, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import {
  Owner,
  CreateOwnerDto,
  OwnerType,
  ownersApi,
} from '@/lib/api/owners';
import { useQueryClient } from '@tanstack/react-query';

const ownerSchema = z.object({
  name: z.string().min(1, 'שם הוא שדה חובה'),
  type: z.enum(['INDIVIDUAL', 'COMPANY', 'PARTNERSHIP'], {
    required_error: 'סוג בעלים הוא שדה חובה',
  }),
  idNumber: z.string().optional(),
  email: z.string().email('כתובת אימייל לא תקינה').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type OwnerFormData = z.infer<typeof ownerSchema>;

const OWNER_TYPE_OPTIONS: { value: OwnerType; label: string }[] = [
  { value: 'INDIVIDUAL', label: 'יחיד' },
  { value: 'COMPANY', label: 'חברה' },
  { value: 'PARTNERSHIP', label: 'שותפות' },
];

interface OwnerFormProps {
  owner?: Owner | null;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Form for creating/editing an owner.
 */
export default function OwnerForm({
  owner,
  onSuccess,
  onCancel,
}: OwnerFormProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OwnerFormData>({
    resolver: zodResolver(ownerSchema),
    defaultValues: {
      name: owner?.name || '',
      type: owner?.type || 'INDIVIDUAL',
      idNumber: owner?.idNumber || '',
      email: owner?.email || '',
      phone: owner?.phone || '',
      address: owner?.address || '',
      notes: owner?.notes || '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateOwnerDto) =>
      owner
        ? ownersApi.updateOwner(owner.id, data)
        : ownersApi.createOwner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners'] });
      onSuccess();
    },
  });

  const onSubmit = (data: OwnerFormData) => {
    mutation.mutate(data);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}
    >
      {mutation.isError && (
        <Alert severity="error">
          {(mutation.error as any)?.response?.data?.message ||
            'שגיאה בשמירת בעלים'}
        </Alert>
      )}

      <TextField
        label="שם מלא *"
        {...register('name')}
        error={!!errors.name}
        helperText={errors.name?.message}
        required
        fullWidth
        autoFocus
      />

      <FormControl fullWidth required error={!!errors.type}>
        <InputLabel>סוג בעלים *</InputLabel>
        <Select
          value={watch('type')}
          onChange={(e) => setValue('type', e.target.value as OwnerType)}
          label="סוג בעלים *"
        >
          {OWNER_TYPE_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {errors.type && (
          <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 1.75 }}>
            {errors.type.message}
          </Box>
        )}
      </FormControl>

      <TextField
        label="מספר ת.ז./ח.פ."
        {...register('idNumber')}
        error={!!errors.idNumber}
        helperText={errors.idNumber?.message}
        fullWidth
        placeholder="123456789"
      />

      <TextField
        label="אימייל"
        type="email"
        {...register('email')}
        error={!!errors.email}
        helperText={errors.email?.message}
        fullWidth
      />

      <TextField
        label="טלפון"
        {...register('phone')}
        error={!!errors.phone}
        helperText={errors.phone?.message}
        fullWidth
        placeholder="050-1234567"
      />

      <TextField
        label="כתובת"
        {...register('address')}
        error={!!errors.address}
        helperText={errors.address?.message}
        fullWidth
      />

      <TextField
        label="הערות"
        {...register('notes')}
        error={!!errors.notes}
        helperText={errors.notes?.message}
        fullWidth
        multiline
        rows={3}
      />

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
        <Button onClick={onCancel} disabled={mutation.isPending}>
          ביטול
        </Button>
        <Button type="submit" variant="contained" disabled={mutation.isPending}>
          {mutation.isPending ? 'שומר...' : owner ? 'עדכן' : 'צור'}
        </Button>
      </Box>
    </Box>
  );
}
