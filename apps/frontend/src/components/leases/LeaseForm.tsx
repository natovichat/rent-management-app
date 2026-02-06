'use client';

import { useState } from 'react';
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
} from '@mui/material';
import { leasesApi, Lease, CreateLeaseDto } from '@/lib/api/leases';
import { tenantsApi, CreateTenantDto } from '@/lib/api/tenants';
import { unitsApi, CreateUnitDto } from '@/lib/api/units';
import { propertiesApi, CreatePropertyDto } from '@/services/properties';

const leaseSchema = z.object({
  unitId: z.string().min(1, 'יחידת דיור חובה'),
  tenantId: z.string().min(1, 'דייר חובה'),
  startDate: z.string().min(1, 'תאריך התחלה חובה'),
  endDate: z.string().min(1, 'תאריך סיום חובה'),
  monthlyRent: z.number().min(0, 'שכר דירה חייב להיות חיובי'),
  paymentTo: z.string().min(1, 'פרטי תשלום חובה'),
  notes: z.string().optional(),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: 'תאריך הסיום חייב להיות אחרי תאריך ההתחלה',
  path: ['endDate'],
});

type LeaseFormData = z.infer<typeof leaseSchema>;

interface LeaseFormProps {
  lease?: Lease | null;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Form for creating/editing a lease.
 */
export default function LeaseForm({ lease, onSuccess, onCancel }: LeaseFormProps) {
  const queryClient = useQueryClient();
  
  // Inline creation state
  const [createTenantDialogOpen, setCreateTenantDialogOpen] = useState(false);
  const [createUnitDialogOpen, setCreateUnitDialogOpen] = useState(false);
  const [createPropertyDialogOpen, setCreatePropertyDialogOpen] = useState(false);

  // Fetch units and tenants for dropdowns
  const { data: unitsData } = useQuery({
    queryKey: ['units'],
    queryFn: unitsApi.getAll,
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => tenantsApi.getAll(),
  });

  const { data: propertiesData } = useQuery({
    queryKey: ['properties', 'all'],
    queryFn: () => propertiesApi.getAll(1, 100),
  });

  const units = unitsData?.data || [];
  const properties = propertiesData?.data || [];

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<LeaseFormData>({
    resolver: zodResolver(leaseSchema),
    defaultValues: {
      unitId: lease?.unitId || '',
      tenantId: lease?.tenantId || '',
      startDate: lease?.startDate ? lease.startDate.split('T')[0] : '',
      endDate: lease?.endDate ? lease.endDate.split('T')[0] : '',
      monthlyRent: lease?.monthlyRent ? Number(lease.monthlyRent) : 0,
      paymentTo: lease?.paymentTo || '',
      notes: lease?.notes || '',
    },
  });

  // Tenant creation mutation
  const createTenantMutation = useMutation({
    mutationFn: (data: CreateTenantDto) => tenantsApi.create(data),
    onSuccess: (newTenant) => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      setCreateTenantDialogOpen(false);
      setValue('tenantId', newTenant.id);
    },
  });

  // Property creation mutation (for unit creation)
  const createPropertyMutation = useMutation({
    mutationFn: (data: CreatePropertyDto) => propertiesApi.create(data),
    onSuccess: (newProperty) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setCreatePropertyDialogOpen(false);
      // Auto-select property in unit form
      unitForm.setValue('propertyId', newProperty.id);
    },
  });

  // Unit creation mutation
  const createUnitMutation = useMutation({
    mutationFn: (data: CreateUnitDto) => {
      const propertyId = unitForm.getValues('propertyId');
      return unitsApi.create({ ...data, propertyId });
    },
    onSuccess: (newUnit) => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      setCreateUnitDialogOpen(false);
      unitForm.reset();
      setValue('unitId', newUnit.id);
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateLeaseDto) =>
      lease ? leasesApi.update(lease.id, data) : leasesApi.create(data),
    onSuccess,
  });

  const onSubmit = (data: LeaseFormData) => {
    mutation.mutate(data);
  };

  // Tenant form
  const tenantForm = useForm({
    defaultValues: { name: '', phone: '', email: '' },
  });

  // Property form (for unit creation)
  const propertyForm = useForm({
    defaultValues: { address: '', fileNumber: '' },
  });

  // Unit form
  const unitForm = useForm({
    defaultValues: { apartmentNumber: '', propertyId: '' },
  });

  const handleTenantSubmit = (data: any) => {
    createTenantMutation.mutate(data);
  };

  const handlePropertySubmit = (data: any) => {
    createPropertyMutation.mutate(data);
  };

  const handleUnitSubmit = (data: any) => {
    createUnitMutation.mutate(data);
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
            'שגיאה בשמירת החוזה'}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Controller
            name="unitId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="יחידת דיור"
                error={!!errors.unitId}
                helperText={errors.unitId?.message}
                required
                fullWidth
                onChange={(e) => {
                  if (e.target.value === '__CREATE_NEW__') {
                    setCreateUnitDialogOpen(true);
                  } else {
                    field.onChange(e);
                  }
                }}
              >
                {units.map((unit) => (
                  <MenuItem key={unit.id} value={unit.id}>
                    {unit.property?.address} - דירה {unit.apartmentNumber}
                  </MenuItem>
                ))}
                <MenuItem value="__CREATE_NEW__" sx={{ color: 'primary.main', fontWeight: 600, borderTop: units.length > 0 ? 1 : 0, borderColor: 'divider' }}>
                  + צור יחידת דיור חדשה
                </MenuItem>
              </TextField>
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="tenantId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="דייר"
                error={!!errors.tenantId}
                helperText={errors.tenantId?.message}
                required
                fullWidth
                onChange={(e) => {
                  if (e.target.value === '__CREATE_NEW__') {
                    setCreateTenantDialogOpen(true);
                  } else {
                    field.onChange(e);
                  }
                }}
              >
                {tenants.map((tenant) => (
                  <MenuItem key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </MenuItem>
                ))}
                <MenuItem value="__CREATE_NEW__" sx={{ color: 'primary.main', fontWeight: 600, borderTop: tenants.length > 0 ? 1 : 0, borderColor: 'divider' }}>
                  + צור דייר חדש
                </MenuItem>
              </TextField>
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label="תאריך התחלה"
            type="date"
            {...register('startDate')}
            error={!!errors.startDate}
            helperText={errors.startDate?.message}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label="תאריך סיום"
            type="date"
            {...register('endDate')}
            error={!!errors.endDate}
            helperText={errors.endDate?.message}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="monthlyRent"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="שכר דירה חודשי (₪)"
                type="number"
                error={!!errors.monthlyRent}
                helperText={errors.monthlyRent?.message}
                required
                fullWidth
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label="פרטי תשלום"
            {...register('paymentTo')}
            error={!!errors.paymentTo}
            helperText={errors.paymentTo?.message}
            required
            fullWidth
            placeholder="העברה בנקאית לחשבון..."
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="הערות"
            {...register('notes')}
            error={!!errors.notes}
            helperText={errors.notes?.message}
            fullWidth
            multiline
            rows={3}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
        <Button onClick={onCancel} disabled={mutation.isPending}>
          ביטול
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'שומר...' : lease ? 'עדכן' : 'צור'}
        </Button>
      </Box>

      {/* Create Tenant Dialog */}
      <Dialog open={createTenantDialogOpen} onClose={() => setCreateTenantDialogOpen(false)} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={tenantForm.handleSubmit(handleTenantSubmit)}>
          <DialogTitle>צור דייר חדש</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField label="שם *" {...tenantForm.register('name')} autoFocus fullWidth required />
              <TextField label="טלפון *" {...tenantForm.register('phone')} fullWidth required />
              <TextField label="אימייל" {...tenantForm.register('email')} fullWidth type="email" />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateTenantDialogOpen(false)}>ביטול</Button>
            <Button type="submit" variant="contained" disabled={createTenantMutation.isPending}>
              {createTenantMutation.isPending ? 'יוצר...' : 'צור דייר'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Create Unit Dialog */}
      <Dialog open={createUnitDialogOpen} onClose={() => setCreateUnitDialogOpen(false)} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={unitForm.handleSubmit(handleUnitSubmit)}>
          <DialogTitle>צור יחידת דיור חדשה</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                select
                label="נכס"
                {...unitForm.register('propertyId')}
                fullWidth
                required
                onChange={(e) => {
                  if (e.target.value === '__CREATE_PROPERTY__') {
                    setCreatePropertyDialogOpen(true);
                  } else {
                    unitForm.setValue('propertyId', e.target.value);
                  }
                }}
              >
                {properties.map((prop) => (
                  <MenuItem key={prop.id} value={prop.id}>{prop.address}</MenuItem>
                ))}
                <MenuItem value="__CREATE_PROPERTY__" sx={{ color: 'primary.main', fontWeight: 600 }}>
                  + צור נכס חדש
                </MenuItem>
              </TextField>
              <TextField label="מספר דירה *" {...unitForm.register('apartmentNumber')} autoFocus fullWidth required />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateUnitDialogOpen(false)}>ביטול</Button>
            <Button type="submit" variant="contained" disabled={createUnitMutation.isPending}>
              {createUnitMutation.isPending ? 'יוצר...' : 'צור יחידה'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Create Property Dialog */}
      <Dialog open={createPropertyDialogOpen} onClose={() => setCreatePropertyDialogOpen(false)} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={propertyForm.handleSubmit(handlePropertySubmit)}>
          <DialogTitle>צור נכס חדש</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField label="כתובת *" {...propertyForm.register('address')} autoFocus fullWidth required />
              <TextField label="מספר תיק" {...propertyForm.register('fileNumber')} fullWidth />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreatePropertyDialogOpen(false)}>ביטול</Button>
            <Button type="submit" variant="contained" disabled={createPropertyMutation.isPending}>
              {createPropertyMutation.isPending ? 'יוצר...' : 'צור נכס'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
