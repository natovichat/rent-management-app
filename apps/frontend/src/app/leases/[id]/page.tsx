'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Link,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { leasesApi } from '@/lib/api/leases';
import { useAccount } from '@/contexts/AccountContext';
import { format } from 'date-fns';
import { he } from 'date-fns/locale/he';

/**
 * Get status color for lease.
 */
const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'FUTURE':
      return 'info';
    case 'EXPIRED':
      return 'warning';
    case 'TERMINATED':
      return 'error';
    default:
      return 'default';
  }
};

/**
 * Get status label in Hebrew.
 */
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'פעיל';
    case 'FUTURE':
      return 'עתידי';
    case 'EXPIRED':
      return 'פג תוקף';
    case 'TERMINATED':
      return 'בוטל';
    default:
      return status;
  }
};

/**
 * Lease detail page showing lease information.
 */
export default function LeaseDetailPage() {
  const params = useParams();
  const leaseId = params.id as string;
  const { selectedAccountId } = useAccount();


  const { data: lease, isLoading, error } = useQuery({
    queryKey: ['leases', selectedAccountId, leaseId],
    queryFn: () => leasesApi.getById(leaseId),
    enabled: !!selectedAccountId && !!leaseId,
  });


  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !lease) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="error">שגיאה בטעינת פרטי החוזה</Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/leases')}
            sx={{ mt: 2 }}
          >
            חזרה לרשימת חוזים
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Box>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push('/leases')}
              sx={{ mb: 2 }}
            >
              חזרה לרשימת חוזים
            </Button>
            <Typography variant="h4" component="h1" gutterBottom>
              חוזה שכירות
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {lease.unit?.property?.address && lease.unit?.apartmentNumber
                ? `${lease.unit.property.address} - דירה ${lease.unit.apartmentNumber}`
                : 'פרטי חוזה'}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => router.push(`/leases?edit=${leaseId}`)}
            disabled={lease.status === 'TERMINATED'}
          >
            עריכה
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Lease Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  פרטי החוזה
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      דייר
                    </Typography>
                    <Link
                      component="button"
                      variant="body1"
                      onClick={() => router.push(`/tenants/${lease.tenantId}`)}
                      sx={{
                        textDecoration: 'none',
                        color: 'primary.main',
                        '&:hover': { textDecoration: 'underline' },
                        cursor: 'pointer',
                        textAlign: 'right',
                        p: 0,
                        border: 'none',
                        background: 'none',
                      }}
                    >
                      {lease.tenant?.name || '-'}
                    </Link>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      יחידה
                    </Typography>
                    <Link
                      component="button"
                      variant="body1"
                      onClick={() => router.push(`/units/${lease.unitId}`)}
                      sx={{
                        textDecoration: 'none',
                        color: 'primary.main',
                        '&:hover': { textDecoration: 'underline' },
                        cursor: 'pointer',
                        textAlign: 'right',
                        p: 0,
                        border: 'none',
                        background: 'none',
                      }}
                    >
                      {lease.unit?.apartmentNumber
                        ? `דירה ${lease.unit.apartmentNumber}`
                        : '-'}
                    </Link>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      נכס
                    </Typography>
                    <Link
                      component="button"
                      variant="body1"
                      onClick={() =>
                        router.push(`/properties/${lease.unit?.property?.id}`)
                      }
                      sx={{
                        textDecoration: 'none',
                        color: 'primary.main',
                        '&:hover': { textDecoration: 'underline' },
                        cursor: 'pointer',
                        textAlign: 'right',
                        p: 0,
                        border: 'none',
                        background: 'none',
                      }}
                    >
                      {lease.unit?.property?.address || '-'}
                      {lease.unit?.property?.fileNumber && (
                        <span style={{ color: '#666', marginRight: '8px' }}>
                          {' '}
                          ({lease.unit.property.fileNumber})
                        </span>
                      )}
                    </Link>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      תאריך התחלה
                    </Typography>
                    <Typography variant="body1">
                      {format(new Date(lease.startDate), 'dd/MM/yyyy', {
                        locale: he,
                      })}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      תאריך סיום
                    </Typography>
                    <Typography variant="body1">
                      {format(new Date(lease.endDate), 'dd/MM/yyyy', {
                        locale: he,
                      })}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      שכירות חודשית
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontSize: '18px', fontWeight: 500, color: 'success.main' }}
                    >
                      ₪{Number(lease.monthlyRent).toLocaleString()}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      תשלום ל
                    </Typography>
                    <Typography variant="body1">{lease.paymentTo || '-'}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      סטטוס
                    </Typography>
                    <Chip
                      label={getStatusLabel(lease.status)}
                      color={getStatusColor(lease.status) as any}
                      sx={{ mt: 1 }}
                    />
                  </Box>

                  {lease.notes && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        הערות
                      </Typography>
                      <Typography variant="body1">{lease.notes}</Typography>
                    </Box>
                  )}

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      תאריך יצירה
                    </Typography>
                    <Typography variant="body1">
                      {format(new Date(lease.createdAt), 'dd/MM/yyyy', {
                        locale: he,
                      })}
                    </Typography>
                  </Box>

                  {lease.updatedAt && lease.updatedAt !== lease.createdAt && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        עודכן לאחרונה
                      </Typography>
                      <Typography variant="body1">
                        {format(new Date(lease.updatedAt), 'dd/MM/yyyy', {
                          locale: he,
                        })}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Tenant Information */}
          {lease.tenant && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    פרטי דייר
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        שם
                      </Typography>
                      <Link
                        component="button"
                        variant="body1"
                        onClick={() => router.push(`/tenants/${lease.tenantId}`)}
                        sx={{
                          textDecoration: 'none',
                          color: 'primary.main',
                          '&:hover': { textDecoration: 'underline' },
                          cursor: 'pointer',
                          textAlign: 'right',
                          p: 0,
                          border: 'none',
                          background: 'none',
                        }}
                      >
                        {lease.tenant.name}
                      </Link>
                    </Box>

                    {lease.tenant.email && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          אימייל
                        </Typography>
                        <Typography variant="body1">{lease.tenant.email}</Typography>
                      </Box>
                    )}

                    {lease.tenant.phone && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          טלפון
                        </Typography>
                        <Typography variant="body1">{lease.tenant.phone}</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  );
}
