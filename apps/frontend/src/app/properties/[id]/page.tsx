'use client';

import { flushSync } from 'react-dom';
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

  // Debug: Log snackbar state changes
