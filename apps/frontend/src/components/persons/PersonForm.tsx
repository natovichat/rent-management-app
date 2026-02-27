'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
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
  Person,
  CreatePersonDto,
  PersonType,
  personsApi,
} from '@/lib/api/persons';
import { useQueryClient } from '@tanstack/react-query';

const PERSON_TYPE_OPTIONS: { value: PersonType; label: string }[] = [
  { value: 'INDIVIDUAL', label: 'יחיד' },
  { value: 'COMPANY', label: 'חברה' },
  { value: 'PARTNERSHIP', label: 'שותפות' },
];

const personSchema = z.object({
  name: z.string().min(1, 'שם הוא שדה חובה'),
  type: z.enum(['INDIVIDUAL', 'COMPANY', 'PARTNERSHIP']).optional(),
  idNumber: z.string().optional(),
  email: z.string().email('כתובת אימייל לא תקינה').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type PersonFormData = z.infer<typeof personSchema>;

interface PersonFormProps {
  person?: Person | null;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Form for creating/editing a person.
 */
export default function PersonForm({
  person,
  onSuccess,
  onCancel,
}: PersonFormProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      name: person?.name || '',
      type: person?.type || 'INDIVIDUAL',
      idNumber: person?.idNumber || '',
      email: person?.email || '',
      phone: person?.phone || '',
      address: person?.address || '',
      notes: person?.notes || '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CreatePersonDto) =>
      person ? personsApi.updatePerson(person.id, data) : personsApi.createPerson(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['persons'] });
      onSuccess();
    },
  });

  const onSubmit = (data: PersonFormData) => {
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
          {(mutation.error as any)?.response?.data?.message || 'שגיאה בשמירת אדם'}
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

      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth>
            <InputLabel>סוג</InputLabel>
            <Select {...field} label="סוג" value={field.value || 'INDIVIDUAL'}>
              {PERSON_TYPE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      />

      <TextField
        label="תעודת זהות / ח.פ."
        {...register('idNumber')}
        error={!!errors.idNumber}
        helperText={errors.idNumber?.message}
        fullWidth
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
          {mutation.isPending ? 'שומר...' : person ? 'עדכן' : 'הוסף'}
        </Button>
      </Box>
    </Box>
  );
}
