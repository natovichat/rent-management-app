'use client';

import React, { useEffect, useState, useRef } from 'react';
import { flushSync } from 'react-dom';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Grid,
  Skeleton,
  MenuItem,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  Paper,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Apartment as ApartmentIcon,
  AccountBalance as BankIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { isAuthenticated } from '@/lib/auth';
import { propertiesApi, Property } from '@/services/properties';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { OwnershipPanel } from '@/components/properties/OwnershipPanel';
import { MortgageCard } from '@/components/properties/MortgageCard';
import MortgageForm from '@/components/mortgages/MortgageForm';
import { PropertyValueChart } from '@/components/charts/PropertyValueChart';
import { IncomeExpenseChart } from '@/components/charts/IncomeExpenseChart';
import PlotInfoPanel from '@/components/properties/PlotInfoPanel';
import ValuationsPanel from '@/components/properties/ValuationsPanel';
import GenericCsvImport from '@/components/import/GenericCsvImport';
import { ownershipsApi, Ownership, CreateOwnershipDto } from '@/lib/api/ownerships';
import { mortgagesApi, Mortgage, CreateMortgageDto } from '@/lib/api/mortgages';
import { valuationsApi, Valuation, CreateValuationDto } from '@/lib/api/valuations';
import { financialsApi, Expense, Income } from '@/lib/api/financials';
import { unitsApi, Unit } from '@/lib/api/units';
import { ownersApi, Owner, CreateOwnerDto, OwnerType } from '@/lib/api/owners';
import { bankAccountsApi, BankAccount, CreateBankAccountDto, formatBankAccountDisplay } from '@/lib/api/bank-accounts';
import { leasesApi, Lease } from '@/lib/api/leases';
import PropertyForm from '@/components/properties/PropertyForm';
import LeasesPanel from '@/components/leases/LeasesPanel';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

/**
 * Property Details Page - Comprehensive property management
 * 
 * Features:
 * - Tabbed interface (Details, Ownership, Mortgages, Financials, Units, Leases)
 * - PropertyCard component for header
 * - OwnershipPanel in Ownership tab
 * - MortgageCard components in Mortgages tab
 * - PropertyValueChart and IncomeExpenseChart in Financials tab
 * - Units display
 * - LeasesPanel in Leases tab with lease details
 * - Add owner, mortgage, valuation actions
 * - Edit property action
 * - RTL support
 */

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`property-tabpanel-${index}`}
      aria-labelledby={`property-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Helper functions for property field display
const getPropertyTypeLabel = (type?: string): string => {
  const labels: Record<string, string> = {
    RESIDENTIAL: 'מגורים',
    COMMERCIAL: 'מסחרי',
    LAND: 'קרקע',
    MIXED_USE: 'שימוש מעורב',
  };
  return type ? labels[type] || type : '';
};

const getPropertyStatusLabel = (status?: string): string => {
  const labels: Record<string, string> = {
    OWNED: 'בבעלות',
    IN_CONSTRUCTION: 'בבנייה',
    IN_PURCHASE: 'בהליכי רכישה',
    SOLD: 'נמכר',
    INVESTMENT: 'השקעה',
  };
  return status ? labels[status] || status : '';
};

const formatCurrency = (value?: number): string => {
  if (!value) return '';
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatArea = (value?: number): string => {
  if (value === undefined || value === null) return '';
  // Preserve decimals, format with Hebrew locale
  const formatted = value.toLocaleString('he-IL', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 2,
  });
  return `${formatted} מ״ר`;
};

const formatDate = (date?: string | Date): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('he-IL');
};

// Form schemas
const ownershipSchema = z.object({
  ownerId: z.string().min(1, 'בעלים הוא שדה חובה'),
  ownershipPercentage: z.number().min(0.01).max(100, 'אחוז בעלות חייב להיות בין 0 ל-100'),
  ownershipType: z.enum(['FULL', 'PARTIAL', 'PARTNERSHIP', 'COMPANY'], {
    required_error: 'סוג בעלות הוא שדה חובה',
  }),
  startDate: z.string().min(1, 'תאריך התחלה הוא שדה חובה'),
  endDate: z.string().optional(),
  notes: z.string().optional(),
});


const bankAccountSchema = z.object({
  bankName: z.string().min(1, 'שם הבנק הוא שדה חובה'),
  branchNumber: z.string().optional(),
  accountNumber: z.string().min(1, 'מספר חשבון הוא שדה חובה'),
  accountType: z.enum(['CHECKING', 'SAVINGS', 'BUSINESS']).optional(),
  accountHolder: z.string().optional(),
  notes: z.string().optional(),
});

const valuationSchema = z.object({
  estimatedValue: z.number().min(0, 'שווי חייב להיות חיובי'),
  valuationDate: z.string().min(1, 'תאריך הערכה הוא שדה חובה'),
  valuationType: z.enum(['MARKET', 'PURCHASE', 'TAX', 'APPRAISAL']),
  valuatedBy: z.string().optional(),
  notes: z.string().optional(),
});

const ownerSchema = z.object({
  name: z.string().min(1, 'שם הוא שדה חובה'),
  type: z.enum(['INDIVIDUAL', 'COMPANY', 'PARTNERSHIP']),
  email: z.string().optional().refine(
    (val) => !val || val === '' || z.string().email().safeParse(val).success,
    { message: 'כתובת אימייל לא תקינה' }
  ),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type OwnershipFormData = z.infer<typeof ownershipSchema>;
type ValuationFormData = z.infer<typeof valuationSchema>;
type OwnerFormData = z.infer<typeof ownerSchema>;
type BankAccountFormData = z.infer<typeof bankAccountSchema>;

export default function PropertyDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const propertyId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [editPropertyOpen, setEditPropertyOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ownershipDialogOpen, setOwnershipDialogOpen] = useState(false);
  const [mortgageDialogOpen, setMortgageDialogOpen] = useState(false);
  const [valuationDialogOpen, setValuationDialogOpen] = useState(false);
  const [createOwnerDialogOpen, setCreateOwnerDialogOpen] = useState(false);
  const [createBankAccountDialogOpen, setCreateBankAccountDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });
  const snackbarRef = useRef<HTMLDivElement>(null);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/');
      return;
    }
    setLoading(false);
  }, [router]);

  // Debug: Log snackbar state changes
  useEffect(() => {
    if (snackbar.open) {
      console.log('[PropertyDetailsPage] Snackbar state changed to OPEN:', snackbar.message);
    }
  }, [snackbar]);

  // Fetch property details
  const { data: property, isLoading: propertyLoading, error: propertyError } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => propertiesApi.getOne(propertyId),
    enabled: !!propertyId && !loading,
  });

  // Fetch ownerships
  const { data: ownerships = [], isLoading: ownershipsLoading } = useQuery({
    queryKey: ['ownerships', propertyId],
    queryFn: () => ownershipsApi.getPropertyOwnerships(propertyId),
    enabled: !!propertyId && !loading,
  });

  // Fetch mortgages
  const { data: mortgages = [], isLoading: mortgagesLoading } = useQuery({
    queryKey: ['mortgages', propertyId],
    queryFn: () => mortgagesApi.getPropertyMortgages(propertyId),
    enabled: !!propertyId && !loading,
  });

  // Fetch valuations
  const { data: valuations = [], isLoading: valuationsLoading } = useQuery({
    queryKey: ['valuations', propertyId],
    queryFn: () => valuationsApi.getPropertyValuations(propertyId),
    enabled: !!propertyId && !loading,
  });

  // Fetch financials
  const { data: financials, isLoading: financialsLoading } = useQuery({
    queryKey: ['financials', propertyId],
    queryFn: () => financialsApi.getPropertyFinancials(propertyId),
    enabled: !!propertyId && !loading,
  });

  // Fetch units
  const { data: unitsData, isLoading: unitsLoading } = useQuery({
    queryKey: ['units', propertyId],
    queryFn: async () => {
      const response = await unitsApi.getAll();
      // Filter units by propertyId on client side
      return response.data.filter((unit: Unit) => unit.propertyId === propertyId);
    },
    enabled: !!propertyId && !loading,
  });

  // Fetch leases for this property
  const { data: leasesData = [], isLoading: leasesLoading } = useQuery({
    queryKey: ['leases', propertyId],
    queryFn: async () => {
      // Use API filter to get leases for this property
      const response = await leasesApi.getAll(1, 1000, { propertyId });
      return response.data;
    },
    enabled: !!propertyId && !loading,
  });

  // Fetch owners for ownership form
  const { data: owners = [] } = useQuery({
    queryKey: ['owners'],
    queryFn: async () => {
      const response = await ownersApi.getOwners(1, 100); // Get first 100 owners
      return response.data;
    },
  });

  // Fetch bank accounts for mortgage form
  const { data: bankAccounts = [] } = useQuery({
    queryKey: ['bankAccounts'],
    queryFn: () => bankAccountsApi.getBankAccounts(true), // active only
  });

  // Ownership form
  const ownershipForm = useForm<OwnershipFormData>({
    resolver: zodResolver(ownershipSchema),
    defaultValues: {
      ownerId: '',
      ownershipPercentage: 0,
      ownershipType: 'PARTIAL',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      notes: '',
    },
  });


  // Valuation form
  const valuationForm = useForm<ValuationFormData>({
    resolver: zodResolver(valuationSchema),
    defaultValues: {
      estimatedValue: 0,
      valuationDate: new Date().toISOString().split('T')[0],
      valuationType: 'MARKET',
      valuatedBy: '',
      notes: '',
    },
  });

  // Owner form
  const ownerForm = useForm<OwnerFormData>({
    resolver: zodResolver(ownerSchema),
    defaultValues: {
      name: '',
      type: 'INDIVIDUAL',
      email: '',
      phone: '',
      address: '',
      notes: '',
    },
  });

  // Bank account form
  const bankAccountForm = useForm<BankAccountFormData>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      bankName: '',
      branchNumber: '',
      accountNumber: '',
      accountType: 'CHECKING',
      accountHolder: '',
      notes: '',
    },
  });

  // Mutations
  const createOwnershipMutation = useMutation({
    mutationFn: (data: CreateOwnershipDto) => ownershipsApi.createOwnership(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerships', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      setOwnershipDialogOpen(false);
      ownershipForm.reset();
      setSnackbar({ open: true, message: 'בעלות נוספה בהצלחה', severity: 'success' });
    },
    onError: (error: any) => {
      // Extract error message from backend response
      const errorMessage = error?.response?.data?.message || error?.message || 'שגיאה בהוספת בעלות';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    },
  });


  const createValuationMutation = useMutation({
    mutationFn: (data: CreateValuationDto) => valuationsApi.createValuation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['valuations', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      setValuationDialogOpen(false);
      valuationForm.reset();
      setSnackbar({ open: true, message: 'הערכת שווי נוספה בהצלחה', severity: 'success' });
    },
    onError: () => {
      setSnackbar({ open: true, message: 'שגיאה בהוספת הערכת שווי', severity: 'error' });
    },
  });

  const createOwnerMutation = useMutation({
    mutationFn: (data: OwnerFormData) => ownersApi.createOwner(data),
    onSuccess: (newOwner) => {
      queryClient.invalidateQueries({ queryKey: ['owners'] });
      setCreateOwnerDialogOpen(false);
      ownerForm.reset();
      // Automatically select the newly created owner
      ownershipForm.setValue('ownerId', newOwner.id);
      setSnackbar({ open: true, message: 'בעלים נוסף בהצלחה', severity: 'success' });
    },
    onError: () => {
      setSnackbar({ open: true, message: 'שגיאה בהוספת בעלים', severity: 'error' });
    },
  });

  const createBankAccountMutation = useMutation({
    mutationFn: (data: CreateBankAccountDto) => bankAccountsApi.createBankAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      setCreateBankAccountDialogOpen(false);
      bankAccountForm.reset();
      setSnackbar({ open: true, message: 'חשבון בנק נוסף בהצלחה', severity: 'success' });
    },
    onError: () => {
      setSnackbar({ open: true, message: 'שגיאה בהוספת חשבון בנק', severity: 'error' });
    },
  });

  // Handlers
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOwnershipSubmit = (data: OwnershipFormData) => {
    createOwnershipMutation.mutate({
      propertyId,
      ownerId: data.ownerId,
      ownershipPercentage: data.ownershipPercentage,
      ownershipType: data.ownershipType,
      startDate: data.startDate,
      endDate: data.endDate || undefined,
      notes: data.notes || undefined,
    });
  };


  const handleValuationSubmit = (data: ValuationFormData) => {
    createValuationMutation.mutate({
      propertyId,
      estimatedValue: data.estimatedValue,
      valuationDate: data.valuationDate,
      valuationType: data.valuationType,
      valuatedBy: data.valuatedBy || undefined,
      notes: data.notes || undefined,
    });
  };

  const handleOwnerSubmit = (data: OwnerFormData) => {
    createOwnerMutation.mutate(data);
  };

  const handleCreateNewOwner = () => {
    setCreateOwnerDialogOpen(true);
  };

  const handleBankAccountSubmit = (data: BankAccountFormData) => {
    createBankAccountMutation.mutate(data);
  };

  const handleCreateNewBankAccount = () => {
    setCreateBankAccountDialogOpen(true);
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: propertiesApi.delete,
    onSuccess: async () => {
      // Invalidate all property queries to force refresh
      await queryClient.invalidateQueries({ queryKey: ['properties'] });
      // Also invalidate the specific property query
      await queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      setDeleteDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'הנכס נמחק בהצלחה ✓',
        severity: 'success',
      });
      // Wait a moment for state updates, then redirect
      await new Promise(resolve => setTimeout(resolve, 100));
      // Redirect to properties list after successful deletion
      router.push('/properties');
    },
    onError: (error: any) => {
      console.error('[PropertyDetailsPage] Delete error:', error);
      console.error('[PropertyDetailsPage] Error response:', error.response);
      console.error('[PropertyDetailsPage] Error status:', error.response?.status);
      
      // Handle 403 (has units) vs other errors
      const status = error.response?.status || error.status;
      const errorMessage = status === 403
        ? 'לא ניתן למחוק נכס עם יחידות קיימות. יש למחוק את היחידות תחילה.'
        : error.response?.data?.message || error.message || 'שגיאה במחיקת הנכס';
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
      // Keep dialog open on error so user can see the error message
    },
  });

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (propertyId) {
      deleteMutation.mutate(propertyId);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  // Prepare chart data
  const valuationChartData = valuations.map((v) => ({
    date: v.valuationDate,
    value: typeof v.estimatedValue === 'string' ? parseFloat(v.estimatedValue) : v.estimatedValue,
  }));

  const financialChartData = React.useMemo(() => {
    if (!financials) return [];
    
    // Group by month
    const grouped = new Map<string, { income: number; expenses: number }>();
    
    financials.income.forEach((inc: Income) => {
      const month = inc.incomeDate.substring(0, 7); // YYYY-MM
      const existing = grouped.get(month) || { income: 0, expenses: 0 };
      grouped.set(month, { ...existing, income: existing.income + inc.amount });
    });
    
    financials.expenses.forEach((exp: Expense) => {
      const month = exp.expenseDate.substring(0, 7);
      const existing = grouped.get(month) || { income: 0, expenses: 0 };
      grouped.set(month, { ...existing, expenses: existing.expenses + exp.amount });
    });
    
    return Array.from(grouped.entries())
      .map(([period, data]) => ({
        period,
        income: data.income,
        expenses: data.expenses,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }, [financials]);

  if (loading || propertyLoading) {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (propertyError || !property) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">שגיאה בטעינת פרטי הנכס</Alert>
      </Container>
    );
  }

  // Transform property for PropertyCard
  const propertyForCard: any = {
    ...property,
    country: 'Israel',
    status: 'OWNED',
    ownerships: ownerships.map((o) => ({
      id: o.id,
      ownershipPercentage: o.ownershipPercentage,
      owner: o.owner || { id: o.ownerId, name: 'לא ידוע' },
    })),
    _count: {
      mortgages: mortgages.length,
      units: unitsData?.length || 0,
    },
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with PropertyCard */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h4" component="h1">
            פרטי נכס
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setEditPropertyOpen(true)}
            >
              ערוך נכס
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteClick}
            >
              מחק נכס
            </Button>
          </Box>
        </Box>
        <PropertyCard
          property={propertyForCard}
          onEdit={() => setEditPropertyOpen(true)}
        />
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="property tabs">
          <Tab label="פרטים" />
          <Tab label="בעלויות" />
          <Tab label="משכנתאות" />
          <Tab label="כספים" />
          <Tab label="יחידות דיור" />
          <Tab label="שכירויות" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      {/* Details Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Basic Information Section */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                פרטים כלליים
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    כתובת
                  </Typography>
                  <Typography variant="body1">{property.address}</Typography>
                </Box>
                {property.fileNumber && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      מספר תיק
                    </Typography>
                    <Typography variant="body1">{property.fileNumber}</Typography>
                  </Box>
                )}
                {property.type && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      סוג נכס
                    </Typography>
                    <Typography variant="body1">{getPropertyTypeLabel(property.type)}</Typography>
                  </Box>
                )}
                {property.status && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      סטטוס
                    </Typography>
                    <Typography variant="body1">{getPropertyStatusLabel(property.status)}</Typography>
                  </Box>
                )}
                {property.city && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      עיר
                    </Typography>
                    <Typography variant="body1">{property.city}</Typography>
                  </Box>
                )}
                {property.country && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      מדינה
                    </Typography>
                    <Typography variant="body1">
                      {property.country === 'Israel' || property.country === 'ישראל' ? 'ישראל' : property.country}
                    </Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    סטטוס משכון
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    {property.isMortgaged ? (
                      <Chip
                        label="נכס משועבד"
                        size="small"
                        color="warning"
                        icon={<BankIcon />}
                        data-testid="mortgage-status-mortgaged"
                      />
                    ) : (
                      <Typography variant="body1" data-testid="mortgage-status-not-mortgaged">
                        לא משועבד
                      </Typography>
                    )}
                  </Box>
                </Box>
                {property.notes && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      הערות
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{property.notes}</Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Area & Value Section */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                שטחים ושווי
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {property.totalArea && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      שטח כולל
                    </Typography>
                    <Typography variant="body1">{formatArea(property.totalArea)}</Typography>
                  </Box>
                )}
                {property.landArea && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      שטח קרקע
                    </Typography>
                    <Typography variant="body1">{formatArea(property.landArea)}</Typography>
                  </Box>
                )}
                {property.estimatedValue && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      שווי משוער
                    </Typography>
                    <Typography variant="body1" fontWeight="600">{formatCurrency(property.estimatedValue)}</Typography>
                  </Box>
                )}
                {property.lastValuationDate && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      תאריך הערכת שווי אחרון
                    </Typography>
                    <Typography variant="body1">{formatDate(property.lastValuationDate)}</Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Land Registry Information Section */}
          {(property.gush || property.helka) && (
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  פרטי רישום מקרקעין
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {property.gush && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        גוש
                      </Typography>
                      <Typography variant="body1">{property.gush}</Typography>
                    </Box>
                  )}
                  {property.helka && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        חלקה
                      </Typography>
                      <Typography variant="body1">{property.helka}</Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Investment Company Section */}
          {property.investmentCompanyId && (
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  חברת השקעה
                </Typography>
                <Box>
                  <Typography variant="body1">ID: {property.investmentCompanyId}</Typography>
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Plot Information Section */}
          <Grid item xs={12}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <GenericCsvImport
                importType="plot-info"
                entityLabel="פרטי חלקה"
                queryKey={['plotInfo', propertyId]}
              />
            </Box>
            <PlotInfoPanel propertyId={propertyId} />
          </Grid>

          {/* Statistics Section */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                סטטיסטיקות
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    מספר יחידות דיור
                  </Typography>
                  <Typography variant="h5">{unitsData?.length || 0}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    מספר משכנתאות
                  </Typography>
                  <Typography variant="h5">{mortgages.length}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    מספר בעלויות
                  </Typography>
                  <Typography variant="h5">{ownerships.length}</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Ownership Tab */}
      <TabPanel value={tabValue} index={1}>
        {ownershipsLoading ? (
          <Box>
            <Skeleton variant="rectangular" height={400} />
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <GenericCsvImport
                importType="ownerships"
                entityLabel="בעלויות"
                queryKey={['ownerships', propertyId]}
              />
            </Box>
            <OwnershipPanel
            propertyId={propertyId}
            ownerships={ownerships.map((o) => ({
              ...o,
              owner: o.owner || { id: o.ownerId, name: 'לא ידוע', type: 'INDIVIDUAL' },
            }))}
            onAddOwnership={() => setOwnershipDialogOpen(true)}
            onEditOwnership={(ownership) => {
              // TODO: Implement edit
              console.log('Edit ownership:', ownership);
            }}
            onDeleteOwnership={async (id) => {
              try {
                await ownershipsApi.deleteOwnership(id);
                queryClient.invalidateQueries({ queryKey: ['ownerships', propertyId] });
                setSnackbar({ open: true, message: 'בעלות נמחקה בהצלחה', severity: 'success' });
              } catch {
                setSnackbar({ open: true, message: 'שגיאה במחיקת בעלות', severity: 'error' });
              }
            }}
          />
          </>
        )}
      </TabPanel>

      {/* Mortgages Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setMortgageDialogOpen(true)}
          >
            הוסף משכנתא
          </Button>
        </Box>
        {mortgagesLoading ? (
          <Grid container spacing={2}>
            {[1, 2].map((i) => (
              <Grid item xs={12} md={6} key={i}>
                <Skeleton variant="rectangular" height={300} />
              </Grid>
            ))}
          </Grid>
        ) : mortgages.length === 0 ? (
          <Alert severity="info">לא נמצאו משכנתאות לנכס זה</Alert>
        ) : (
          <Grid container spacing={2}>
            {mortgages.map((mortgage) => (
              <Grid item xs={12} md={6} key={mortgage.id}>
                <MortgageCard
                  mortgage={{
                    ...mortgage,
                    status: mortgage.status || 'ACTIVE',
                    linkedProperties: mortgage.linkedProperties || [],
                    payments: mortgage.payments || [],
                  }}
                  propertyAddress={property.address}
                  onEdit={(mortgage) => {
                    router.push(`/mortgages/${mortgage.id}`);
                  }}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Financials Tab */}
      <TabPanel value={tabValue} index={3}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">דוחות כספיים</Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setValuationDialogOpen(true)}
          >
            הוסף הערכת שווי
          </Button>
        </Box>
        {financialsLoading || valuationsLoading ? (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Skeleton variant="rectangular" height={300} />
            </Grid>
            <Grid item xs={12}>
              <Skeleton variant="rectangular" height={300} />
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={3}>
            {/* Valuations Panel */}
            <Grid item xs={12}>
              <ValuationsPanel
                propertyId={propertyId}
                valuations={valuations}
                isLoading={valuationsLoading}
              />
            </Grid>
            {valuationChartData.length > 0 && (
              <Grid item xs={12}>
                <PropertyValueChart
                  data={valuationChartData}
                  title="שווי נכס לאורך זמן"
                  height={300}
                />
              </Grid>
            )}
            {financialChartData.length > 0 && (
              <Grid item xs={12}>
                <IncomeExpenseChart
                  data={financialChartData}
                  title="הכנסות מול הוצאות"
                  height={300}
                  variant="grouped"
                  showNet={true}
                />
              </Grid>
            )}
            {valuationChartData.length === 0 && financialChartData.length === 0 && valuations.length === 0 && (
              <Grid item xs={12}>
                <Alert severity="info">אין נתונים כספיים להצגה</Alert>
              </Grid>
            )}
          </Grid>
        )}
      </TabPanel>

      {/* Units Tab */}
      <TabPanel value={tabValue} index={4}>
        {unitsLoading ? (
          <Grid container spacing={2}>
            {[1, 2, 3].map((i) => (
              <Grid item xs={12} md={6} key={i}>
                <Skeleton variant="rectangular" height={150} />
              </Grid>
            ))}
          </Grid>
        ) : !unitsData || unitsData.length === 0 ? (
          <Alert severity="info">לא נמצאו יחידות דיור לנכס זה</Alert>
        ) : (
          <Grid container spacing={2}>
            {unitsData.map((unit) => (
              <Grid item xs={12} md={6} key={unit.id}>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <ApartmentIcon color="primary" />
                    <Typography variant="h6">יחידה {unit.apartmentNumber}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    {unit.floor && (
                      <Chip label={`קומה ${unit.floor}`} size="small" />
                    )}
                    {unit.roomCount && (
                      <Chip label={`${unit.roomCount} חדרים`} size="small" />
                    )}
                  </Box>
                  {unit.notes && (
                    <Typography variant="body2" color="text.secondary">
                      {unit.notes}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Leases Tab */}
      <TabPanel value={tabValue} index={5}>
        <LeasesPanel leases={leasesData} isLoading={leasesLoading} />
      </TabPanel>

      {/* Edit Property Dialog */}
      <Dialog open={editPropertyOpen} onClose={() => setEditPropertyOpen(false)} maxWidth="sm" fullWidth>
        <PropertyForm
          property={property}
          onClose={() => setEditPropertyOpen(false)}
          onSuccess={async () => {
            console.log('[PropertyDetailsPage] ✅ onSuccess called - property updated successfully');
            
            // Invalidate queries first
            queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
            console.log('[PropertyDetailsPage] Queries invalidated');
            
            // Set snackbar state FIRST - use flushSync to ensure immediate DOM update
            const successMessage = 'הנכס עודכן בהצלחה';
            console.log('[PropertyDetailsPage] Setting snackbar state with message:', successMessage);
            flushSync(() => {
              setSnackbar({ 
                open: true, 
                message: successMessage, 
                severity: 'success' 
              });
            });
            console.log('[PropertyDetailsPage] Snackbar state set (flushSync):', { open: true, message: successMessage });
            
            // Wait for snackbar to render BEFORE closing dialog
            await new Promise(resolve => {
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  setTimeout(() => {
                    console.log('[PropertyDetailsPage] Snackbar should be visible now');
                    resolve(undefined);
                  }, 1000); // Wait 1s for snackbar to render
                });
              });
            });
            
            console.log('[PropertyDetailsPage] Closing dialog');
            // Close dialog AFTER snackbar has rendered
            setEditPropertyOpen(false);
            console.log('[PropertyDetailsPage] Dialog closed');
          }}
        />
      </Dialog>

      {/* Add Ownership Dialog */}
      <Dialog open={ownershipDialogOpen} onClose={() => setOwnershipDialogOpen(false)} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={ownershipForm.handleSubmit(handleOwnershipSubmit)}>
          <DialogTitle>הוסף בעלות</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>בעלים</InputLabel>
                <Select
                  {...ownershipForm.register('ownerId')}
                  value={ownershipForm.watch('ownerId')}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '__CREATE_NEW__') {
                      handleCreateNewOwner();
                    } else {
                      ownershipForm.setValue('ownerId', value);
                    }
                  }}
                  label="בעלים"
                >
                  {owners.map((owner) => (
                    <MenuItem key={owner.id} value={owner.id}>
                      {owner.name}
                    </MenuItem>
                  ))}
                  <MenuItem 
                    value="__CREATE_NEW__"
                    sx={{ 
                      color: 'primary.main', 
                      fontWeight: 600,
                      borderTop: owners.length > 0 ? 1 : 0,
                      borderColor: 'divider',
                      '&:hover': {
                        backgroundColor: 'primary.lighter',
                      }
                    }}
                  >
                    + צור בעלים חדש
                  </MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="אחוז בעלות"
                type="number"
                {...ownershipForm.register('ownershipPercentage', { valueAsNumber: true })}
                error={!!ownershipForm.formState.errors.ownershipPercentage}
                helperText={ownershipForm.formState.errors.ownershipPercentage?.message}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>סוג בעלות</InputLabel>
                <Select
                  {...ownershipForm.register('ownershipType')}
                  value={ownershipForm.watch('ownershipType')}
                  onChange={(e) => ownershipForm.setValue('ownershipType', e.target.value as any)}
                  label="סוג בעלות"
                  error={!!ownershipForm.formState.errors.ownershipType}
                >
                  <MenuItem value="FULL">בעלות מלאה</MenuItem>
                  <MenuItem value="PARTIAL">בעלות חלקית</MenuItem>
                  <MenuItem value="PARTNERSHIP">שותפות</MenuItem>
                  <MenuItem value="COMPANY">חברה</MenuItem>
                </Select>
                {ownershipForm.formState.errors.ownershipType && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                    {ownershipForm.formState.errors.ownershipType.message}
                  </Typography>
                )}
              </FormControl>
              <TextField
                label="תאריך התחלה"
                type="date"
                {...ownershipForm.register('startDate')}
                InputLabelProps={{ shrink: true }}
                error={!!ownershipForm.formState.errors.startDate}
                helperText={ownershipForm.formState.errors.startDate?.message}
                fullWidth
              />
              <TextField
                label="תאריך סיום (אופציונלי)"
                type="date"
                {...ownershipForm.register('endDate')}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="הערות"
                {...ownershipForm.register('notes')}
                multiline
                rows={3}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOwnershipDialogOpen(false)}>ביטול</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createOwnershipMutation.isPending}
            >
              {createOwnershipMutation.isPending ? 'שומר...' : 'שמירה'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Add Mortgage Dialog */}
      <MortgageForm
        open={mortgageDialogOpen}
        onClose={() => setMortgageDialogOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['mortgages', propertyId] });
          queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
          setMortgageDialogOpen(false);
          setSnackbar({ open: true, message: 'משכנתא נוספה בהצלחה', severity: 'success' });
        }}
        propertyId={propertyId}
      />

      {/* Add Valuation Dialog */}
      <Dialog open={valuationDialogOpen} onClose={() => setValuationDialogOpen(false)} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={valuationForm.handleSubmit(handleValuationSubmit)}>
          <DialogTitle>הוסף הערכת שווי</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="שווי משוער"
                type="number"
                {...valuationForm.register('estimatedValue', { valueAsNumber: true })}
                error={!!valuationForm.formState.errors.estimatedValue}
                helperText={valuationForm.formState.errors.estimatedValue?.message}
                fullWidth
              />
              <TextField
                label="תאריך הערכה"
                type="date"
                {...valuationForm.register('valuationDate')}
                InputLabelProps={{ shrink: true }}
                error={!!valuationForm.formState.errors.valuationDate}
                helperText={valuationForm.formState.errors.valuationDate?.message}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>סוג הערכה</InputLabel>
                <Select
                  {...valuationForm.register('valuationType')}
                  value={valuationForm.watch('valuationType')}
                  onChange={(e) => valuationForm.setValue('valuationType', e.target.value as any)}
                  label="סוג הערכה"
                >
                  <MenuItem value="MARKET">שווי שוק</MenuItem>
                  <MenuItem value="PURCHASE">מחיר רכישה</MenuItem>
                  <MenuItem value="TAX">שווי מס</MenuItem>
                  <MenuItem value="APPRAISAL">שמאות</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="מעריך"
                {...valuationForm.register('valuatedBy')}
                fullWidth
              />
              <TextField
                label="הערות"
                {...valuationForm.register('notes')}
                multiline
                rows={3}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setValuationDialogOpen(false)}>ביטול</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createValuationMutation.isPending}
            >
              {createValuationMutation.isPending ? 'שומר...' : 'שמירה'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Create Owner Dialog */}
      <Dialog 
        open={createOwnerDialogOpen} 
        onClose={() => setCreateOwnerDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <Box component="form" onSubmit={ownerForm.handleSubmit(handleOwnerSubmit)}>
          <DialogTitle>צור בעלים חדש</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="שם *"
                {...ownerForm.register('name')}
                error={!!ownerForm.formState.errors.name}
                helperText={ownerForm.formState.errors.name?.message}
                fullWidth
                autoFocus
              />
              <FormControl fullWidth>
                <InputLabel>סוג בעלים *</InputLabel>
                <Select
                  {...ownerForm.register('type')}
                  value={ownerForm.watch('type')}
                  onChange={(e) => ownerForm.setValue('type', e.target.value as OwnerType)}
                  error={!!ownerForm.formState.errors.type}
                >
                  <MenuItem value="INDIVIDUAL">פרטי</MenuItem>
                  <MenuItem value="COMPANY">חברה</MenuItem>
                  <MenuItem value="PARTNERSHIP">שותפות</MenuItem>
                </Select>
                {ownerForm.formState.errors.type && (
                  <FormHelperText error>{ownerForm.formState.errors.type.message}</FormHelperText>
                )}
              </FormControl>
              <TextField
                label="אימייל"
                type="email"
                {...ownerForm.register('email')}
                error={!!ownerForm.formState.errors.email}
                helperText={ownerForm.formState.errors.email?.message}
                fullWidth
              />
              <TextField
                label="טלפון"
                {...ownerForm.register('phone')}
                error={!!ownerForm.formState.errors.phone}
                helperText={ownerForm.formState.errors.phone?.message}
                fullWidth
              />
              <TextField
                label="כתובת"
                {...ownerForm.register('address')}
                error={!!ownerForm.formState.errors.address}
                helperText={ownerForm.formState.errors.address?.message}
                fullWidth
              />
              <TextField
                label="הערות"
                {...ownerForm.register('notes')}
                multiline
                rows={3}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateOwnerDialogOpen(false)}>ביטול</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createOwnerMutation.isPending}
            >
              {createOwnerMutation.isPending ? 'יוצר...' : 'צור בעלים'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Create Bank Account Dialog */}
      <Dialog 
        open={createBankAccountDialogOpen} 
        onClose={() => setCreateBankAccountDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <Box component="form" onSubmit={bankAccountForm.handleSubmit(handleBankAccountSubmit)}>
          <DialogTitle>צור חשבון בנק חדש</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="שם הבנק *"
                {...bankAccountForm.register('bankName')}
                error={!!bankAccountForm.formState.errors.bankName}
                helperText={bankAccountForm.formState.errors.bankName?.message}
                placeholder="למשל: בנק הפועלים"
                fullWidth
                autoFocus
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="מספר סניף"
                    {...bankAccountForm.register('branchNumber')}
                    error={!!bankAccountForm.formState.errors.branchNumber}
                    helperText={bankAccountForm.formState.errors.branchNumber?.message}
                    placeholder="למשל: 689"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="מספר חשבון *"
                    {...bankAccountForm.register('accountNumber')}
                    error={!!bankAccountForm.formState.errors.accountNumber}
                    helperText={bankAccountForm.formState.errors.accountNumber?.message}
                    placeholder="למשל: 123456"
                    fullWidth
                  />
                </Grid>
              </Grid>
              <FormControl fullWidth>
                <InputLabel>סוג חשבון</InputLabel>
                <Select
                  {...bankAccountForm.register('accountType')}
                  value={bankAccountForm.watch('accountType') || 'CHECKING'}
                  onChange={(e) => bankAccountForm.setValue('accountType', e.target.value as any)}
                  label="סוג חשבון"
                >
                  <MenuItem value="CHECKING">חשבון עו"ש</MenuItem>
                  <MenuItem value="SAVINGS">חשבון חיסכון</MenuItem>
                  <MenuItem value="BUSINESS">חשבון עסקי</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="שם בעל החשבון"
                {...bankAccountForm.register('accountHolder')}
                error={!!bankAccountForm.formState.errors.accountHolder}
                helperText={bankAccountForm.formState.errors.accountHolder?.message}
                placeholder="למשל: יוסי כהן"
                fullWidth
              />
              <TextField
                label="הערות"
                {...bankAccountForm.register('notes')}
                multiline
                rows={3}
                fullWidth
                placeholder="הערות נוספות על החשבון"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateBankAccountDialogOpen(false)}>ביטול</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createBankAccountMutation.isPending}
            >
              {createBankAccountMutation.isPending ? 'יוצר...' : 'צור חשבון בנק'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>מחיקת נכס</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את הנכס "{property?.address}"?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            פעולה זו לא ניתנת לביטול. הנכס יימחק לצמיתות.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>ביטול</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'מוחק...' : 'מחק'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        ref={snackbarRef}
        open={snackbar.open && !!snackbar.message}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        data-testid="property-details-snackbar"
        TransitionProps={{
          timeout: { enter: 225, exit: 195 }, // Explicit transition timing
          onEntered: () => {
            console.log('[PropertyDetailsPage] ✅ Snackbar transition entered - now fully visible in DOM');
            console.log('[PropertyDetailsPage] Snackbar message:', snackbar.message);
          },
        }}
        sx={{
          zIndex: 1400, // Ensure it's above Dialog (z-index 1300)
          '& .MuiSnackbar-root': {
            pointerEvents: 'auto', // Ensure it's interactive
          },
        }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          data-testid="property-details-alert"
        >
          <span data-testid="snackbar-message-text">
            {snackbar.message || 'הנכס עודכן בהצלחה'}
          </span>
        </Alert>
      </Snackbar>
    </Container>
  );
}
