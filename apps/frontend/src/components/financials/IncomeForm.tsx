/**
 * IncomeForm - Form for creating/editing property income
 * 
 * Features:
 * - Create/Edit income with all fields
 * - Income type dropdown (RENT, SALE, CAPITAL_GAIN, OTHER)
 * - Source field (optional)
 * - Amount validation
 * - Date picker
 * - RTL support
 * - Hebrew labels
 */

'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IncomeType, CreateIncomeDto, Income } from '@/lib/api/financials';

interface IncomeFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateIncomeDto) => Promise<void>;
  propertyId?: string;
  initialData?: Income;
  properties?: Array<{ id: string; address: string }>;
}

const incomeSchema = z.object({
  propertyId: z.string().min(1, 'נכס הוא שדה חובה'),
  incomeDate: z.string().min(1, 'תאריך הוא שדה חובה'),
  amount: z.number().min(0.01, 'סכום חייב להיות חיובי'),
  incomeType: z.nativeEnum(IncomeType, {
    errorMap: () => ({ message: 'סוג הכנסה הוא שדה חובה' }),
  }),
  source: z.string().optional(),
  description: z.string().optional(),
});

type IncomeFormData = z.infer<typeof incomeSchema>;

const INCOME_TYPE_LABELS: Record<IncomeType, string> = {
  [IncomeType.RENT]: 'דמי שכירות',
  [IncomeType.SALE]: 'מכירה',
  [IncomeType.CAPITAL_GAIN]: 'רווח הון',
  [IncomeType.OTHER]: 'אחר',
};

export const IncomeForm: React.FC<IncomeFormProps> = ({
  open,
  onClose,
  onSubmit,
  propertyId,
  initialData,
  properties,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: initialData
      ? {
          propertyId: initialData.propertyId,
          incomeDate: initialData.incomeDate.split('T')[0],
          amount: Number(initialData.amount),
          incomeType: initialData.type,
          source: initialData.source || '',
          description: initialData.description || '',
        }
      : {
          propertyId: propertyId || '',
          incomeDate: new Date().toISOString().split('T')[0],
          amount: 0,
          incomeType: IncomeType.RENT,
          source: '',
          description: '',
        },
  });

  React.useEffect(() => {
    if (initialData) {
      reset({
        incomeDate: initialData.incomeDate.split('T')[0],
        amount: Number(initialData.amount),
        incomeType: initialData.type,
        source: initialData.source || '',
        description: initialData.description || '',
      });
    } else {
      reset({
        incomeDate: new Date().toISOString().split('T')[0],
        amount: 0,
        incomeType: IncomeType.RENT,
        source: '',
        description: '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data: IncomeFormData) => {
    try {
      await onSubmit({
        propertyId: data.propertyId,
        incomeDate: new Date(data.incomeDate).toISOString(),
        amount: data.amount,
        incomeType: data.incomeType,
        source: data.source,
        description: data.description,
      });
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting income:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} sx={{ direction: 'rtl' }}>
        <DialogTitle>{initialData ? 'ערוך הכנסה' : 'הוסף הכנסה'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Controller
              name="propertyId"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.propertyId}>
                  <InputLabel>נכס *</InputLabel>
                  <Select {...field} label="נכס *" disabled={!properties || properties.length === 0}>
                    {properties && properties.length > 0 ? (
                      properties.map((property) => (
                        <MenuItem key={property.id} value={property.id}>
                          {property.address}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="" disabled>
                        אין נכסים במערכת - יש ליצור נכס תחילה
                      </MenuItem>
                    )}
                  </Select>
                  {errors.propertyId && (
                    <FormHelperText>{errors.propertyId.message}</FormHelperText>
                  )}
                  {(!properties || properties.length === 0) && (
                    <FormHelperText sx={{ color: 'warning.main' }}>
                      יש ליצור נכס לפני יצירת הכנסה
                    </FormHelperText>
                  )}
                </FormControl>
              )}
            />
            <Controller
              name="incomeDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="תאריך הכנסה *"
                  type="date"
                  fullWidth
                  error={!!errors.incomeDate}
                  helperText={errors.incomeDate?.message}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />

            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="סכום (₪) *"
                  type="number"
                  fullWidth
                  error={!!errors.amount}
                  helperText={errors.amount?.message}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              )}
            />

            <Controller
              name="incomeType"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.incomeType}>
                  <InputLabel>סוג הכנסה *</InputLabel>
                  <Select {...field} label="סוג הכנסה *">
                    {Object.entries(INCOME_TYPE_LABELS).map(([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.incomeType && (
                    <FormHelperText>{errors.incomeType.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />

            <Controller
              name="source"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="מקור הכנסה"
                  fullWidth
                  error={!!errors.source}
                  helperText={errors.source?.message}
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="תיאור"
                  fullWidth
                  multiline
                  rows={3}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            ביטול
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'שומר...' : initialData ? 'עדכן' : 'צור'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default IncomeForm;
