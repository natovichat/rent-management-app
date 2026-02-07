'use client';

import { useParams, useRouter } from 'next/navigation';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { tenantsApi } from '@/lib/api/tenants';
import { useAccount } from '@/contexts/AccountContext';
import { LeaseStatus } from '@/types/lease';

/**
 * Tenant detail page showing tenant information and lease history.
 */
export default function TenantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tenantId = params.id as string;
  const { selectedAccountId } = useAccount();

  const { data: tenant, isLoading, error } = useQuery({
    queryKey: ['tenants', selectedAccountId, tenantId],
    queryFn: () => tenantsApi.getById(tenantId),
    enabled: !!selectedAccountId && !!tenantId,
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

  if (error || !tenant) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="error">שגיאה בטעינת פרטי הדייר</Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/tenants')}
            sx={{ mt: 2 }}
          >
            חזרה לרשימת דיירים
          </Button>
        </Box>
      </Container>
    );
  }

  const activeLeases = tenant.leases?.filter(
    (lease: any) => lease.status === LeaseStatus.ACTIVE,
  ) || [];
  const allLeases = tenant.leases || [];

  // Sort leases by start date (most recent first)
  const sortedLeases = [...allLeases].sort((a: any, b: any) => {
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Box>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push('/tenants')}
              sx={{ mb: 2 }}
            >
              חזרה לרשימת דיירים
            </Button>
            <Typography variant="h4" component="h1" gutterBottom>
              {tenant.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              פרטי דייר
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => router.push(`/tenants?edit=${tenantId}`)}
          >
            עריכה
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Tenant Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  פרטי קשר
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {tenant.email && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        אימייל
                      </Typography>
                      <Typography variant="body1">{tenant.email}</Typography>
                    </Box>
                  )}
                  {tenant.phone && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        טלפון
                      </Typography>
                      <Typography variant="body1">{tenant.phone}</Typography>
                    </Box>
                  )}
                  {tenant.notes && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        הערות
                      </Typography>
                      <Typography variant="body1">{tenant.notes}</Typography>
                    </Box>
                  )}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      תאריך יצירה
                    </Typography>
                    <Typography variant="body1">
                      {new Date(tenant.createdAt).toLocaleDateString('he-IL')}
                    </Typography>
                  </Box>
                  {tenant.updatedAt && tenant.updatedAt !== tenant.createdAt && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        עודכן לאחרונה
                      </Typography>
                      <Typography variant="body1">
                        {new Date(tenant.updatedAt).toLocaleDateString('he-IL')}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Lease Statistics */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  סטטיסטיקות
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      חוזים פעילים
                    </Typography>
                    <Chip
                      label={activeLeases.length}
                      color="primary"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      סך הכל חוזים
                    </Typography>
                    <Chip
                      label={allLeases.length}
                      color="default"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Lease History */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  היסטוריית חוזים
                </Typography>
                {sortedLeases.length === 0 ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    אין חוזים עבור דייר זה
                  </Alert>
                ) : (
                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>כתובת נכס</TableCell>
                          <TableCell>מספר דירה</TableCell>
                          <TableCell>תאריך התחלה</TableCell>
                          <TableCell>תאריך סיום</TableCell>
                          <TableCell>שכירות חודשית</TableCell>
                          <TableCell>סטטוס</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sortedLeases.map((lease: any) => (
                          <TableRow
                            key={lease.id}
                            sx={{
                              cursor: 'pointer',
                              '&:hover': { backgroundColor: 'action.hover' },
                            }}
                            onClick={() => router.push(`/leases/${lease.id}`)}
                          >
                            <TableCell>
                              {lease.unit?.property?.address || '-'}
                            </TableCell>
                            <TableCell>
                              {lease.unit?.apartmentNumber || '-'}
                            </TableCell>
                            <TableCell>
                              {new Date(lease.startDate).toLocaleDateString(
                                'he-IL',
                              )}
                            </TableCell>
                            <TableCell>
                              {lease.endDate
                                ? new Date(lease.endDate).toLocaleDateString(
                                    'he-IL',
                                  )
                                : '-'}
                            </TableCell>
                            <TableCell>
                              {lease.monthlyRent
                                ? `₪${lease.monthlyRent.toLocaleString()}`
                                : '-'}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  lease.status === LeaseStatus.ACTIVE
                                    ? 'פעיל'
                                    : lease.status === LeaseStatus.EXPIRED
                                      ? 'פג תוקף'
                                      : lease.status === LeaseStatus.FUTURE
                                        ? 'עתידי'
                                        : lease.status
                                }
                                color={
                                  lease.status === LeaseStatus.ACTIVE
                                    ? 'success'
                                    : lease.status === LeaseStatus.EXPIRED
                                      ? 'default'
                                      : 'info'
                                }
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
