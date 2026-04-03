'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  TextField,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  ownershipsApi,
  Ownership,
  CreateOwnershipDto,
  UpdateOwnershipDto,
} from '@/lib/api/ownerships';
import { propertiesApi } from '@/lib/api/properties';
import { personsApi } from '@/lib/api/persons';

const OWNERSHIP_TYPES = ['FULL', 'PARTIAL', 'SHARED', 'TRUST', 'REAL', 'NOMINEE'] as const;
type OwnershipTypeValue = typeof OWNERSHIP_TYPES[number];

const ownershipSchema = z.object({
  propertyId: z.string().min(1, 'נכס הוא שדה חובה'),
  personId: z.string().min(1, 'אדם הוא שדה חובה'),
  ownershipPercentage: z
    .number()
    .min(0, 'אחוז בעלות חייב להיות בין 0 ל-100')
    .max(100, 'אחוז בעלות חייב להיות בין 0 ל-100'),
  ownershipType: z.enum(OWNERSHIP_TYPES, {
    required_error: 'סוג בעלות הוא שדה חובה',
  }),
  startDate: z.string().min(1, 'תאריך התחלה הוא שדה חובה'),
  endDate: z.string().optional().or(z.literal('')),
  notes: z.string().optional(),
});

type OwnershipFormData = z.infer<typeof ownershipSchema>;

const OWNERSHIP_TYPE_OPTIONS: { value: OwnershipTypeValue; label: string }[] = [
  { value: 'FULL',    label: 'בעלות מלאה' },
  { value: 'PARTIAL', label: 'בעלות חלקית' },
  { value: 'SHARED',  label: 'בעלות משותפת' },
  { value: 'TRUST',   label: 'נאמנות' },
  { value: 'REAL',    label: 'זכות קניינית' },
  { value: 'NOMINEE', label: 'נאמן רשמי' },
];

interface OwnershipFormProps {
  ownership?: Ownership | null;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Form for creating/editing an ownership.
 */
export default function OwnershipForm({
  ownership,
  onSuccess,
  onCancel,
}: OwnershipFormProps) {
  const queryClient = useQueryClient();

  const { data: propertiesData } = useQuery({
    queryKey: ['properties-list'],
    queryFn: () => propertiesApi.getProperties(1, 100),
  });
  const { data: personsData } = useQuery({
    queryKey: ['persons-list'],
    queryFn: () => personsApi.getPersons(1, 100),
  });
  const properties = propertiesData?.data || [];
  const persons = personsData?.data || [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OwnershipFormData>({
    resolver: zodResolver(ownershipSchema),
    defaultValues: {
      propertyId: ownership?.propertyId || '',
      personId: ownership?.personId || '',
      ownershipPercentage: ownership
        ? Number(ownership.ownershipPercentage)
        : 0,
      ownershipType:
        (ownership?.ownershipType && OWNERSHIP_TYPES.includes(ownership.ownershipType as OwnershipTypeValue)
          ? ownership.ownershipType
          : 'FULL') as OwnershipFormData['ownershipType'],
      startDate: ownership?.startDate
        ? ownership.startDate.substring(0, 10)
        : '',
      endDate: ownership?.endDate
        ? ownership.endDate.substring(0, 10)
        : '',
      notes: ownership?.notes || '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateOwnershipDto & { propertyId: string }) => {
      const { propertyId, ...rest } = data;
      return ownershipsApi.createOwnership(propertyId, rest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerships'] });
      onSuccess();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateOwnershipDto) =>
      ownershipsApi.updateOwnership(ownership!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerships'] });
      onSuccess();
    },
  });

  const mutation = ownership ? updateMutation : createMutation;

  const onSubmit = (data: OwnershipFormData) => {
    const payload = {
      personId: data.personId,
      ownershipPercentage: data.ownershipPercentage,
      ownershipType: data.ownershipType,
      startDate: data.startDate,
      endDate: data.endDate || undefined,
      notes: data.notes || undefined,
    };

    if (ownership) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate({
        ...payload,
        propertyId: data.propertyId,
      });
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}
    >
      {mutation.isError && (
        <Alert severity="error">
          {(mutation.error as { response?: { data?: { message?: string } } })
            ?.response?.data?.message || 'שגיאה בשמירת בעלות'}
        </Alert>
      )}

      <FormControl fullWidth required error={!!errors.propertyId} disabled={!!ownership}>
        <InputLabel>נכס *</InputLabel>
        <Select
          value={watch('propertyId')}
          onChange={(e) => setValue('propertyId', e.target.value)}
          label="נכס *"
        >
          {properties.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.address} {p.fileNumber ? `(${p.fileNumber})` : ''}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth required error={!!errors.personId}>
        <InputLabel>אדם *</InputLabel>
        <Select
          value={watch('personId')}
          onChange={(e) => setValue('personId', e.target.value)}
          label="אדם *"
        >
          {persons.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="אחוז בעלות *"
        type="number"
        {...register('ownershipPercentage', { valueAsNumber: true })}
        error={!!errors.ownershipPercentage}
        helperText={errors.ownershipPercentage?.message}
        required
        fullWidth
        inputProps={{ min: 0, max: 100, step: 0.01 }}
      />

      <FormControl fullWidth required error={!!errors.ownershipType}>
        <InputLabel>סוג בעלות *</InputLabel>
        <Select
          value={watch('ownershipType')}
          onChange={(e) =>
            setValue('ownershipType', e.target.value as OwnershipFormData['ownershipType'])
          }
          label="סוג בעלות *"
        >
          {OWNERSHIP_TYPE_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

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
        label="תאריך סיום"
        type="date"
        {...register('endDate')}
        error={!!errors.endDate}
        helperText={errors.endDate?.message}
        fullWidth
        InputLabelProps={{ shrink: true }}
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

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
        <Button onClick={onCancel}>ביטול</Button>
        <Button
          type="submit"
          variant="contained"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'שומר...' : ownership ? 'עדכן' : 'הוסף'}
        </Button>
      </Box>
    </Box>
  );
}
