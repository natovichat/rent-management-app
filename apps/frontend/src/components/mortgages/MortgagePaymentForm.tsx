'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  TextField,
  Alert,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { mortgagesApi, CreatePaymentDto } from '@/lib/api/mortgages';

const paymentSchema = z.object({
  paymentDate: z.string().min(1, 'תאריך תשלום הוא שדה חובה'),
  amount: z.number().min(0.01, 'סכום תשלום חייב להיות חיובי'),
  principal: z.number().min(0).optional().or(z.literal('')),
  interest: z.number().min(0).optional().or(z.literal('')),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.principal !== '' && data.interest !== '') {
    return (data.principal as number) + (data.interest as number) <= data.amount;
  }
  return true;
}, {
  message: 'סכום קרן + ריבית לא יכול לעלות על סכום התשלום',
  path: ['principal'],
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface MortgagePaymentFormProps {
  mortgageId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Form for recording a mortgage payment.
 */
export default function MortgagePaymentForm({
  mortgageId,
  open,
  onClose,
  onSuccess,
}: MortgagePaymentFormProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentDate: new Date().toISOString().split('T')[0],
      amount: 0,
      principal: '',
      interest: '',
      notes: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CreatePaymentDto) => mortgagesApi.addPayment(mortgageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mortgages', mortgageId] });
      queryClient.invalidateQueries({ queryKey: ['mortgages'] });
      reset();
      onSuccess();
    },
  });

  const onSubmit = (data: PaymentFormData) => {
    const submitData: CreatePaymentDto = {
      paymentDate: data.paymentDate,
      amount: data.amount,
      principal: data.principal === '' ? undefined : data.principal,
      interest: data.interest === '' ? undefined : data.interest,
      notes: data.notes || undefined,
    };
    mutation.mutate(submitData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>רישום תשלום משכנתא</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {mutation.isError && (
              <Alert severity="error">
                שגיאה ברישום תשלום. אנא נסה שוב.
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="תאריך תשלום *"
                  type="date"
                  {...register('paymentDate')}
                  error={!!errors.paymentDate}
                  helperText={errors.paymentDate?.message}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  autoFocus
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="סכום תשלום *"
                  type="number"
                  {...register('amount', { valueAsNumber: true })}
                  error={!!errors.amount}
                  helperText={errors.amount?.message}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="קרן"
                  type="number"
                  {...register('principal', {
                    valueAsNumber: true,
                    setValueAs: (v) => (v === '' ? '' : Number(v)),
                  })}
                  error={!!errors.principal}
                  helperText={errors.principal?.message}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="ריבית"
                  type="number"
                  {...register('interest', {
                    valueAsNumber: true,
                    setValueAs: (v) => (v === '' ? '' : Number(v)),
                  })}
                  error={!!errors.interest}
                  helperText={errors.interest?.message}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="הערות"
                  {...register('notes')}
                  multiline
                  rows={2}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>ביטול</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'שומר...' : 'שמור'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
