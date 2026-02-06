'use client';

import { useState, useEffect } from 'react';
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
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
  Chip,
  Snackbar,
} from '@mui/material';
import { mortgagesApi, Mortgage, CreateMortgageDto } from '@/lib/api/mortgages';

type MortgageStatus = 'ACTIVE' | 'PAID_OFF' | 'REFINANCED' | 'DEFAULTED';
import { propertiesApi } from '@/services/properties';
import { bankAccountsApi, CreateBankAccountDto, BankAccount } from '@/lib/api/bank-accounts';
import BankAccountForm from '@/components/bank-accounts/BankAccountForm';

const mortgageSchema = z.object({
  propertyId: z.string().min(1, 'נכס הוא שדה חובה'),
  bank: z.string().min(1, 'שם הבנק הוא שדה חובה'),
  loanAmount: z.number().min(0.01, 'סכום הלוואה חייב להיות חיובי'),
  interestRate: z.number().min(0).max(100).optional(),
  monthlyPayment: z.number().min(0).optional(),
  startDate: z.string().min(1, 'תאריך התחלה הוא שדה חובה'),
  endDate: z.string().optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'PAID_OFF', 'REFINANCED', 'DEFAULTED']),
  bankAccountId: z.string().optional().or(z.literal('')),
  linkedProperties: z.array(z.string()).optional(),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.endDate && data.startDate) {
    return new Date(data.endDate) > new Date(data.startDate);
  }
  return true;
}, {
  message: 'תאריך הסיום חייב להיות אחרי תאריך ההתחלה',
  path: ['endDate'],
});

type MortgageFormData = z.infer<typeof mortgageSchema>;

interface MortgageFormProps {
  mortgage?: Mortgage | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  propertyId?: string; // Pre-fill property if creating from property page
}

/**
 * Form for creating/editing a mortgage.
 */
export default function MortgageForm({
  mortgage,
  open,
  onClose,
  onSuccess,
  propertyId: preFilledPropertyId,
}: MortgageFormProps) {
  const queryClient = useQueryClient();
  const [createBankAccountDialogOpen, setCreateBankAccountDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Fetch properties and bank accounts
  const { data: propertiesData } = useQuery({
    queryKey: ['properties', 'all'],
    queryFn: () => propertiesApi.getAll(1, 100),
  });

  const { data: bankAccounts = [] } = useQuery({
    queryKey: ['bankAccounts'],
    queryFn: () => bankAccountsApi.getBankAccounts(true), // Only active accounts
  });

  const properties = propertiesData?.data || [];

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<MortgageFormData>({
    resolver: zodResolver(mortgageSchema),
    defaultValues: {
      propertyId: mortgage?.propertyId || preFilledPropertyId || '',
      bank: mortgage?.bank || '',
      loanAmount: mortgage?.loanAmount ? Number(mortgage.loanAmount) : 0.01,
      interestRate: mortgage?.interestRate ? Number(mortgage.interestRate) : undefined,
      monthlyPayment: mortgage?.monthlyPayment ? Number(mortgage.monthlyPayment) : undefined,
      startDate: mortgage?.startDate
        ? mortgage.startDate.split('T')[0]
        : new Date().toISOString().split('T')[0],
      endDate: mortgage?.endDate ? mortgage.endDate.split('T')[0] : '',
      status: mortgage?.status || 'ACTIVE',
      bankAccountId: mortgage?.bankAccountId || '',
      linkedProperties: mortgage?.linkedProperties || [],
      notes: mortgage?.notes || '',
    },
  });

  // Reset form when mortgage changes
  useEffect(() => {
    if (mortgage) {
      reset({
        propertyId: mortgage.propertyId,
        bank: mortgage.bank,
        loanAmount: Number(mortgage.loanAmount),
        interestRate: mortgage.interestRate ? Number(mortgage.interestRate) : undefined,
        monthlyPayment: mortgage.monthlyPayment ? Number(mortgage.monthlyPayment) : undefined,
        startDate: mortgage.startDate.split('T')[0],
        endDate: mortgage.endDate ? mortgage.endDate.split('T')[0] : '',
        status: mortgage.status,
        bankAccountId: mortgage.bankAccountId || '',
        linkedProperties: mortgage.linkedProperties || [],
        notes: mortgage.notes || '',
      });
    } else if (preFilledPropertyId) {
      reset({
        propertyId: preFilledPropertyId,
        bank: '',
        loanAmount: 0.01,
        interestRate: undefined,
        monthlyPayment: undefined,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'ACTIVE',
        bankAccountId: '',
        linkedProperties: [],
        notes: '',
      });
    }
  }, [mortgage, preFilledPropertyId, reset]);

  const handleCreateNewBankAccount = () => {
    setCreateBankAccountDialogOpen(true);
  };

  // Inline bank account creation mutation
  const createBankAccountMutation = useMutation({
    mutationFn: (data: CreateBankAccountDto) => bankAccountsApi.createBankAccount(data),
    onSuccess: (newBankAccount) => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      setCreateBankAccountDialogOpen(false);
      // Auto-select newly created account
      setValue('bankAccountId', newBankAccount.id);
      setSnackbar({
        open: true,
        message: 'חשבון בנק נוצר ונבחר בהצלחה',
        severity: 'success',
      });
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: 'שגיאה ביצירת חשבון בנק',
        severity: 'error',
      });
    },
  });

  const handleBankAccountSuccess = (createdAccount?: BankAccount) => {
    queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
    setCreateBankAccountDialogOpen(false);
    
    // Auto-select newly created account
    if (createdAccount) {
      setValue('bankAccountId', createdAccount.id);
      setSnackbar({
        open: true,
        message: 'חשבון בנק נוצר ונבחר בהצלחה',
        severity: 'success',
      });
    } else {
      setSnackbar({
        open: true,
        message: 'חשבון בנק עודכן בהצלחה',
        severity: 'success',
      });
    }
  };

  const mutation = useMutation({
    mutationFn: (data: CreateMortgageDto) => {
      console.log('[MortgageForm] Mutation called with data:', data);
      const submitData: CreateMortgageDto = {
        propertyId: data.propertyId,
        bank: data.bank,
        loanAmount: data.loanAmount,
        interestRate: data.interestRate,
        monthlyPayment: data.monthlyPayment,
        startDate: data.startDate,
        endDate: data.endDate === '' ? undefined : data.endDate,
        status: data.status,
        bankAccountId: data.bankAccountId === '' ? undefined : data.bankAccountId,
        linkedProperties: data.linkedProperties && data.linkedProperties.length > 0
          ? data.linkedProperties
          : undefined,
        notes: data.notes || undefined,
      };
      console.log('[MortgageForm] Submitting to API:', submitData);
      return mortgage
        ? mortgagesApi.updateMortgage(mortgage.id, submitData)
        : mortgagesApi.createMortgage(submitData);
    },
    onSuccess: (data) => {
      console.log('[MortgageForm] Mutation successful:', data);
      queryClient.invalidateQueries({ queryKey: ['mortgages'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      onSuccess();
    },
    onError: (error) => {
      console.error('[MortgageForm] Mutation error:', error);
    },
  });

  const onSubmit = (data: MortgageFormData) => {
    console.log('[MortgageForm] Form submitted with data:', data);
    mutation.mutate(data);
  };

  const onError = (errors: any) => {
    console.error('[MortgageForm] Form validation errors:', errors);
    console.error('[MortgageForm] Form values:', watch());
  };

  const selectedPropertyId = watch('propertyId');
  const availablePropertiesForLinked = properties.filter(
    (p) => p.id !== selectedPropertyId,
  );

  return (
    <>
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box 
        component="form" 
        onSubmit={handleSubmit(onSubmit, onError)}
        noValidate
      >
        <DialogTitle>
          {mortgage ? 'עריכת משכנתא' : 'משכנתא חדשה'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {mutation.isError && (
              <Alert severity="error">
                שגיאה בשמירת משכנתא. אנא נסה שוב.
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.propertyId}>
                  <InputLabel>נכס *</InputLabel>
                  <Controller
                    name="propertyId"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} label="נכס *" disabled={!!preFilledPropertyId}>
                        {properties.map((property) => (
                          <MenuItem key={property.id} value={property.id}>
                            {property.address} {property.fileNumber ? `(${property.fileNumber})` : ''}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {errors.propertyId && (
                    <Alert severity="error" sx={{ mt: 0.5 }}>
                      {errors.propertyId.message}
                    </Alert>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="שם הבנק *"
                  {...register('bank')}
                  error={!!errors.bank}
                  helperText={errors.bank?.message}
                  fullWidth
                  autoFocus
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="סכום הלוואה *"
                  type="number"
                  {...register('loanAmount', { 
                    valueAsNumber: true,
                    required: true,
                  })}
                  error={!!errors.loanAmount}
                  helperText={errors.loanAmount?.message}
                  fullWidth
                  inputProps={{ min: 0.01, step: 0.01 }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="ריבית (%)"
                  type="number"
                  {...register('interestRate', {
                    valueAsNumber: true,
                    setValueAs: (v) => (v === '' ? '' : Number(v)),
                  })}
                  error={!!errors.interestRate}
                  helperText={errors.interestRate?.message}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="תשלום חודשי"
                  type="number"
                  {...register('monthlyPayment', {
                    valueAsNumber: true,
                    setValueAs: (v) => (v === '' ? '' : Number(v)),
                  })}
                  error={!!errors.monthlyPayment}
                  helperText={errors.monthlyPayment?.message}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormControl fullWidth error={!!errors.status}>
                  <InputLabel>סטטוס *</InputLabel>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} label="סטטוס *">
                        <MenuItem value="ACTIVE">פעיל</MenuItem>
                        <MenuItem value="PAID_OFF">סולק</MenuItem>
                        <MenuItem value="REFINANCED">מימון מחדש</MenuItem>
                        <MenuItem value="DEFAULTED">ברירת מחדל</MenuItem>
                      </Select>
                    )}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="תאריך התחלה *"
                  type="date"
                  {...register('startDate')}
                  error={!!errors.startDate}
                  helperText={errors.startDate?.message}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="תאריך סיום"
                  type="date"
                  {...register('endDate')}
                  error={!!errors.endDate}
                  helperText={errors.endDate?.message}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>חשבון בנק</InputLabel>
                  <Controller
                    name="bankAccountId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        label="חשבון בנק"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '__CREATE_NEW__') {
                            handleCreateNewBankAccount();
                          } else {
                            field.onChange(value);
                          }
                        }}
                      >
                        <MenuItem value="">ללא</MenuItem>
                        {bankAccounts.map((account) => (
                          <MenuItem key={account.id} value={account.id}>
                            {account.bankName} - {account.accountNumber}
                          </MenuItem>
                        ))}
                        <MenuItem
                          value="__CREATE_NEW__"
                          sx={{
                            color: 'primary.main',
                            fontWeight: 600,
                            borderTop: bankAccounts.length > 0 ? 1 : 0,
                            borderColor: 'divider',
                            '&:hover': {
                              backgroundColor: 'primary.lighter',
                            },
                          }}
                        >
                          + צור חשבון בנק חדש
                        </MenuItem>
                      </Select>
                    )}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="linkedProperties"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      multiple
                      options={availablePropertiesForLinked}
                      getOptionLabel={(option) => `${option.address} ${option.fileNumber ? `(${option.fileNumber})` : ''}`}
                      value={properties.filter((p) => field.value?.includes(p.id))}
                      onChange={(_, newValue) => {
                        field.onChange(newValue.map((p) => p.id));
                      }}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            {...getTagProps({ index })}
                            key={option.id}
                            label={`${option.address} ${option.fileNumber ? `(${option.fileNumber})` : ''}`}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="נכסים משועבדים נוספים"
                          placeholder="בחר נכסים"
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="הערות"
                  {...register('notes')}
                  multiline
                  rows={3}
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

    {/* Inline Bank Account Creation Dialog */}
    <Dialog
      open={createBankAccountDialogOpen}
      onClose={() => setCreateBankAccountDialogOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>צור חשבון בנק חדש</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <BankAccountForm
          account={null}
          onSuccess={handleBankAccountSuccess}
          onCancel={() => setCreateBankAccountDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>

    {/* Snackbar for notifications */}
    <Snackbar
      open={snackbar.open}
      autoHideDuration={6000}
      onClose={() => setSnackbar({ ...snackbar, open: false })}
      message={snackbar.message}
    />
  </>
  );
}
