/**
 * PlotInfoPanel - Display and edit plot information (Gush/Chelka)
 * 
 * Features:
 * - Display plot information (Gush, Chelka, Sub-Chelka, Registry details)
 * - Add plot info if not exists
 * - Edit plot info
 * - Delete plot info
 * - RTL layout support
 */

'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Map as MapIcon,
} from '@mui/icons-material';
import { plotInfoApi, PlotInfo, CreatePlotInfoDto, UpdatePlotInfoDto } from '@/lib/api/plot-info';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface PlotInfoPanelProps {
  propertyId: string;
}

const plotInfoSchema = z.object({
  gush: z.string().optional().or(z.literal('')),
  chelka: z.string().optional().or(z.literal('')),
  subChelka: z.string().optional().or(z.literal('')),
  registryNumber: z.string().optional().or(z.literal('')),
  registryOffice: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

type PlotInfoFormData = z.infer<typeof plotInfoSchema>;

export default function PlotInfoPanel({ propertyId }: PlotInfoPanelProps) {
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Fetch plot info
  const {
    data: plotInfo,
    isLoading,
    error,
  } = useQuery<PlotInfo>({
    queryKey: ['plot-info', propertyId],
    queryFn: () => plotInfoApi.getByPropertyId(propertyId),
    retry: false, // Don't retry on 404 (plot info might not exist)
  });

  // Form for create/edit
  const form = useForm<PlotInfoFormData>({
    resolver: zodResolver(plotInfoSchema),
    defaultValues: {
      gush: '',
      chelka: '',
      subChelka: '',
      registryNumber: '',
      registryOffice: '',
      notes: '',
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreatePlotInfoDto) => plotInfoApi.create(propertyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plot-info', propertyId] });
      setEditDialogOpen(false);
      form.reset();
      setSnackbar({
        open: true,
        message: 'פרטי החלקה נוספו בהצלחה',
        severity: 'success',
      });
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: 'שגיאה בהוספת פרטי החלקה',
        severity: 'error',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlotInfoDto }) =>
      plotInfoApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plot-info', propertyId] });
      setEditDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'פרטי החלקה עודכנו בהצלחה',
        severity: 'success',
      });
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: 'שגיאה בעדכון פרטי החלקה',
        severity: 'error',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => plotInfoApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plot-info', propertyId] });
      setDeleteDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'פרטי החלקה נמחקו בהצלחה',
        severity: 'success',
      });
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: 'שגיאה במחיקת פרטי החלקה',
        severity: 'error',
      });
    },
  });

  // Handlers
  const handleOpenEdit = () => {
    if (plotInfo) {
      // Edit mode - populate form
      form.reset({
        gush: plotInfo.gush || '',
        chelka: plotInfo.chelka || '',
        subChelka: plotInfo.subChelka || '',
        registryNumber: plotInfo.registryNumber || '',
        registryOffice: plotInfo.registryOffice || '',
        notes: plotInfo.notes || '',
      });
    } else {
      // Create mode - reset form
      form.reset();
    }
    setEditDialogOpen(true);
  };

  const handleCloseEdit = () => {
    setEditDialogOpen(false);
    form.reset();
  };

  const handleSubmit = (data: PlotInfoFormData) => {
    // Convert empty strings to undefined
    const submitData: CreatePlotInfoDto = {
      gush: data.gush || undefined,
      chelka: data.chelka || undefined,
      subChelka: data.subChelka || undefined,
      registryNumber: data.registryNumber || undefined,
      registryOffice: data.registryOffice || undefined,
      notes: data.notes || undefined,
    };

    if (plotInfo) {
      // Update existing
      updateMutation.mutate({ id: plotInfo.id, data: submitData });
    } else {
      // Create new
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = () => {
    if (plotInfo) {
      deleteMutation.mutate(plotInfo.id);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  const plotInfoExists = plotInfo && !error;

  return (
    <>
      <Paper sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MapIcon color="primary" />
            <Typography variant="h6">פרטי חלקה (גוש/חלקה)</Typography>
          </Box>
          <Box>
            {plotInfoExists ? (
              <>
                <IconButton
                  onClick={handleOpenEdit}
                  color="primary"
                  aria-label="ערוך פרטי חלקה"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => setDeleteDialogOpen(true)}
                  color="error"
                  aria-label="מחק פרטי חלקה"
                >
                  <DeleteIcon />
                </IconButton>
              </>
            ) : (
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                onClick={handleOpenEdit}
              >
                הוסף פרטי חלקה
              </Button>
            )}
          </Box>
        </Box>

        {plotInfoExists ? (
          <Grid container spacing={2}>
            {plotInfo.gush && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  גוש
                </Typography>
                <Typography variant="body1">{plotInfo.gush}</Typography>
              </Grid>
            )}
            {plotInfo.chelka && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  חלקה
                </Typography>
                <Typography variant="body1">{plotInfo.chelka}</Typography>
              </Grid>
            )}
            {plotInfo.subChelka && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  תת חלקה
                </Typography>
                <Typography variant="body1">{plotInfo.subChelka}</Typography>
              </Grid>
            )}
            {plotInfo.registryNumber && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  מספר רישום
                </Typography>
                <Typography variant="body1">{plotInfo.registryNumber}</Typography>
              </Grid>
            )}
            {plotInfo.registryOffice && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  משרד רישום
                </Typography>
                <Typography variant="body1">{plotInfo.registryOffice}</Typography>
              </Grid>
            )}
            {plotInfo.notes && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  הערות
                </Typography>
                <Typography variant="body1">{plotInfo.notes}</Typography>
              </Grid>
            )}
          </Grid>
        ) : (
          <Alert severity="info" sx={{ mt: 2 }}>
            אין פרטי חלקה רשומים לנכס זה. לחץ על "הוסף פרטי חלקה" כדי להוסיף.
          </Alert>
        )}
      </Paper>

      {/* Edit/Create Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEdit}
        maxWidth="sm"
        fullWidth
        sx={{ direction: 'rtl' }}
      >
        <Box component="form" onSubmit={form.handleSubmit(handleSubmit)}>
          <DialogTitle>
            {plotInfoExists ? 'ערוך פרטי חלקה' : 'הוסף פרטי חלקה'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="גוש"
                {...form.register('gush')}
                error={!!form.formState.errors.gush}
                helperText={form.formState.errors.gush?.message}
                fullWidth
              />
              <TextField
                label="חלקה"
                {...form.register('chelka')}
                error={!!form.formState.errors.chelka}
                helperText={form.formState.errors.chelka?.message}
                fullWidth
              />
              <TextField
                label="תת חלקה"
                {...form.register('subChelka')}
                error={!!form.formState.errors.subChelka}
                helperText={form.formState.errors.subChelka?.message}
                fullWidth
              />
              <TextField
                label="מספר רישום"
                {...form.register('registryNumber')}
                error={!!form.formState.errors.registryNumber}
                helperText={form.formState.errors.registryNumber?.message}
                fullWidth
              />
              <TextField
                label="משרד רישום"
                {...form.register('registryOffice')}
                error={!!form.formState.errors.registryOffice}
                helperText={form.formState.errors.registryOffice?.message}
                fullWidth
              />
              <TextField
                label="הערות"
                {...form.register('notes')}
                error={!!form.formState.errors.notes}
                helperText={form.formState.errors.notes?.message}
                fullWidth
                multiline
                rows={3}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEdit}>ביטול</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createMutation.isPending || updateMutation.isPending
              }
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'שומר...'
                : plotInfoExists
                ? 'שמור שינויים'
                : 'הוסף'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        sx={{ direction: 'rtl' }}
      >
        <DialogTitle>מחיקת פרטי חלקה</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את פרטי החלקה? פעולה זו לא ניתנת לביטול.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>ביטול</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'מוחק...' : 'מחק'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      {snackbar.open && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            left: 16,
            zIndex: 9999,
          }}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            {snackbar.message}
          </Alert>
        </Box>
      )}
    </>
  );
}
