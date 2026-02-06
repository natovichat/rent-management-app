'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Box, Button, TextField, Alert, FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import {
  BankAccount,
  CreateBankAccountDto,
  bankAccountsApi,
} from '@/lib/api/bank-accounts';
import { useQueryClient } from '@tanstack/react-query';

const bankAccountSchema = z.object({
  bankName: z.string().min(1, 'שם בנק הוא שדה חובה'),
  branchNumber: z.string().optional(),
  accountNumber: z.string().min(1, 'מספר חשבון הוא שדה חובה'),
  accountType: z.enum(['CHECKING', 'SAVINGS', 'BUSINESS']).optional(),
  accountHolder: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
});

type BankAccountFormData = z.infer<typeof bankAccountSchema>;

interface BankAccountFormProps {
  account?: BankAccount | null;
  onSuccess: (createdAccount?: BankAccount) => void;
  onCancel: () => void;
}

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  CHECKING: 'עו"ש',
  SAVINGS: 'חסכון',
  BUSINESS: 'עסקי',
};

/**
 * Form for creating/editing a bank account.
 */
export default function BankAccountForm({
  account,
  onSuccess,
  onCancel,
}: BankAccountFormProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<BankAccountFormData>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      bankName: account?.bankName || '',
      branchNumber: account?.branchNumber || '',
      accountNumber: account?.accountNumber || '',
      accountType: account?.accountType || 'CHECKING',
      accountHolder: account?.accountHolder || '',
      notes: account?.notes || '',
      isActive: account?.isActive ?? true,
    },
  });

  const accountType = watch('accountType');

  const mutation = useMutation({
    mutationFn: (data: CreateBankAccountDto) =>
      account
        ? bankAccountsApi.updateBankAccount(account.id, data)
        : bankAccountsApi.createBankAccount(data),
    onSuccess: (createdAccount) => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      onSuccess(createdAccount);
    },
  });

  const onSubmit = (data: BankAccountFormData) => {
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
            'שגיאה בשמירת חשבון בנק'}
        </Alert>
      )}

      <TextField
        label="שם בנק *"
        {...register('bankName')}
        error={!!errors.bankName}
        helperText={errors.bankName?.message}
        required
        fullWidth
        autoFocus
      />

      <TextField
        label="מספר סניף"
        {...register('branchNumber')}
        error={!!errors.branchNumber}
        helperText={errors.branchNumber?.message}
        fullWidth
      />

      <TextField
        label="מספר חשבון *"
        {...register('accountNumber')}
        error={!!errors.accountNumber}
        helperText={errors.accountNumber?.message}
        required
        fullWidth
      />

      <FormControl fullWidth error={!!errors.accountType}>
        <InputLabel>סוג חשבון</InputLabel>
        <Select
          {...register('accountType')}
          value={accountType || 'CHECKING'}
          label="סוג חשבון"
        >
          {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </Select>
        {errors.accountType && (
          <FormHelperText>{errors.accountType.message}</FormHelperText>
        )}
      </FormControl>

      <TextField
        label="בעל חשבון"
        {...register('accountHolder')}
        error={!!errors.accountHolder}
        helperText={errors.accountHolder?.message}
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
          {mutation.isPending ? 'שומר...' : account ? 'עדכן' : 'צור'}
        </Button>
      </Box>
    </Box>
  );
}
