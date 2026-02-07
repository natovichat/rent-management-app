/**
 * ExpenseForm - Form for creating/editing property expenses
 * 
 * Features:
 * - Create/Edit expense with all fields
 * - Expense type dropdown (MAINTENANCE, TAX, INSURANCE, etc.)
 * - Category field
 * - Amount validation
 * - Date picker
 * - Payment method (optional)
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
import { ExpenseType, CreateExpenseDto, Expense } from '@/lib/api/financials';

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateExpenseDto) => Promise<void>;
  propertyId?: string;
  initialData?: Expense;
  properties?: Array<{ id: string; address: string }>;
}

const expenseSchema = z.object({
  propertyId: z.string().min(1, 'נכס הוא שדה חובה'),
  expenseDate: z.string().min(1, 'תאריך הוא שדה חובה'),
  amount: z.number().min(0.01, 'סכום חייב להיות חיובי'),
  expenseType: z.nativeEnum(ExpenseType, {
    errorMap: () => ({ message: 'סוג הוצאה הוא שדה חובה' }),
  }),
  category: z.string().min(1, 'קטגוריה היא שדה חובה'),
  description: z.string().optional(),
  paymentMethod: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

const EXPENSE_TYPE_LABELS: Record<ExpenseType, string> = {
  [ExpenseType.MAINTENANCE]: 'תחזוקה',
  [ExpenseType.TAX]: 'מס',
  [ExpenseType.INSURANCE]: 'ביטוח',
  [ExpenseType.UTILITIES]: 'חשמל/מים/גז',
  [ExpenseType.RENOVATION]: 'שיפוץ',
  [ExpenseType.LEGAL]: 'משפטי',
  [ExpenseType.OTHER]: 'אחר',
};

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
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
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: initialData
      ? {
          propertyId: initialData.propertyId,
          expenseDate: initialData.expenseDate.split('T')[0],
          amount: Number(initialData.amount),
          expenseType: initialData.type,
          category: initialData.category,
          description: initialData.description || '',
          paymentMethod: initialData.paymentMethod || '',
        }
      : {
          propertyId: propertyId || '',
          expenseDate: new Date().toISOString().split('T')[0],
          amount: 0,
          expenseType: ExpenseType.MAINTENANCE,
          category: '',
          description: '',
          paymentMethod: '',
        },
  });

  React.useEffect(() => {
    if (initialData) {
      reset({
        expenseDate: initialData.expenseDate.split('T')[0],
        amount: Number(initialData.amount),
        expenseType: initialData.type,
        category: initialData.category,
        description: initialData.description || '',
        paymentMethod: initialData.paymentMethod || '',
      });
    } else {
      reset({
        expenseDate: new Date().toISOString().split('T')[0],
        amount: 0,
        expenseType: ExpenseType.MAINTENANCE,
        category: '',
        description: '',
        paymentMethod: '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data: ExpenseFormData) => {
    try {
      await onSubmit({
        propertyId: data.propertyId,
        expenseDate: new Date(data.expenseDate).toISOString(),
        amount: data.amount,
        expenseType: data.expenseType,
        category: data.category,
        description: data.description,
        paymentMethod: data.paymentMethod,
      });
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting expense:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} sx={{ direction: 'rtl' }}>
        <DialogTitle>{initialData ? 'ערוך הוצאה' : 'הוסף הוצאה'}</DialogTitle>
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
                      יש ליצור נכס לפני יצירת הוצאה
                    </FormHelperText>
                  )}
                </FormControl>
              )}
            />
            <Controller
              name="expenseDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="תאריך הוצאה *"
                  type="date"
                  fullWidth
                  error={!!errors.expenseDate}
                  helperText={errors.expenseDate?.message}
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
              name="expenseType"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.expenseType}>
                  <InputLabel>סוג הוצאה *</InputLabel>
                  <Select {...field} label="סוג הוצאה *">
                    {Object.entries(EXPENSE_TYPE_LABELS).map(([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.expenseType && (
                    <FormHelperText>{errors.expenseType.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />

            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="קטגוריה *"
                  fullWidth
                  error={!!errors.category}
                  helperText={errors.category?.message}
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

            <Controller
              name="paymentMethod"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="אמצעי תשלום"
                  fullWidth
                  error={!!errors.paymentMethod}
                  helperText={errors.paymentMethod?.message}
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

export default ExpenseForm;
