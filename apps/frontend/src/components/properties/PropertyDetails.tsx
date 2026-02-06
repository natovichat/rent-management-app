'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Grid,
} from '@mui/material';
import {
  Home as HomeIcon,
  Apartment as ApartmentIcon,
  Person as PersonIcon,
  AccountBalance as BankIcon,
  TrendingUp as TrendingUpIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
} from '@mui/icons-material';
import { propertiesApi, PropertyWithDetails } from '@/services/properties';

interface PropertyDetailsProps {
  propertyId: string;
}

/**
 * PropertyDetails component - Displays detailed information about a property.
 * 
 * Features:
 * - Property information display
 * - Units list with active leases
 * - RTL layout support
 * - Loading and error states
 */
export default function PropertyDetails({ propertyId }: PropertyDetailsProps) {
  const { data: property, isLoading, error } = useQuery<PropertyWithDetails>({
    queryKey: ['properties', propertyId],
    queryFn: () => propertiesApi.getOne(propertyId),
  });

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        שגיאה בטעינת פרטי הנכס. אנא נסה שוב.
      </Alert>
    );
  }

  if (!property) {
    return (
      <Alert severity="warning">נכס לא נמצא</Alert>
    );
  }

  // Helper function to format currency
  const formatCurrency = (value: number | undefined) => {
    if (!value) return '-';
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Check for active mortgages
  const activeMortgages = property.mortgages?.filter(
    (m) => m.status === 'ACTIVE'
  ) || [];

  return (
    <Box>
      {/* Property Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <HomeIcon color="primary" />
          <Typography variant="h5" component="h1">
            {property.address}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {property.fileNumber && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                מספר תיק:
              </Typography>
              <Typography variant="body1">{property.fileNumber}</Typography>
            </Grid>
          )}
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              מספר יחידות:
            </Typography>
            <Typography variant="body1">{property.unitCount}</Typography>
          </Grid>
          {property.notes && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                הערות:
              </Typography>
              <Typography variant="body1">{property.notes}</Typography>
            </Grid>
          )}
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              תאריך יצירה:
            </Typography>
            <Typography variant="body1">
              {new Date(property.createdAt).toLocaleDateString('he-IL')}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              תאריך עדכון אחרון:
            </Typography>
            <Typography variant="body1">
              {new Date(property.updatedAt).toLocaleDateString('he-IL')}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Financial Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <TrendingUpIcon color="primary" />
          <Typography variant="h6">מידע פיננסי</Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Valuation */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary" gutterBottom>
                שווי משוער
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {formatCurrency(property.estimatedValue)}
              </Typography>
              {property.lastValuationDate && (
                <Typography variant="caption" color="text.secondary">
                  עדכון אחרון:{' '}
                  {new Date(property.lastValuationDate).toLocaleDateString(
                    'he-IL'
                  )}
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Mortgage Status */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2,
                bgcolor: property.isMortgaged
                  ? 'warning.lighter'
                  : 'success.lighter',
                borderRadius: 1,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 1,
                }}
              >
                {property.isMortgaged ? (
                  <LockIcon color="warning" />
                ) : (
                  <LockOpenIcon color="success" />
                )}
                <Typography variant="body2" color="text.secondary">
                  סטטוס שעבוד
                </Typography>
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: property.isMortgaged
                    ? 'warning.dark'
                    : 'success.dark',
                }}
              >
                {property.isMortgaged ? 'נכס משועבד' : 'נכס לא משועבד'}
              </Typography>
              {activeMortgages.length > 0 && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BankIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {activeMortgages.length} משכנתא
                    {activeMortgages.length === 1 ? '' : 'ות'} פעיל
                    {activeMortgages.length === 1 ? 'ה' : 'ות'}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Active Mortgages Details */}
          {activeMortgages.length > 0 && (
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                פרטי משכנתאות:
              </Typography>
              <Grid container spacing={2}>
                {activeMortgages.map((mortgage) => (
                  <Grid item xs={12} md={6} key={mortgage.id}>
                    <Box
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="body2" fontWeight={600}>
                        {mortgage.lender}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mt: 1,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          יתרה:
                        </Typography>
                        <Typography variant="body2">
                          {formatCurrency(mortgage.remainingAmount)}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mt: 0.5,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          ריבית:
                        </Typography>
                        <Typography variant="body2">
                          {mortgage.interestRate}%
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mt: 0.5,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          סיום:
                        </Typography>
                        <Typography variant="body2">
                          {new Date(mortgage.endDate).toLocaleDateString(
                            'he-IL'
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Units Section */}
      {property.units && property.units.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            יחידות דיור
          </Typography>
          <Grid container spacing={2}>
            {property.units.map((unit) => (
              <Grid item xs={12} md={6} key={unit.id}>
                <Paper sx={{ p: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <ApartmentIcon color="primary" />
                    <Typography variant="h6">
                      יחידה {unit.apartmentNumber}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    {unit.floor && (
                      <Chip
                        label={`קומה ${unit.floor}`}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    )}
                    {unit.roomCount && (
                      <Chip
                        label={`${unit.roomCount} חדרים`}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    )}
                  </Box>

                  {unit.leases && unit.leases.length > 0 && (
                    <Box>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="subtitle2" gutterBottom>
                        חוזים פעילים:
                      </Typography>
                      {unit.leases.map((lease) => (
                        <Box
                          key={lease.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mt: 1,
                          }}
                        >
                          <PersonIcon fontSize="small" />
                          <Typography variant="body2">
                            {lease.tenant.name}
                          </Typography>
                          <Chip
                            label={lease.status}
                            size="small"
                            color={
                              lease.status === 'ACTIVE' ? 'success' : 'default'
                            }
                            sx={{ mr: 'auto' }}
                          />
                        </Box>
                      ))}
                    </Box>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {(!property.units || property.units.length === 0) && (
        <Alert severity="info">אין יחידות דיור בנכס זה</Alert>
      )}
    </Box>
  );
}
