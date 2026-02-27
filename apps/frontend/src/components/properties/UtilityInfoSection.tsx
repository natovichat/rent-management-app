'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ElectricBolt as ElectricIcon,
  Water as WaterIcon,
  HomeWork as HomeWorkIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { utilityInfoApi, UtilityInfo, CreateUtilityInfoDto } from '@/lib/api/utility-info';

const utilitySchema = z.object({
  arnonaAccountNumber: z.string().optional(),
  electricityAccountNumber: z.string().optional(),
  waterAccountNumber: z.string().optional(),
  vaadBayitName: z.string().optional(),
  waterMeterNumber: z.string().optional(),
  electricityMeterNumber: z.string().optional(),
  notes: z.string().optional(),
});

type UtilityFormData = z.infer<typeof utilitySchema>;

interface FieldDisplayProps {
  label: string;
  value?: string;
  placeholder?: string;
}

function FieldDisplay({ label, value, placeholder = 'לא הוגדר' }: FieldDisplayProps) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ color: value ? 'text.primary' : 'text.disabled' }}>
        {value || placeholder}
      </Typography>
    </Box>
  );
}

interface Props {
  propertyId: string;
  defaultExpanded?: boolean;
}

export default function UtilityInfoSection({ propertyId, defaultExpanded = false }: Props) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data: utilityInfo, isLoading } = useQuery({
    queryKey: ['utility-info', propertyId],
    queryFn: () => utilityInfoApi.getUtilityInfo(propertyId),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UtilityFormData>({
    resolver: zodResolver(utilitySchema),
    defaultValues: {},
  });

  const saveMutation = useMutation({
    mutationFn: async (data: UtilityFormData) => {
      // Remove empty strings → undefined so backend doesn't store empty values
      const cleanData: CreateUtilityInfoDto = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, v?.trim() || undefined])
      ) as CreateUtilityInfoDto;

      if (utilityInfo) {
        return utilityInfoApi.updateUtilityInfo(propertyId, cleanData);
      } else {
        return utilityInfoApi.createUtilityInfo(propertyId, cleanData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utility-info', propertyId] });
      setIsEditing(false);
      setSnackbar({ open: true, message: 'מידע השירותים נשמר בהצלחה', severity: 'success' });
    },
    onError: () => {
      setSnackbar({ open: true, message: 'שגיאה בשמירת מידע השירותים', severity: 'error' });
    },
  });

  const handleEdit = () => {
    reset({
      arnonaAccountNumber: utilityInfo?.arnonaAccountNumber || '',
      electricityAccountNumber: utilityInfo?.electricityAccountNumber || '',
      waterAccountNumber: utilityInfo?.waterAccountNumber || '',
      vaadBayitName: utilityInfo?.vaadBayitName || '',
      waterMeterNumber: utilityInfo?.waterMeterNumber || '',
      electricityMeterNumber: utilityInfo?.electricityMeterNumber || '',
      notes: utilityInfo?.notes || '',
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset();
  };

  const hasData = utilityInfo && Object.values(utilityInfo).some(
    (v, i) => i > 2 && v // skip id, propertyId, createdAt/updatedAt
  );

  const summaryText = isLoading
    ? 'טוען...'
    : !utilityInfo
    ? 'לא הוגדר מידע שירותים'
    : [
        utilityInfo.arnonaAccountNumber && `ארנונה: ${utilityInfo.arnonaAccountNumber}`,
        utilityInfo.electricityAccountNumber && `חשמל: ${utilityInfo.electricityAccountNumber}`,
        utilityInfo.waterAccountNumber && `מים: ${utilityInfo.waterAccountNumber}`,
      ]
        .filter(Boolean)
        .join(' · ') || 'מידע שירותים קיים';

  return (
    <>
      <Accordion defaultExpanded={defaultExpanded} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <HomeWorkIcon color="primary" fontSize="small" />
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                מידע שירותים
              </Typography>
              {!isEditing && (
                <Typography variant="caption" color="text.secondary">
                  {summaryText}
                </Typography>
              )}
            </Box>
            {isLoading && <CircularProgress size={16} />}
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          {isEditing ? (
            /* ── EDIT FORM ── */
            <Box component="form" onSubmit={handleSubmit((d) => saveMutation.mutate(d))}>
              <Grid container spacing={2}>
                {/* Arnona section */}
                <Grid item xs={12}>
                  <Typography variant="body2" color="primary" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <HomeWorkIcon fontSize="inherit" /> ארנונה
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="מספר חשבון ארנונה"
                    {...register('arnonaAccountNumber')}
                    fullWidth
                    size="small"
                    dir="rtl"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" color="primary" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ElectricIcon fontSize="inherit" /> חשמל
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="מספר חשבון חשמל"
                    {...register('electricityAccountNumber')}
                    fullWidth
                    size="small"
                    dir="rtl"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="מספר מונה חשמל"
                    {...register('electricityMeterNumber')}
                    fullWidth
                    size="small"
                    dir="rtl"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" color="primary" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <WaterIcon fontSize="inherit" /> מים
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="מספר חשבון מים"
                    {...register('waterAccountNumber')}
                    fullWidth
                    size="small"
                    dir="rtl"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="מספר מונה מים"
                    {...register('waterMeterNumber')}
                    fullWidth
                    size="small"
                    dir="rtl"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="שם ועד בית"
                    {...register('vaadBayitName')}
                    fullWidth
                    size="small"
                    dir="rtl"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="הערות"
                    {...register('notes')}
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                    dir="rtl"
                  />
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-end' }}>
                <Button
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={saveMutation.isPending}
                >
                  ביטול
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending ? 'שומר...' : 'שמור'}
                </Button>
              </Box>
            </Box>
          ) : utilityInfo ? (
            /* ── VIEW MODE ── */
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <FieldDisplay label="מספר חשבון ארנונה" value={utilityInfo.arnonaAccountNumber} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FieldDisplay label="מספר חשבון חשמל" value={utilityInfo.electricityAccountNumber} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FieldDisplay label="מספר מונה חשמל" value={utilityInfo.electricityMeterNumber} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FieldDisplay label="מספר חשבון מים" value={utilityInfo.waterAccountNumber} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FieldDisplay label="מספר מונה מים" value={utilityInfo.waterMeterNumber} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FieldDisplay label="שם ועד בית" value={utilityInfo.vaadBayitName} />
                </Grid>
                {utilityInfo.notes && (
                  <Grid item xs={12}>
                    <FieldDisplay label="הערות" value={utilityInfo.notes} />
                  </Grid>
                )}
              </Grid>
              <Box sx={{ mt: 2 }}>
                <Button startIcon={<EditIcon />} size="small" onClick={handleEdit}>
                  עריכה
                </Button>
              </Box>
            </Box>
          ) : (
            /* ── EMPTY STATE ── */
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                לא הוגדר מידע שירותים עבור נכס זה
              </Typography>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={handleEdit}>
                הוסף מידע שירותים
              </Button>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
