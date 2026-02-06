'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  FormHelperText,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  Build as BuildIcon,
  AttachMoney as AttachMoneyIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { unitsApi, Unit, CreateUnitDto, UnitType, FurnishingStatus, UnitCondition, OccupancyStatus } from '@/services/units';
import { propertiesApi, Property, CreatePropertyDto } from '@/services/properties';

/**
 * Helper function to coerce string/number to number or undefined
 */
const coerceOptionalNumber = (val: unknown): number | undefined => {
  if (val === '' || val === null || val === undefined) return undefined;
  if (typeof val === 'number') return isNaN(val) ? undefined : val;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed === '') return undefined;
    const parsed = parseFloat(trimmed);
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};

const coerceOptionalInt = (val: unknown): number | undefined => {
  const num = coerceOptionalNumber(val);
  return num !== undefined ? Math.floor(num) : undefined;
};

/**
 * Comprehensive validation schema for unit form with all fields
 */
const unitSchema = z.object({
  propertyId: z.string().min(1, 'נכס הוא שדה חובה'),
  apartmentNumber: z.string().min(1, 'מספר דירה הוא שדה חובה'),
  // Basic Information
  floor: z.preprocess(
    coerceOptionalInt,
    z.union([z.number().int().min(0, 'קומה חייבת להיות מספר שלם לא שלילי'), z.undefined()])
  ),
  roomCount: z.preprocess(
    coerceOptionalInt,
    z.union([z.number().int().min(1, 'מספר חדרים חייב להיות לפחות 1'), z.undefined()])
  ),
  // Detailed Information
  unitType: z.nativeEnum(UnitType).optional(),
  area: z.preprocess(
    coerceOptionalNumber,
    z.union([z.number().positive('שטח חייב להיות מספר חיובי'), z.undefined()])
  ),
  bedrooms: z.preprocess(
    coerceOptionalInt,
    z.union([z.number().int().min(0, 'מספר חדרי שינה חייב להיות מספר שלם לא שלילי'), z.undefined()])
  ),
  bathrooms: z.preprocess(
    coerceOptionalNumber,
    z.union([z.number().min(0, 'מספר חדרי רחצה חייב להיות מספר לא שלילי'), z.undefined()])
  ),
  balconyArea: z.preprocess(
    coerceOptionalNumber,
    z.union([z.number().positive('שטח מרפסת חייב להיות מספר חיובי'), z.undefined()])
  ),
  storageArea: z.preprocess(
    coerceOptionalNumber,
    z.union([z.number().positive('שטח מחסן חייב להיות מספר חיובי'), z.undefined()])
  ),
  // Amenities
  hasElevator: z.boolean().optional(),
  hasParking: z.boolean().optional(),
  parkingSpots: z.preprocess(
    coerceOptionalInt,
    z.union([z.number().int().min(0, 'מספר מקומות חניה חייב להיות מספר שלם לא שלילי'), z.undefined()])
  ),
  // Status & Condition
  furnishingStatus: z.nativeEnum(FurnishingStatus).optional(),
  condition: z.nativeEnum(UnitCondition).optional(),
  occupancyStatus: z.nativeEnum(OccupancyStatus).optional(),
  isOccupied: z.boolean().optional(),
  // Dates
  entryDate: z.string().optional(),
  lastRenovationDate: z.string().optional(),
  // Financial
  currentRent: z.preprocess(
    coerceOptionalNumber,
    z.union([z.number().positive('שכירות נוכחית חייבת להיות מספר חיובי'), z.undefined()])
  ),
  marketRent: z.preprocess(
    coerceOptionalNumber,
    z.union([z.number().positive('שכירות שוק חייבת להיות מספר חיובי'), z.undefined()])
  ),
  // Additional
  utilities: z.string().optional(),
  notes: z.string().optional(),
});

type UnitFormData = z.infer<typeof unitSchema>;

interface UnitFormProps {
  unit?: Unit | null;
  onClose: () => void;
}

export default function UnitForm({ unit, onClose }: UnitFormProps) {
  const queryClient = useQueryClient();
  const isEdit = !!unit;

  // Inline Property Creation state
  const [createPropertyDialogOpen, setCreatePropertyDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Fetch properties for dropdown
  const { data: propertiesData, isLoading: propertiesLoading } = useQuery({
    queryKey: ['properties', 'all'],
    queryFn: () => propertiesApi.getAll(1, 100),
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
    defaultValues: unit
      ? {
          propertyId: unit.propertyId,
          apartmentNumber: unit.apartmentNumber,
          floor: unit.floor ?? undefined,
          roomCount: unit.roomCount ?? undefined,
          unitType: unit.unitType,
          area: unit.area,
          bedrooms: unit.bedrooms,
          bathrooms: unit.bathrooms,
          balconyArea: unit.balconyArea,
          storageArea: unit.storageArea,
          hasElevator: unit.hasElevator ?? false,
          hasParking: unit.hasParking ?? false,
          parkingSpots: unit.parkingSpots,
          furnishingStatus: unit.furnishingStatus,
          condition: unit.condition,
          occupancyStatus: unit.occupancyStatus,
          isOccupied: unit.isOccupied ?? false,
          entryDate: unit.entryDate ? unit.entryDate.split('T')[0] : undefined,
          lastRenovationDate: unit.lastRenovationDate ? unit.lastRenovationDate.split('T')[0] : undefined,
          currentRent: unit.currentRent,
          marketRent: unit.marketRent,
          utilities: unit.utilities,
          notes: unit.notes,
        }
      : {
          propertyId: '',
          apartmentNumber: '',
          hasElevator: false,
          hasParking: false,
          isOccupied: false,
        },
  });

  // Property creation form (for inline creation)
  const createPropertyForm = useForm<CreatePropertyDto>({
    defaultValues: {
      address: '',
      fileNumber: '',
      country: 'Israel',
    },
  });

  // Property creation mutation (for inline creation)
  const createPropertyMutation = useMutation({
    mutationFn: (data: CreatePropertyDto) => propertiesApi.create(data),
    onSuccess: (newProperty) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setCreatePropertyDialogOpen(false);
      createPropertyForm.reset();
      // Auto-select newly created property
      setValue('propertyId', newProperty.id);
      setSnackbar({
        open: true,
        message: 'נכס נוסף בהצלחה',
        severity: 'success',
      });
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: 'שגיאה בהוספת נכס',
        severity: 'error',
      });
    },
  });

  const handlePropertySubmit = (data: CreatePropertyDto) => {
    createPropertyMutation.mutate(data);
  };

  // Unit mutation
  const mutation = useMutation({
    mutationFn: (data: UnitFormData) => {
      const submitData: CreateUnitDto = {
        ...data,
        floor: data.floor === undefined ? undefined : data.floor,
        roomCount: data.roomCount === undefined ? undefined : data.roomCount,
        area: data.area === undefined ? undefined : data.area,
        bedrooms: data.bedrooms === undefined ? undefined : data.bedrooms,
        bathrooms: data.bathrooms === undefined ? undefined : data.bathrooms,
        balconyArea: data.balconyArea === undefined ? undefined : data.balconyArea,
        storageArea: data.storageArea === undefined ? undefined : data.storageArea,
        parkingSpots: data.parkingSpots === undefined ? undefined : data.parkingSpots,
        currentRent: data.currentRent === undefined ? undefined : data.currentRent,
        marketRent: data.marketRent === undefined ? undefined : data.marketRent,
        entryDate: data.entryDate || undefined,
        lastRenovationDate: data.lastRenovationDate || undefined,
      };
      return isEdit
        ? unitsApi.update(unit.id, submitData)
        : unitsApi.create(submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setSnackbar({
        open: true,
        message: isEdit ? 'דירה עודכנה בהצלחה' : 'דירה נוספה בהצלחה',
        severity: 'success',
      });
      setTimeout(() => {
        onClose();
      }, 1000);
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || (isEdit ? 'שגיאה בעדכון דירה' : 'שגיאה בהוספת דירה'),
        severity: 'error',
      });
    },
  });

  const onSubmit = (data: UnitFormData) => {
    mutation.mutate(data);
  };

  const handleCreateNewProperty = () => {
    setCreatePropertyDialogOpen(true);
  };

  return (
    <>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ direction: 'rtl' }}>
        <DialogTitle>{isEdit ? 'עריכת דירה' : 'דירה חדשה'}</DialogTitle>

        <DialogContent sx={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {/* Section 1: Basic Information - Always Expanded */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HomeIcon />
                  <Typography variant="h6">מידע בסיסי</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {/* Property Selector with Inline Creation */}
                  <Grid item xs={12}>
                    <Controller
                      name="propertyId"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.propertyId}>
                          <InputLabel id="property-select-label">נכס *</InputLabel>
                          <Select
                            {...field}
                            labelId="property-select-label"
                            id="property-select"
                            label="נכס *"
                            disabled={propertiesLoading || isEdit}
                            value={field.value || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '__CREATE_NEW__') {
                                handleCreateNewProperty();
                              } else {
                                field.onChange(value);
                              }
                            }}
                          >
                            {propertiesData?.data.map((property) => (
                              <MenuItem key={property.id} value={property.id} data-value={property.id}>
                                {property.address}
                                {property.fileNumber && ` (${property.fileNumber})`}
                              </MenuItem>
                            ))}
                            <MenuItem
                              value="__CREATE_NEW__"
                              sx={{
                                color: 'primary.main',
                                fontWeight: 600,
                                borderTop: (propertiesData?.data.length || 0) > 0 ? 1 : 0,
                                borderColor: 'divider',
                                '&:hover': {
                                  backgroundColor: 'primary.lighter',
                                },
                              }}
                            >
                              + צור נכס חדש
                            </MenuItem>
                          </Select>
                          {errors.propertyId && (
                            <FormHelperText>{errors.propertyId.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>

                  {/* Apartment Number */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="מספר דירה *"
                      {...register('apartmentNumber')}
                      error={!!errors.apartmentNumber}
                      helperText={errors.apartmentNumber?.message}
                      fullWidth
                      autoFocus={!isEdit}
                    />
                  </Grid>

                  {/* Floor */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="קומה"
                      type="number"
                      {...register('floor')}
                      error={!!errors.floor}
                      helperText={errors.floor?.message}
                      fullWidth
                      inputProps={{ min: 0 }}
                    />
                  </Grid>

                  {/* Room Count */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="מספר חדרים"
                      type="number"
                      {...register('roomCount')}
                      error={!!errors.roomCount}
                      helperText={errors.roomCount?.message}
                      fullWidth
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 2: Detailed Information */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InfoIcon />
                  <Typography variant="h6">פרטים מפורטים</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="unitType"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>סוג יחידה</InputLabel>
                          <Select
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value || undefined)}
                            label="סוג יחידה"
                          >
                            <MenuItem value="">ללא</MenuItem>
                            <MenuItem value={UnitType.APARTMENT}>דירה</MenuItem>
                            <MenuItem value={UnitType.STUDIO}>סטודיו</MenuItem>
                            <MenuItem value={UnitType.PENTHOUSE}>פנטהאוס</MenuItem>
                            <MenuItem value={UnitType.COMMERCIAL}>מסחרי</MenuItem>
                            <MenuItem value={UnitType.STORAGE}>מחסן</MenuItem>
                            <MenuItem value={UnitType.PARKING}>חניה</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="שטח (מ״ר)"
                      type="number"
                      inputProps={{ step: 'any' }}
                      {...register('area')}
                      error={!!errors.area}
                      helperText={errors.area?.message}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="מספר חדרי שינה"
                      type="number"
                      {...register('bedrooms')}
                      error={!!errors.bedrooms}
                      helperText={errors.bedrooms?.message}
                      fullWidth
                      inputProps={{ min: 0 }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="מספר חדרי רחצה"
                      type="number"
                      inputProps={{ step: '0.5', min: 0 }}
                      {...register('bathrooms')}
                      error={!!errors.bathrooms}
                      helperText={errors.bathrooms?.message}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="שטח מרפסת (מ״ר)"
                      type="number"
                      inputProps={{ step: 'any' }}
                      {...register('balconyArea')}
                      error={!!errors.balconyArea}
                      helperText={errors.balconyArea?.message}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="שטח מחסן (מ״ר)"
                      type="number"
                      inputProps={{ step: 'any' }}
                      {...register('storageArea')}
                      error={!!errors.storageArea}
                      helperText={errors.storageArea?.message}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 3: Amenities */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BuildIcon />
                  <Typography variant="h6">שירותים ונוחות</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          {...register('hasElevator')}
                          checked={watch('hasElevator') || false}
                        />
                      }
                      label="יש מעלית"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          {...register('hasParking')}
                          checked={watch('hasParking') || false}
                        />
                      }
                      label="יש חניה"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="מספר מקומות חניה"
                      type="number"
                      {...register('parkingSpots')}
                      error={!!errors.parkingSpots}
                      helperText={errors.parkingSpots?.message}
                      fullWidth
                      inputProps={{ min: 0 }}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 4: Status & Condition */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InfoIcon />
                  <Typography variant="h6">סטטוס ומצב</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="furnishingStatus"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>סטטוס ריהוט</InputLabel>
                          <Select
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value || undefined)}
                            label="סטטוס ריהוט"
                          >
                            <MenuItem value="">ללא</MenuItem>
                            <MenuItem value={FurnishingStatus.FURNISHED}>מרוהט</MenuItem>
                            <MenuItem value={FurnishingStatus.UNFURNISHED}>לא מרוהט</MenuItem>
                            <MenuItem value={FurnishingStatus.PARTIALLY_FURNISHED}>מרוהט חלקית</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="condition"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>מצב היחידה</InputLabel>
                          <Select
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value || undefined)}
                            label="מצב היחידה"
                          >
                            <MenuItem value="">ללא</MenuItem>
                            <MenuItem value={UnitCondition.EXCELLENT}>מצוין</MenuItem>
                            <MenuItem value={UnitCondition.GOOD}>טוב</MenuItem>
                            <MenuItem value={UnitCondition.FAIR}>הוגן</MenuItem>
                            <MenuItem value={UnitCondition.NEEDS_RENOVATION}>דורש שיפוץ</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="occupancyStatus"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>סטטוס תפוסה</InputLabel>
                          <Select
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value || undefined)}
                            label="סטטוס תפוסה"
                          >
                            <MenuItem value="">ללא</MenuItem>
                            <MenuItem value={OccupancyStatus.VACANT}>פנוי</MenuItem>
                            <MenuItem value={OccupancyStatus.OCCUPIED}>תפוס</MenuItem>
                            <MenuItem value={OccupancyStatus.UNDER_RENOVATION}>בשיפוץ</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          {...register('isOccupied')}
                          checked={watch('isOccupied') || false}
                        />
                      }
                      label="תפוס"
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 5: Dates */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon />
                  <Typography variant="h6">תאריכים</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="תאריך כניסה"
                      type="date"
                      {...register('entryDate')}
                      error={!!errors.entryDate}
                      helperText={errors.entryDate?.message}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="תאריך שיפוץ אחרון"
                      type="date"
                      {...register('lastRenovationDate')}
                      error={!!errors.lastRenovationDate}
                      helperText={errors.lastRenovationDate?.message}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 6: Financial */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachMoneyIcon />
                  <Typography variant="h6">פיננסי</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="שכירות נוכחית (₪)"
                      type="number"
                      inputProps={{ step: 'any', min: 0 }}
                      {...register('currentRent')}
                      error={!!errors.currentRent}
                      helperText={errors.currentRent?.message}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="שכירות שוק (₪)"
                      type="number"
                      inputProps={{ step: 'any', min: 0 }}
                      {...register('marketRent')}
                      error={!!errors.marketRent}
                      helperText={errors.marketRent?.message}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 7: Additional */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InfoIcon />
                  <Typography variant="h6">מידע נוסף</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="תשלומים כלולים"
                      {...register('utilities')}
                      error={!!errors.utilities}
                      helperText={errors.utilities?.message}
                      fullWidth
                      placeholder="מים, חשמל, ארנונה"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="הערות"
                      {...register('notes')}
                      error={!!errors.notes}
                      helperText={errors.notes?.message}
                      multiline
                      rows={3}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={mutation.isPending}>
            ביטול
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending || propertiesLoading}
            startIcon={mutation.isPending ? <CircularProgress size={16} /> : null}
          >
            {mutation.isPending ? 'שומר...' : isEdit ? 'שמור' : 'שמירה'}
          </Button>
        </DialogActions>
      </Box>

      {/* Inline Property Creation Dialog */}
      <Dialog
        open={createPropertyDialogOpen}
        onClose={() => setCreatePropertyDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <Box component="form" onSubmit={createPropertyForm.handleSubmit(handlePropertySubmit)} sx={{ direction: 'rtl' }}>
          <DialogTitle>נכס חדש</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="כתובת *"
                {...createPropertyForm.register('address', { required: 'כתובת היא שדה חובה' })}
                error={!!createPropertyForm.formState.errors.address}
                helperText={createPropertyForm.formState.errors.address?.message}
                fullWidth
                autoFocus
                disabled={createPropertyMutation.isPending}
              />
              <TextField
                label="מספר תיק"
                {...createPropertyForm.register('fileNumber')}
                error={!!createPropertyForm.formState.errors.fileNumber}
                helperText={createPropertyForm.formState.errors.fileNumber?.message}
                fullWidth
                disabled={createPropertyMutation.isPending}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreatePropertyDialogOpen(false)} disabled={createPropertyMutation.isPending}>
              ביטול
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createPropertyMutation.isPending}
              startIcon={createPropertyMutation.isPending ? <CircularProgress size={16} /> : null}
            >
              {createPropertyMutation.isPending ? 'שומר...' : 'שמירה'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
