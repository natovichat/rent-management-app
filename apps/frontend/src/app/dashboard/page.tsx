'use client';

import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  AccountBalance as BankIcon,
  Description as ContractIcon,
  Groups as GroupsIcon,
  Home as HomeIcon,
  CreditCard as MortgageIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  propertiesApi,
  type Property,
} from '@/lib/api/properties';
import { personsApi } from '@/lib/api/persons';
import { mortgagesApi } from '@/lib/api/mortgages';
import {
  rentalAgreementsApi,
  type RentalAgreement,
  type RentalAgreementStatus,
} from '@/lib/api/leases';
import { bankAccountsApi } from '@/lib/api/bank-accounts';

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  RESIDENTIAL: 'מגורים',
  COMMERCIAL: 'מסחרי',
  LAND: 'קרקע',
  MIXED_USE: 'מעורב',
};

const PROPERTY_STATUS_LABELS: Record<string, string> = {
  OWNED: 'בבעלות',
  IN_CONSTRUCTION: 'בבנייה',
  IN_PURCHASE: 'ברכישה',
  SOLD: 'נמכר',
  INVESTMENT: 'השקעה',
};

const LEASE_STATUS_LABELS: Record<RentalAgreementStatus, string> = {
  FUTURE: 'עתידי',
  ACTIVE: 'פעיל',
  EXPIRED: 'פג תוקף',
  TERMINATED: 'בוטל',
};

const LEASE_STATUS_COLORS: Record<RentalAgreementStatus, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
  FUTURE: 'info',
  ACTIVE: 'success',
  EXPIRED: 'warning',
  TERMINATED: 'error',
};

function SummaryCard({
  title,
  count,
  icon: Icon,
  loading,
  error,
}: {
  title: string;
  count: number;
  icon: React.ElementType;
  loading: boolean;
  error?: boolean;
}) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ textAlign: 'center', direction: 'rtl' }}>
        <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
          <Icon sx={{ fontSize: 40, color: 'primary.main' }} />
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        {loading ? (
          <Skeleton variant="text" width={60} height={40} sx={{ mx: 'auto' }} />
        ) : error ? (
          <Typography variant="h5" color="error">
            —
          </Typography>
        ) : (
          <Typography variant="h4" component="div" fontWeight="bold">
            {count.toLocaleString('he-IL')}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const { data: propertiesData, isLoading: loadingProperties, isError: errorProperties } = useQuery({
    queryKey: ['dashboard-properties'],
    queryFn: () => propertiesApi.getProperties(1, 5),
  });

  const { data: propertiesCountData } = useQuery({
    queryKey: ['dashboard-properties-count'],
    queryFn: () => propertiesApi.getProperties(1, 1),
  });

  const { data: personsData, isLoading: loadingPersons, isError: errorPersons } = useQuery({
    queryKey: ['dashboard-persons'],
    queryFn: () => personsApi.getPersons(1, 1),
  });

  const { data: mortgagesData, isLoading: loadingMortgages, isError: errorMortgages } = useQuery({
    queryKey: ['dashboard-mortgages'],
    queryFn: () => mortgagesApi.getMortgages(1, 1),
  });

  const { data: activeMortgagesData } = useQuery({
    queryKey: ['dashboard-mortgages-active'],
    queryFn: () => mortgagesApi.getMortgages(1, 1, { status: 'ACTIVE' }),
  });

  const { data: rentalAgreementsData, isLoading: loadingRentalAgreements, isError: errorRentalAgreements } = useQuery({
    queryKey: ['dashboard-rental-agreements'],
    queryFn: () => rentalAgreementsApi.getRentalAgreements(1, 5, { status: 'ACTIVE' }),
  });

  const { data: activeRentalAgreementsCountData } = useQuery({
    queryKey: ['dashboard-rental-agreements-active-count'],
    queryFn: () => rentalAgreementsApi.getRentalAgreements(1, 1, { status: 'ACTIVE' }),
  });

  const { data: bankAccountsData, isLoading: loadingBankAccounts, isError: errorBankAccounts } = useQuery({
    queryKey: ['dashboard-bank-accounts'],
    queryFn: () => bankAccountsApi.getBankAccounts(),
  });

  const properties = propertiesData?.data ?? [];
  const propertiesTotal = propertiesCountData?.meta?.total ?? 0;
  const personsTotal = personsData?.meta?.total ?? 0;
  const mortgagesTotal = mortgagesData?.meta?.total ?? 0;
  const activeMortgagesCount = activeMortgagesData?.meta?.total ?? 0;
  const activeRentalAgreements = rentalAgreementsData?.data ?? [];
  const activeRentalAgreementsCount = activeRentalAgreementsCountData?.meta?.total ?? 0;
  const bankAccountsCount = bankAccountsData?.meta?.total ?? 0;

  const hasError =
    errorProperties ||
    errorPersons ||
    errorMortgages ||
    errorRentalAgreements ||
    errorBankAccounts;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Container maxWidth="xl" sx={{ py: 4, px: { xs: 1, md: 3 }, direction: 'rtl' }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ textAlign: 'right', fontSize: { xs: '1.25rem', md: '1.5rem' } }}
      >
        לוח בקרה
      </Typography>

      {hasError && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>
            שגיאה בטעינת נתונים. ייתכן שהשרת לא זמין. נסה לרענן את הדף.
          </Typography>
        </Paper>
      )}

      {/* Summary Cards Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={4} md={2}>
          <SummaryCard
            title="נכסים"
            count={propertiesTotal}
            icon={HomeIcon}
            loading={loadingProperties}
            error={errorProperties}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <SummaryCard
            title="אנשים"
            count={personsTotal}
            icon={GroupsIcon}
            loading={loadingPersons}
            error={errorPersons}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <SummaryCard
            title="משכנתאות"
            count={mortgagesTotal}
            icon={MortgageIcon}
            loading={loadingMortgages}
            error={errorMortgages}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <SummaryCard
            title="חוזי שכירות"
            count={activeRentalAgreementsCount}
            icon={ContractIcon}
            loading={loadingRentalAgreements}
            error={errorRentalAgreements}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <SummaryCard
            title="חשבונות בנק"
            count={bankAccountsCount}
            icon={BankIcon}
            loading={loadingBankAccounts}
            error={errorBankAccounts}
          />
        </Grid>
      </Grid>

      {/* Two-column row: Recent Properties | Active Rental Agreements */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'right' }}>
              נכסים אחרונים
            </Typography>
            {loadingProperties ? (
              <Box sx={{ py: 2 }}>
                <Skeleton variant="rectangular" height={200} />
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ textAlign: 'right' }}>כתובת</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>סוג</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>סטטוס</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {properties.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} sx={{ textAlign: 'center', py: 3 }}>
                          אין נכסים
                        </TableCell>
                      </TableRow>
                    ) : (
                      properties.map((p: Property) => (
                        <TableRow
                          key={p.id}
                          onClick={() => router.push(`/properties/${p.id}`)}
                          sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                        >
                          <TableCell sx={{ textAlign: 'right' }}>{p.address}</TableCell>
                          <TableCell sx={{ textAlign: 'right' }}>
                            {p.type ? PROPERTY_TYPE_LABELS[p.type] ?? p.type : '—'}
                          </TableCell>
                          <TableCell sx={{ textAlign: 'right' }}>
                            {p.status ? PROPERTY_STATUS_LABELS[p.status] ?? p.status : '—'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'right' }}>
              חוזי שכירות פעילים
            </Typography>
            {loadingRentalAgreements ? (
              <Box sx={{ py: 2 }}>
                <Skeleton variant="rectangular" height={200} />
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ textAlign: 'right' }}>נכס</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>שכירות חודשית</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeRentalAgreements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} sx={{ textAlign: 'center', py: 3 }}>
                          אין חוזים פעילים
                        </TableCell>
                      </TableRow>
                    ) : (
                      activeRentalAgreements.map((ra: RentalAgreement) => (
                        <TableRow
                          key={ra.id}
                          onClick={() => router.push(`/leases/${ra.id}`)}
                          sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                        >
                          <TableCell sx={{ textAlign: 'right' }}>
                            {ra.property?.address ?? '—'}
                          </TableCell>
                          <TableCell sx={{ textAlign: 'right' }}>
                            ₪{ra.monthlyRent?.toLocaleString('he-IL') ?? '—'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Stats Row */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ textAlign: 'right' }}>
          סיכום
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                סה״כ נכסים
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {loadingProperties ? (
                  <Skeleton variant="text" width={40} height={40} sx={{ mx: 'auto' }} />
                ) : (
                  propertiesTotal.toLocaleString('he-IL')
                )}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                חוזי שכירות פעילים
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {loadingRentalAgreements ? (
                  <Skeleton variant="text" width={40} height={40} sx={{ mx: 'auto' }} />
                ) : (
                  activeRentalAgreementsCount.toLocaleString('he-IL')
                )}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                משכנתאות פעילות
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {loadingMortgages ? (
                  <Skeleton variant="text" width={40} height={40} sx={{ mx: 'auto' }} />
                ) : (
                  activeMortgagesCount.toLocaleString('he-IL')
                )}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
