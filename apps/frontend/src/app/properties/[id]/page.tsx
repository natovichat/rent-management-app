'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Grid,
  Paper,
  Skeleton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import {
  ArrowForward as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Apartment as ApartmentIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { propertiesApi } from '@/lib/api/properties';
import PropertyForm from '@/components/properties/PropertyForm';
import UtilityInfoSection from '@/components/properties/UtilityInfoSection';
import PlanningProcessStateSection from '@/components/properties/PlanningProcessStateSection';
import PropertyOwnershipsSection from '@/components/properties/PropertyOwnershipsSection';
import PropertyLeasesSection from '@/components/properties/PropertyLeasesSection';
import PropertyMortgagesSection from '@/components/properties/PropertyMortgagesSection';
import PropertyEventsSection from '@/components/property-events/PropertyEventsSection';

// ─── Label maps ────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  OWNED: 'בבעלות',
  IN_CONSTRUCTION: 'בבנייה',
  IN_PURCHASE: 'ברכישה',
  SOLD: 'נמכר',
  INVESTMENT: 'השקעה',
};

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  OWNED: 'success',
  IN_CONSTRUCTION: 'warning',
  IN_PURCHASE: 'info',
  SOLD: 'error',
  INVESTMENT: 'default',
};

const TYPE_LABELS: Record<string, string> = {
  RESIDENTIAL: 'מגורים',
  COMMERCIAL: 'מסחרי',
  LAND: 'קרקע',
  MIXED_USE: 'מעורב',
};

const CONDITION_LABELS: Record<string, string> = {
  EXCELLENT: 'מצוין',
  GOOD: 'טוב',
  FAIR: 'סביר',
  NEEDS_RENOVATION: 'דורש שיפוץ',
};

// ─── Helper: display a single info field ───────────────────────────────────────

function InfoField({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.25}>
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}

// ─── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        {title}
      </Typography>
      <Box sx={{ mt: 1.5 }}>{children}</Box>
    </Paper>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const id = params.id as string;
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  const { data: property, isLoading, error, refetch } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertiesApi.getProperty(id),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => propertiesApi.deleteProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      router.push('/properties');
    },
    onError: () => {
      setDeleteOpen(false);
      setSnackbar({ open: true, message: 'שגיאה במחיקת הנכס. ייתכן שיש נתונים מקושרים.', severity: 'error' });
    },
  });

  if (isLoading) {
    return (
      <Box sx={{ py: { xs: 2, md: 4 }, px: { xs: 1.5, md: 3 }, overflowX: 'hidden', maxWidth: '100%' }}>
        <Skeleton variant="rectangular" height={80} sx={{ mb: 3, borderRadius: 2 }} />
        <Grid container spacing={2}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={6} key={i}>
              <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error || !property) {
    return (
      <Box sx={{ py: { xs: 2, md: 4 }, px: { xs: 1.5, md: 3 } }}>
        <Alert severity="error">שגיאה בטעינת הנכס. אנא נסה שוב.</Alert>
        <Button sx={{ mt: 2 }} onClick={() => router.push('/properties')}>
          חזרה לרשימה
        </Button>
      </Box>
    );
  }

  const statusLabel = STATUS_LABELS[property.status || ''] || property.status;
  const statusColor = STATUS_COLORS[property.status || ''] || 'default';
  const typeLabel = TYPE_LABELS[property.type || ''] || property.type;

  return (
    <Box sx={{ py: { xs: 2, md: 4 }, px: { xs: 1.5, md: 3 }, direction: 'rtl', overflowX: 'hidden', maxWidth: '100%' }}>
      {/* ── Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Button
          startIcon={<ArrowBackIcon sx={{ transform: 'rotate(180deg)' }} />}
          onClick={() => router.push('/properties')}
          variant="outlined"
          size="small"
          sx={{ flexShrink: 0 }}
        >
          {isMobile ? 'חזרה' : 'חזרה לנכסים'}
        </Button>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <ApartmentIcon color="primary" fontSize={isMobile ? 'small' : 'medium'} />
            <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={700} sx={{ wordBreak: 'break-word' }}>
              {property.address}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
            {property.status && (
              <Chip label={statusLabel} color={statusColor} size="small" />
            )}
            {property.type && (
              <Chip label={typeLabel} variant="outlined" size="small" />
            )}
            {property.isMortgaged && (
              <Chip label="משועבד" color="warning" size="small" />
            )}
          </Box>
          {(property.city || property.country) && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {[property.city, property.country].filter(Boolean).join(', ')}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
          {isMobile ? (
            <>
              <IconButton
                color="primary"
                size="small"
                onClick={() => setEditOpen(true)}
                sx={{ border: '1px solid', borderColor: 'primary.main' }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                color="error"
                size="small"
                onClick={() => setDeleteOpen(true)}
                sx={{ border: '1px solid', borderColor: 'error.main' }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </>
          ) : (
            <>
              <Button
                startIcon={<EditIcon />}
                variant="contained"
                size="small"
                onClick={() => setEditOpen(true)}
              >
                עריכת נכס
              </Button>
              <Button
                startIcon={<DeleteIcon />}
                variant="outlined"
                color="error"
                size="small"
                onClick={() => setDeleteOpen(true)}
              >
                מחיקת נכס
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* ── Sections grid ── */}
      <Grid container spacing={2}>
        {/* Basic Info */}
        <Grid item xs={12} md={6}>
          <Section title="פרטים כלליים">
            <Grid container spacing={1.5}>
              <Grid item xs={6}>
                <InfoField label="מספר תיק" value={property.fileNumber} />
              </Grid>
              <Grid item xs={6}>
                <InfoField label="גוש" value={property.gush} />
              </Grid>
              <Grid item xs={6}>
                <InfoField label="חלקה" value={property.helka} />
              </Grid>
              <Grid item xs={6}>
                <InfoField label="עיר" value={property.city} />
              </Grid>
              <Grid item xs={6}>
                <InfoField label="מדינה" value={property.country} />
              </Grid>
              <Grid item xs={6}>
                <InfoField label="שנת בנייה" value={property.constructionYear} />
              </Grid>
              <Grid item xs={6}>
                <InfoField label="שנת שיפוץ" value={property.lastRenovationYear} />
              </Grid>
              <Grid item xs={6}>
                <InfoField
                  label="מצב הנכס"
                  value={property.propertyCondition ? CONDITION_LABELS[property.propertyCondition] : undefined}
                />
              </Grid>
              <Grid item xs={6}>
                <InfoField label="קומות" value={property.floors} />
              </Grid>
              <Grid item xs={6}>
                <InfoField label="חניות" value={property.parkingSpaces} />
              </Grid>
              {property.notes && (
                <Grid item xs={12}>
                  <InfoField label="הערות" value={property.notes} />
                </Grid>
              )}
            </Grid>
          </Section>
        </Grid>

        {/* Areas */}
        <Grid item xs={12} md={6}>
          <Section title="שטחים ומידות">
            <Grid container spacing={1.5}>
              <Grid item xs={6}>
                <InfoField
                  label="שטח כולל (מ״ר)"
                  value={property.totalArea != null ? Number(property.totalArea) : undefined}
                />
              </Grid>
              <Grid item xs={6}>
                <InfoField
                  label="שטח קרקע (מ״ר)"
                  value={property.landArea != null ? Number(property.landArea) : undefined}
                />
              </Grid>
              <Grid item xs={6}>
                <InfoField
                  label="מרפסת (מ״ר)"
                  value={property.balconySizeSqm != null ? Number(property.balconySizeSqm) : undefined}
                />
              </Grid>
              <Grid item xs={6}>
                <InfoField
                  label="מחסן (מ״ר)"
                  value={property.storageSizeSqm != null ? Number(property.storageSizeSqm) : undefined}
                />
              </Grid>
            </Grid>
          </Section>
        </Grid>

        {/* Financials */}
        <Grid item xs={12} md={6}>
          <Section title="פיננסים">
            <Grid container spacing={1.5}>
              <Grid item xs={6}>
                <InfoField
                  label="מחיר רכישה"
                  value={
                    property.purchasePrice != null
                      ? `₪${Number(property.purchasePrice).toLocaleString('he-IL')}`
                      : undefined
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <InfoField
                  label="תאריך רכישה"
                  value={
                    property.purchaseDate
                      ? new Date(property.purchaseDate).toLocaleDateString('he-IL')
                      : undefined
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <InfoField
                  label="שווי מוערך"
                  value={
                    property.estimatedValue != null
                      ? `₪${Number(property.estimatedValue).toLocaleString('he-IL')}`
                      : undefined
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <InfoField
                  label="שכ״ד חודשי מוערך"
                  value={
                    property.estimatedRent != null
                      ? `₪${Number(property.estimatedRent).toLocaleString('he-IL')}`
                      : undefined
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <InfoField
                  label="הכנסת שכ״ד בפועל"
                  value={
                    property.rentalIncome != null
                      ? `₪${Number(property.rentalIncome).toLocaleString('he-IL')}`
                      : undefined
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <InfoField
                  label="תאריך הערכה אחרון"
                  value={
                    property.lastValuationDate
                      ? new Date(property.lastValuationDate).toLocaleDateString('he-IL')
                      : undefined
                  }
                />
              </Grid>
            </Grid>
          </Section>
        </Grid>

        {/* Legal / Registry */}
        <Grid item xs={12} md={6}>
          <Section title="מידע משפטי ורישום">
            <Grid container spacing={1.5}>
              <Grid item xs={6}>
                <InfoField label="מספר קדסטרלי" value={property.cadastralNumber} />
              </Grid>
              <Grid item xs={6}>
                <InfoField label="מספר זיהוי מס" value={property.taxId} />
              </Grid>
              <Grid item xs={6}>
                <InfoField
                  label="תאריך רישום"
                  value={
                    property.registrationDate
                      ? new Date(property.registrationDate).toLocaleDateString('he-IL')
                      : undefined
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <InfoField label="מספר היתר בנייה" value={property.buildingPermitNumber} />
              </Grid>
              <Grid item xs={6}>
                <InfoField label="ייעוד" value={property.zoning} />
              </Grid>
            </Grid>
          </Section>
        </Grid>

        {/* Utility Info Accordion */}
        <Grid item xs={12}>
          <UtilityInfoSection propertyId={id} defaultExpanded />
        </Grid>

        {/* Planning Process State Accordion */}
        <Grid item xs={12}>
          <PlanningProcessStateSection propertyId={id} />
        </Grid>

        {/* Ownerships Accordion */}
        <Grid item xs={12}>
          <PropertyOwnershipsSection propertyId={id} />
        </Grid>

        {/* Leases Accordion */}
        <Grid item xs={12}>
          <PropertyLeasesSection propertyId={id} />
        </Grid>

        {/* Mortgages Accordion */}
        <Grid item xs={12}>
          <PropertyMortgagesSection propertyId={id} />
        </Grid>

        {/* Property Events Accordion */}
        <Grid item xs={12}>
          <Accordion
            defaultExpanded
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              '&:before': { display: 'none' },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventIcon color="primary" />
                <Typography fontWeight={700}>אירועי הנכס</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <PropertyEventsSection propertyId={id} />
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>

      {/* Edit dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <PropertyForm
          property={property as any}
          onClose={() => setEditOpen(false)}
          onSuccess={() => {
            setEditOpen(false);
            refetch();
          }}
        />
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ direction: 'rtl' }}>מחיקת נכס</DialogTitle>
        <DialogContent sx={{ direction: 'rtl' }}>
          <Typography>
            האם אתה בטוח שברצונך למחוק את הנכס{' '}
            <strong>{property?.address}</strong>?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            פעולה זו היא בלתי הפיכה. כל הנתונים הקשורים לנכס יימחקו.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ direction: 'rtl', px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)} variant="outlined">
            ביטול
          </Button>
          <Button
            onClick={() => deleteMutation.mutate()}
            variant="contained"
            color="error"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'מוחק...' : 'מחק נכס'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
