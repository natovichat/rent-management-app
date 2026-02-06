'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Box, Button, TextField, Alert } from '@mui/material';
import {
  InvestmentCompany,
  CreateInvestmentCompanyDto,
  investmentCompaniesApi,
} from '@/services/investmentCompanies';
import { useQueryClient } from '@tanstack/react-query';

const investmentCompanySchema = z.object({
  name: z.string().min(1, 'שם הוא שדה חובה'),
  registrationNumber: z.string().optional(),
  country: z.string().optional(),
  investmentAmount: z.number().min(0, 'סכום השקעה חייב להיות חיובי').optional().or(z.literal(0)),
  ownershipPercentage: z.number().min(0).max(100, 'אחוז בעלות חייב להיות בין 0 ל-100').optional().or(z.literal(0)),
  notes: z.string().optional(),
});

type InvestmentCompanyFormData = z.infer<typeof investmentCompanySchema>;

interface InvestmentCompanyFormProps {
  company?: InvestmentCompany | null;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Form for creating/editing an investment company.
 */
export default function InvestmentCompanyForm({
  company,
  onSuccess,
  onCancel,
}: InvestmentCompanyFormProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InvestmentCompanyFormData>({
    resolver: zodResolver(investmentCompanySchema),
    defaultValues: {
      name: company?.name || '',
      registrationNumber: company?.registrationNumber || '',
      country: company?.country || 'Israel',
      investmentAmount: company?.investmentAmount || undefined,
      ownershipPercentage: company?.ownershipPercentage || undefined,
      notes: company?.notes || '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateInvestmentCompanyDto) =>
      company
        ? investmentCompaniesApi.update(company.id, data)
        : investmentCompaniesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment-companies'] });
      onSuccess();
    },
  });

  const onSubmit = (data: InvestmentCompanyFormData) => {
    mutation.mutate(data);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}
    >
      <TextField
        label="שם חברת השקעה *"
        {...register('name')}
        error={!!errors.name}
        helperText={errors.name?.message}
        required
        fullWidth
        autoFocus
      />

      <TextField
        label="מספר רישום"
        {...register('registrationNumber')}
        error={!!errors.registrationNumber}
        helperText={errors.registrationNumber?.message}
        fullWidth
      />

      <TextField
        label="מדינה"
        {...register('country')}
        error={!!errors.country}
        helperText={errors.country?.message}
        fullWidth
        defaultValue="Israel"
      />

      <TextField
        label="סכום השקעה (₪)"
        type="number"
        {...register('investmentAmount', { valueAsNumber: true })}
        error={!!errors.investmentAmount}
        helperText={errors.investmentAmount?.message}
        fullWidth
        InputProps={{
          inputProps: { min: 0, step: 0.01 },
        }}
      />

      <TextField
        label="אחוז בעלות (%)"
        type="number"
        {...register('ownershipPercentage', { valueAsNumber: true })}
        error={!!errors.ownershipPercentage}
        helperText={errors.ownershipPercentage?.message}
        fullWidth
        InputProps={{
          inputProps: { min: 0, max: 100, step: 0.01 },
        }}
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

      {mutation.isError && (
        <Alert severity="error">
          {(mutation.error as any)?.response?.data?.message ||
            'שגיאה בשמירת חברת השקעה'}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
        <Button onClick={onCancel} disabled={mutation.isPending}>
          ביטול
        </Button>
        <Button type="submit" variant="contained" disabled={mutation.isPending}>
          {mutation.isPending ? 'שומר...' : company ? 'עדכן' : 'צור'}
        </Button>
      </Box>
    </Box>
  );
}
