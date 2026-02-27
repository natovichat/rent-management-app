'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Skeleton,
  TextField,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  AccountBalance as PlanningIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  planningProcessStatesApi,
  CreatePlanningProcessStateDto,
} from '@/lib/api/planning-process-states';

// ─── Config ────────────────────────────────────────────────────────────────────

const STATE_TYPE_OPTIONS = [
  { value: 'IN_PROGRESS', label: 'בתהליך תכנון' },
  { value: 'PENDING_APPROVAL', label: 'ממתין לאישור' },
  { value: 'APPROVED', label: 'מאושר' },
  { value: 'UNDER_CONSTRUCTION', label: 'בבנייה' },
  { value: 'COMPLETED', label: 'הושלם' },
  { value: 'REJECTED', label: 'נדחה' },
  { value: 'SUSPENDED', label: 'מושהה' },
];

const STATE_TYPE_COLORS: Record<string, { color: 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'; label: string }> = {
  IN_PROGRESS: { color: 'info', label: 'בתהליך תכנון' },
  PENDING_APPROVAL: { color: 'warning', label: 'ממתין לאישור' },
  APPROVED: { color: 'success', label: 'מאושר' },
  UNDER_CONSTRUCTION: { color: 'primary', label: 'בבנייה' },
  COMPLETED: { color: 'success', label: 'הושלם' },
  REJECTED: { color: 'error', label: 'נדחה' },
  SUSPENDED: { color: 'default', label: 'מושהה' },
};

function getStateLabel(stateType: string) {
  return STATE_TYPE_COLORS[stateType]?.label ?? stateType;
}

function getStateColor(stateType: string): 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' {
  return STATE_TYPE_COLORS[stateType]?.color ?? 'default';
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('he-IL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  stateType: z.string().min(1, 'סוג מצב הוא שדה חובה'),
  lastUpdateDate: z.string().min(1, 'תאריך עדכון הוא שדה חובה'),
  developerName: z.string().optional(),
  projectedSizeAfter: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

// ─── Read row ──────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 160, flexShrink: 0, fontWeight: 500 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ flex: 1 }}>
        {value ?? '—'}
      </Typography>
    </Box>
  );
}

// ─── Main section ──────────────────────────────────────────────────────────────

interface Props {
  propertyId: string;
  defaultExpanded?: boolean;
}

export default function PlanningProcessStateSection({ propertyId, defaultExpanded = false }: Props) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  const today = new Date().toISOString().split('T')[0];

  const { data: state, isLoading } = useQuery({
    queryKey: ['planning-process-state', propertyId],
    queryFn: () => planningProcessStatesApi.getPlanningProcessState(propertyId),
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      stateType: '',
      lastUpdateDate: today,
      developerName: '',
      projectedSizeAfter: '',
      notes: '',
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const dto: CreatePlanningProcessStateDto = {
        stateType: data.stateType,
        lastUpdateDate: data.lastUpdateDate,
        developerName: data.developerName || undefined,
        projectedSizeAfter: data.projectedSizeAfter || undefined,
        notes: data.notes || undefined,
      };
      if (state) {
        return planningProcessStatesApi.updatePlanningProcessState(propertyId, dto);
      }
      return planningProcessStatesApi.createPlanningProcessState(propertyId, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planning-process-state', propertyId] });
      setIsEditing(false);
      setSnackbar({ open: true, message: 'מצב תכנון נשמר בהצלחה', severity: 'success' });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message;
      setSnackbar({
        open: true,
        message: Array.isArray(msg) ? msg.join(', ') : (msg || 'שגיאה בשמירה'),
        severity: 'error',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => planningProcessStatesApi.deletePlanningProcessState(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planning-process-state', propertyId] });
      setSnackbar({ open: true, message: 'מצב תכנון נמחק', severity: 'success' });
    },
    onError: () => setSnackbar({ open: true, message: 'שגיאה במחיקה', severity: 'error' }),
  });

  const handleEdit = () => {
    form.reset({
      stateType: state?.stateType ?? '',
      lastUpdateDate: state?.lastUpdateDate
        ? new Date(state.lastUpdateDate).toISOString().split('T')[0]
        : today,
      developerName: state?.developerName ?? '',
      projectedSizeAfter: state?.projectedSizeAfter ?? '',
      notes: state?.notes ?? '',
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  // ── Accordion summary label ──
  const summaryLabel = state
    ? getStateLabel(state.stateType)
    : 'אין מידע';

  return (
    <>
      <Accordion
        defaultExpanded={defaultExpanded}
        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, '&:before': { display: 'none' } }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <PlanningIcon color="primary" />
            <Typography fontWeight={700}>מצב תכנון</Typography>
            {state && !isLoading && (
              <Chip
                size="small"
                label={getStateLabel(state.stateType)}
                color={getStateColor(state.stateType)}
                sx={{ mr: 'auto' }}
              />
            )}
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ pt: 0 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[1, 2, 3].map((i) => <Skeleton key={i} height={36} />)}
            </Box>
          ) : isEditing ? (
            // ── Edit form ──
            <Box
              component="form"
              onSubmit={form.handleSubmit((d) => saveMutation.mutate(d))}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="stateType"
                    control={form.control}
                    render={({ field }) => {
                      const isCustom = field.value && !STATE_TYPE_OPTIONS.find(o => o.value === field.value);
                      return (
                        <FormControl fullWidth required error={!!form.formState.errors.stateType}>
                          <InputLabel>סוג מצב *</InputLabel>
                          <Select
                            {...field}
                            label="סוג מצב *"
                            onChange={(e) => {
                              if (e.target.value === '__CUSTOM__') {
                                field.onChange('');
                              } else {
                                field.onChange(e.target.value);
                              }
                            }}
                            value={isCustom ? '__CUSTOM__' : field.value}
                          >
                            {STATE_TYPE_OPTIONS.map(({ value, label }) => (
                              <MenuItem key={value} value={value}>{label}</MenuItem>
                            ))}
                            <Divider />
                            <MenuItem value="__CUSTOM__">
                              <em>אחר (כתוב חופשי)</em>
                            </MenuItem>
                          </Select>
                          {(isCustom || field.value === '') && (
                            <TextField
                              size="small"
                              placeholder="תאר את המצב..."
                              value={isCustom ? field.value : ''}
                              onChange={(e) => field.onChange(e.target.value)}
                              sx={{ mt: 1 }}
                              autoFocus={!!isCustom}
                            />
                          )}
                          {form.formState.errors.stateType && (
                            <Typography variant="caption" color="error">
                              {form.formState.errors.stateType.message}
                            </Typography>
                          )}
                        </FormControl>
                      );
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="תאריך עדכון אחרון *"
                    type="date"
                    fullWidth
                    {...form.register('lastUpdateDate')}
                    error={!!form.formState.errors.lastUpdateDate}
                    helperText={form.formState.errors.lastUpdateDate?.message}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="שם יזם / חברה"
                    fullWidth
                    {...form.register('developerName')}
                    placeholder="לדוגמה: יזם נדל&quot;ן בע&quot;מ"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="גודל צפוי לאחר תכנון"
                    fullWidth
                    {...form.register('projectedSizeAfter')}
                    placeholder='לדוגמה: 150 מ"ר'
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="הערות"
                    fullWidth
                    multiline
                    rows={3}
                    {...form.register('notes')}
                    placeholder="פרטים נוספים על תהליך התכנון..."
                  />
                </Grid>
              </Grid>

              <Divider />

              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button startIcon={<CancelIcon />} onClick={handleCancel}>
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
          ) : state ? (
            // ── Read mode ──
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, gap: 1 }}>
                <Button startIcon={<EditIcon />} size="small" onClick={handleEdit}>
                  עריכה
                </Button>
                <Tooltip title="מחק מצב תכנון">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => deleteMutation.mutate()}
                    disabled={deleteMutation.isPending}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              <InfoRow
                label="סוג מצב"
                value={
                  <Chip
                    size="small"
                    label={getStateLabel(state.stateType)}
                    color={getStateColor(state.stateType)}
                  />
                }
              />
              <InfoRow label="תאריך עדכון אחרון" value={formatDate(state.lastUpdateDate)} />
              <InfoRow label="שם יזם / חברה" value={state.developerName} />
              <InfoRow label="גודל צפוי לאחר תכנון" value={state.projectedSizeAfter} />
              {state.notes && (
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500} mb={0.5}>
                    הערות
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {state.notes}
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            // ── Empty state ──
            <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
              <PlanningIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
              <Typography variant="body2">אין מידע תכנוני לנכס זה</Typography>
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                size="small"
                sx={{ mt: 1.5 }}
                onClick={handleEdit}
              >
                הוסף מצב תכנון
              </Button>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
