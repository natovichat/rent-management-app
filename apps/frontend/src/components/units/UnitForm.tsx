'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  FormHelperText,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { Unit, CreateUnitDto, unitsApi } from '@/lib/api/units';
import { propertiesApi } from '@/lib/api/properties';
import { useState } from 'react';

const unitSchema = z.object({
  propertyId: z.string().min(1, 'נכס הוא שדה חובה'),
  apartmentNumber: z.string().min(1, 'מספר דירה הוא שדה חובה'),
  floor: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().int().min(0).optional()
  ),
  roomCount: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().int().min(1).optional()
  ),
  notes: z.string().optional(),
});

type UnitFormData = z.infer<typeof unitSchema>;

interface UnitFormProps {
  unit?: Unit | null;
  defaultPropertyId?: string;
  onClose: () => void;
}

export default function UnitForm({ unit, defaultPropertyId, onClose }: UnitFormProps) {
  const queryClient = useQueryClient();
  const isEdit = !!unit;
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data: propertiesData, isLoading: propertiesLoading } = useQuery({
    queryKey: ['properties', 'all'],
    queryFn: () => propertiesApi.getProperties(1, 100),
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
    defaultValues: unit
      ? {
          propertyId: unit.propertyId,
          apartmentNumber: unit.apartmentNumber,
          floor: unit.floor,
          roomCount: unit.roomCount,
          notes: unit.notes ?? '',
        }
      : {
          propertyId: defaultPropertyId ?? '',
          apartmentNumber: '',
          notes: '',
        },
  });

  const mutation = useMutation({
    mutationFn: (data: UnitFormData) => {
      const dto: CreateUnitDto = {
        propertyId: data.propertyId,
        apartmentNumber: data.apartmentNumber,
        floor: data.floor,
        roomCount: data.roomCount,
        notes: data.notes || undefined,
      };
      return isEdit ? unitsApi.update(unit.id, dto) : unitsApi.create(dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      setSnackbar({ open: true, message: isEdit ? 'יחידה עודכנה בהצלחה' : 'יחידה נוספה בהצלחה', severity: 'success' });
      setTimeout(onClose, 800);
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || (isEdit ? 'שגיאה בעדכון יחידה' : 'שגיאה בהוספת יחידה'),
        severity: 'error',
      });
    },
  });

  return (
    <>
      <Box component="form" onSubmit={handleSubmit((d) => mutation.mutate(d))} sx={{ direction: 'rtl' }}>
        <DialogTitle>{isEdit ? 'עריכת יחידה' : 'יחידה חדשה'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Controller
              name="propertyId"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.propertyId} disabled={isEdit || propertiesLoading}>
                  <InputLabel>נכס *</InputLabel>
                  <Select {...field} label="נכס *" value={field.value || ''}>
                    {propertiesData?.data?.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.address}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.propertyId && <FormHelperText>{errors.propertyId.message}</FormHelperText>}
                </FormControl>
              )}
            />

            <TextField
              label="מספר דירה *"
              {...register('apartmentNumber')}
              error={!!errors.apartmentNumber}
              helperText={errors.apartmentNumber?.message}
              fullWidth
              autoFocus={!isEdit}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="קומה"
                type="number"
                {...register('floor')}
                error={!!errors.floor}
                helperText={errors.floor?.message}
                fullWidth
                inputProps={{ min: 0 }}
              />
              <TextField
                label="מספר חדרים"
                type="number"
                {...register('roomCount')}
                error={!!errors.roomCount}
                helperText={errors.roomCount?.message}
                fullWidth
                inputProps={{ min: 1 }}
              />
            </Box>

            <TextField
              label="הערות"
              {...register('notes')}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={mutation.isPending}>ביטול</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending || propertiesLoading}
            startIcon={mutation.isPending ? <CircularProgress size={16} /> : null}
          >
            {mutation.isPending ? 'שומר...' : isEdit ? 'שמור' : 'הוסף'}
          </Button>
        </DialogActions>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
