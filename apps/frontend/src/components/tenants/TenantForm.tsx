'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Box, Button, TextField, Alert } from '@mui/material';
import { tenantsApi, Tenant, CreateTenantDto } from '@/lib/api/tenants';

const tenantSchema = z.object({
  name: z.string().min(2, 'שם חייב להכיל לפחות 2 תווים'),
  email: z.string().email('כתובת אימייל לא תקינה').optional().or(z.literal('')),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

type TenantFormData = z.infer<typeof tenantSchema>;

interface TenantFormProps {
  tenant?: Tenant | null;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Form for creating/editing a tenant.
 */
export default function TenantForm({ tenant, onSuccess, onCancel }: TenantFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      name: tenant?.name || '',
      email: tenant?.email || '',
      phone: tenant?.phone || '',
      notes: tenant?.notes || '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateTenantDto) =>
      tenant ? tenantsApi.update(tenant.id, data) : tenantsApi.create(data),
    onSuccess,
  });

  const onSubmit = (data: TenantFormData) => {
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
            'שגיאה בשמירת הדייר'}
        </Alert>
      )}

      <TextField
        label="שם מלא"
        {...register('name')}
        error={!!errors.name}
        helperText={errors.name?.message}
        required
        fullWidth
        autoFocus
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
        <Button
          type="submit"
          variant="contained"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'שומר...' : tenant ? 'עדכן' : 'צור'}
        </Button>
      </Box>
    </Box>
  );
}
