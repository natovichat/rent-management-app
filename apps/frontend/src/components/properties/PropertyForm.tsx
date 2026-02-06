'use client';

import { useState } from 'react';
import { flushSync } from 'react-dom';
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
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  TextareaAutosize,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Home as HomeIcon,
  SquareFoot as SquareFootIcon,
  AttachMoney as AttachMoneyIcon,
  Gavel as GavelIcon,
  Info as InfoIcon,
  Landscape as LandscapeIcon,
  AccountBalance as AccountBalanceIcon,
  ShoppingCart as ShoppingCartIcon,
  Business as BusinessIcon,
  Receipt as ReceiptIcon,
  Security as SecurityIcon,
  Build as BuildIcon,
  Assessment as AssessmentIcon,
  BusinessCenter as BusinessCenterIcon,
  Note as NoteIcon,
} from '@mui/icons-material';
import { propertiesApi, Property, CreatePropertyDto } from '@/services/properties';
import { investmentCompaniesApi, InvestmentCompany, CreateInvestmentCompanyDto } from '@/services/investmentCompanies';
import { useAccount } from '@/contexts/AccountContext';

/**
 * Helper function to coerce string/number to number or undefined
 * Used for optional numeric fields that should allow empty values
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

/**
 * Helper function to coerce string/number to integer or undefined
 */
const coerceOptionalInt = (val: unknown): number | undefined => {
  const num = coerceOptionalNumber(val);
  return num !== undefined ? Math.floor(num) : undefined;
};

/**
 * Comprehensive validation schema for property form with all 50+ fields.
 */
const propertySchema = z
  .object({
    // Basic Information
    address: z.string().min(3, 'כתובת חייבת להכיל לפחות 3 תווים'),
    fileNumber: z.string().optional(),
    type: z.preprocess(
      (val) => (val === '' || val === null ? undefined : val),
      z.enum(['RESIDENTIAL', 'COMMERCIAL', 'LAND', 'MIXED_USE']).optional()
    ),
    status: z.preprocess(
      (val) => (val === '' || val === null ? undefined : val),
      z.enum(['OWNED', 'IN_CONSTRUCTION', 'IN_PURCHASE', 'SOLD', 'INVESTMENT']).optional()
    ),
    country: z.string().optional(),
    city: z.string().optional(),

    // Area & Dimensions - Optional numeric fields that allow empty values
    totalArea: z.preprocess(
      coerceOptionalNumber,
      z.union([z.number().positive('שטח כולל חייב להיות מספר חיובי'), z.undefined()])
    ),
    landArea: z.preprocess(
      coerceOptionalNumber,
      z.union([z.number().positive('שטח קרקע חייב להיות מספר חיובי'), z.undefined()])
    ),
    floors: z.preprocess(
      coerceOptionalInt,
      z.union([z.number().int().min(0, 'מספר קומות חייב להיות מספר שלם לא שלילי'), z.undefined()])
    ),
    totalUnits: z.preprocess(
      coerceOptionalInt,
      z.union([z.number().int().min(0, 'מספר יחידות חייב להיות מספר שלם לא שלילי'), z.undefined()])
    ),
    parkingSpaces: z.preprocess(
      coerceOptionalInt,
      z.union([z.number().int().min(0, 'מספר מקומות חניה חייב להיות מספר שלם לא שלילי'), z.undefined()])
    ),
    balconyArea: z.preprocess(
      coerceOptionalNumber,
      z.union([z.number().positive('שטח מרפסת חייב להיות מספר חיובי'), z.undefined()])
    ),

    // Financial Details
    estimatedValue: z.preprocess(
      coerceOptionalNumber,
      z.union([z.number().positive('שווי משוער חייב להיות מספר חיובי'), z.undefined()])
    ),
    acquisitionPrice: z.preprocess(
      coerceOptionalNumber,
      z.union([z.number().positive('מחיר רכישה חייב להיות מספר חיובי'), z.undefined()])
    ),
    acquisitionDate: z.string().optional(),
    acquisitionMethod: z.preprocess(
      (val) => (val === '' || val === null ? undefined : val),
      z.enum(['PURCHASE', 'INHERITANCE', 'GIFT', 'EXCHANGE', 'OTHER']).optional()
    ),
    rentalIncome: z.preprocess(
      coerceOptionalNumber,
      z.union([z.number().min(0, 'הכנסה משכירות חייבת להיות לא שלילית'), z.undefined()])
    ),
    projectedValue: z.preprocess(
      coerceOptionalNumber,
      z.union([z.number().positive('שווי צפוי חייב להיות מספר חיובי'), z.undefined()])
    ),

    // Legal & Registry
    gush: z.string().optional(),
    helka: z.string().optional(),
    cadastralNumber: z.string().optional(),
    taxId: z.string().optional(),
    registrationDate: z.string().optional(),
    legalStatus: z.preprocess(
      (val) => (val === '' || val === null ? undefined : val),
      z.enum(['REGISTERED', 'IN_REGISTRATION', 'DISPUTED', 'CLEAR']).optional()
    ),

    // Property Details
    constructionYear: z.preprocess(
      coerceOptionalInt,
      z.union([z.number().int().min(1800).max(2100, 'שנת בנייה חייבת להיות בין 1800 ל-2100'), z.undefined()])
    ),
    lastRenovationYear: z.preprocess(
      coerceOptionalInt,
      z.union([z.number().int().min(1800).max(2100, 'שנת שיפוץ חייבת להיות בין 1800 ל-2100'), z.undefined()])
    ),
    buildingPermitNumber: z.string().optional(),
    propertyCondition: z.preprocess(
      (val) => (val === '' || val === null ? undefined : val),
      z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'NEEDS_RENOVATION']).optional()
    ),
    floor: z.preprocess(
      coerceOptionalInt,
      z.union([z.number().int(), z.undefined()])
    ),
    storage: z.boolean().optional(),

    // Land Information
    landType: z.preprocess(
      (val) => (val === '' || val === null ? undefined : val),
      z.enum(['URBAN', 'AGRICULTURAL', 'INDUSTRIAL', 'MIXED']).optional()
    ),
    landDesignation: z.string().optional(),
    plotSize: z.preprocess(
      coerceOptionalNumber,
      z.union([z.number().positive('גודל חלקה חייב להיות מספר חיובי'), z.undefined()])
    ),
    buildingPotential: z.string().optional(),

    // Ownership
    isPartialOwnership: z.boolean().optional(),
    sharedOwnershipPercentage: z.preprocess(
      coerceOptionalNumber,
      z.union([z.number().min(0).max(100, 'אחוז בעלות חייב להיות בין 0-100'), z.undefined()])
    ),
    coOwners: z.string().optional(),
    isMortgaged: z.boolean().optional(),

    // Sale Information
    isSold: z.boolean().optional(),
    saleDate: z.string().optional(),
    salePrice: z.preprocess(
      coerceOptionalNumber,
      z.union([z.number().positive('מחיר מכירה חייב להיות מספר חיובי'), z.undefined()])
    ),
    isSoldPending: z.boolean().optional(),

    // Management
    propertyManager: z.string().optional(),
    managementCompany: z.string().optional(),
    managementFees: z.preprocess(
      coerceOptionalNumber,
      z.union([z.number().min(0, 'דמי ניהול חייבים להיות לא שליליים'), z.undefined()])
    ),
    managementFeeFrequency: z.preprocess(
      (val) => (val === '' || val === null ? undefined : val),
      z.enum(['MONTHLY', 'QUARTERLY', 'ANNUAL']).optional()
    ),

    // Financial Obligations
    taxAmount: z.preprocess(
      coerceOptionalNumber,
      z.union([z.number().min(0, 'סכום מס חייב להיות לא שלילי'), z.undefined()])
    ),
    taxFrequency: z.preprocess(
      (val) => (val === '' || val === null ? undefined : val),
      z.enum(['MONTHLY', 'QUARTERLY', 'ANNUAL']).optional()
    ),
    lastTaxPayment: z.string().optional(),

    // Insurance
    insuranceDetails: z.string().optional(),
    insuranceExpiry: z.string().optional(),

    // Utilities & Infrastructure
    zoning: z.string().optional(),
    utilities: z.string().optional(),
    restrictions: z.string().optional(),

    // Valuation
    lastValuationDate: z.string().optional(),
    estimationSource: z.preprocess(
      (val) => (val === '' || val === null ? undefined : val),
      z.enum(['PROFESSIONAL_APPRAISAL', 'MARKET_ESTIMATE', 'TAX_ASSESSMENT', 'OWNER_ESTIMATE']).optional()
    ),

    // Investment Company
    investmentCompanyId: z.string().optional(),

    // Additional Information
    developmentStatus: z.string().optional(),
    developmentCompany: z.string().optional(),
    expectedCompletionYears: z.preprocess(
      coerceOptionalInt,
      z.union([z.number().int().min(0), z.undefined()])
    ),
    propertyDetails: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.landArea && data.totalArea) {
        const landAreaNum = typeof data.landArea === 'number' ? data.landArea : parseFloat(data.landArea as any);
        const totalAreaNum = typeof data.totalArea === 'number' ? data.totalArea : parseFloat(data.totalArea as any);
        return landAreaNum <= totalAreaNum;
      }
      return true;
    },
    { message: 'שטח קרקע לא יכול להיות גדול משטח כולל', path: ['landArea'] },
  );

type PropertyFormData = z.infer<typeof propertySchema>;

/**
 * Investment Company creation schema
 */
const companySchema = z.object({
  name: z.string().min(1, 'שם הוא שדה חובה'),
  country: z.string().min(1, 'מדינה היא שדה חובה').default('Israel'),
  registrationNumber: z.string().optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface PropertyFormProps {
  property?: Property | null;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * PropertyForm component - Comprehensive form for creating/editing properties with all 50+ fields.
 *
 * Features:
 * - Accordion-based layout with 15 collapsible sections
 * - React Hook Form integration
 * - Zod validation with Hebrew error messages
 * - Inline Investment Company creation
 * - RTL layout support
 * - Loading states
 */
export default function PropertyForm({
  property,
  onClose,
  onSuccess,
}: PropertyFormProps) {
  const queryClient = useQueryClient();
  const isEdit = !!property;
  
  // ✅ Get selected account ID from AccountContext
  const { selectedAccountId } = useAccount();

  // Investment Company inline creation state
  const [createCompanyDialogOpen, setCreateCompanyDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Fetch investment companies
  const { data: investmentCompaniesResponse } = useQuery({
    queryKey: ['investment-companies'],
    queryFn: () => investmentCompaniesApi.getAll(),
  });
  const investmentCompanies = investmentCompaniesResponse?.data || [];

  // Property form
  const propertyForm = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: property
      ? {
          address: property.address || '',
          fileNumber: property.fileNumber || '',
          type: property.type,
          status: property.status,
          country: property.country || 'Israel',
          city: property.city || '',
          totalArea: property.totalArea,
          landArea: property.landArea,
          floors: property.floors,
          totalUnits: property.totalUnits,
          parkingSpaces: property.parkingSpaces,
          balconyArea: property.balconyArea,
          estimatedValue: property.estimatedValue,
          acquisitionPrice: property.acquisitionPrice,
          acquisitionDate: property.acquisitionDate ? property.acquisitionDate.split('T')[0] : '',
          acquisitionMethod: property.acquisitionMethod,
          rentalIncome: property.rentalIncome,
          projectedValue: property.projectedValue,
          gush: property.gush || '',
          helka: property.helka || '',
          cadastralNumber: property.cadastralNumber || '',
          taxId: property.taxId || '',
          registrationDate: property.registrationDate ? property.registrationDate.split('T')[0] : '',
          legalStatus: property.legalStatus,
          constructionYear: property.constructionYear,
          lastRenovationYear: property.lastRenovationYear,
          buildingPermitNumber: property.buildingPermitNumber || '',
          propertyCondition: property.propertyCondition,
          floor: property.floor,
          storage: property.storage || false,
          landType: property.landType,
          landDesignation: property.landDesignation || '',
          plotSize: property.plotSize,
          buildingPotential: property.buildingPotential || '',
          isPartialOwnership: property.isPartialOwnership || false,
          sharedOwnershipPercentage: property.sharedOwnershipPercentage,
          coOwners: property.coOwners || '',
          isMortgaged: property.isMortgaged || false,
          isSold: property.isSold || false,
          saleDate: property.saleDate ? property.saleDate.split('T')[0] : '',
          salePrice: property.salePrice,
          isSoldPending: property.isSoldPending || false,
          propertyManager: property.propertyManager || '',
          managementCompany: property.managementCompany || '',
          managementFees: property.managementFees,
          managementFeeFrequency: property.managementFeeFrequency,
          taxAmount: property.taxAmount,
          taxFrequency: property.taxFrequency,
          lastTaxPayment: property.lastTaxPayment ? property.lastTaxPayment.split('T')[0] : '',
          insuranceDetails: property.insuranceDetails || '',
          insuranceExpiry: property.insuranceExpiry ? property.insuranceExpiry.split('T')[0] : '',
          zoning: property.zoning || '',
          utilities: property.utilities || '',
          restrictions: property.restrictions || '',
          lastValuationDate: property.lastValuationDate ? property.lastValuationDate.split('T')[0] : '',
          estimationSource: property.estimationSource,
          investmentCompanyId: property.investmentCompanyId || '',
          developmentStatus: property.developmentStatus || '',
          developmentCompany: property.developmentCompany || '',
          expectedCompletionYears: property.expectedCompletionYears,
          propertyDetails: property.propertyDetails || '',
          notes: property.notes || '',
        }
      : {
          address: '',
          fileNumber: '',
          country: 'Israel',
          city: '',
          isMortgaged: false,
          storage: false,
          isPartialOwnership: false,
          isSold: false,
          isSoldPending: false,
        },
  });

  // Investment Company form
  const companyForm = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      country: 'Israel',
      registrationNumber: '',
    },
  });

  // Helper function to remove undefined/null/empty/NaN values from object
  const removeUndefined = <T extends Record<string, any>>(obj: T): Partial<T> => {
    const filtered = Object.fromEntries(
      Object.entries(obj).filter(([key, value]) => {
        // Keep address (required field)
        if (key === 'address') return true;
        // Remove undefined, null, empty strings
        if (value === undefined || value === null || value === '') return false;
        // Remove NaN values (can occur with invalid number inputs)
        if (typeof value === 'number' && isNaN(value)) return false;
        // Keep all other values (including false for booleans, 0 for numbers)
        return true;
      })
    ) as Partial<T>;
    console.log('[PropertyForm] Filtered submitData (removed undefined/null/empty/NaN):', filtered);
    return filtered;
  };

  // Property mutation
  const propertyMutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      console.log('[PropertyForm] mutationFn called with data:', data);
      console.log('[PropertyForm] Data keys:', Object.keys(data));
      console.log('[PropertyForm] Data values sample:', {
        totalArea: data.totalArea,
        floors: data.floors,
        totalUnits: data.totalUnits,
        parkingSpaces: data.parkingSpaces,
        storage: data.storage,
        isPartialOwnership: data.isPartialOwnership,
      });
      
      // Build submitData object, only including fields with actual values
      // Numeric fields are already numbers or undefined from schema preprocessing
      const rawSubmitData: any = {
        address: data.address, // Required field
        ...(data.fileNumber && { fileNumber: data.fileNumber }),
        ...(data.type && { type: data.type }),
        ...(data.status && { status: data.status }),
        ...(data.country && { country: data.country }),
        ...(data.city && { city: data.city }),
        ...(data.totalArea !== undefined && { totalArea: data.totalArea }),
        ...(data.landArea !== undefined && { landArea: data.landArea }),
        ...(data.floors !== undefined && { floors: data.floors }),
        ...(data.totalUnits !== undefined && { totalUnits: data.totalUnits }),
        ...(data.parkingSpaces !== undefined && { parkingSpaces: data.parkingSpaces }),
        ...(data.balconyArea !== undefined && { balconyArea: data.balconyArea }),
        ...(data.estimatedValue !== undefined && { estimatedValue: data.estimatedValue }),
        ...(data.acquisitionPrice !== undefined && { acquisitionPrice: data.acquisitionPrice }),
        ...(data.acquisitionDate && { acquisitionDate: data.acquisitionDate }),
        ...(data.acquisitionMethod && { acquisitionMethod: data.acquisitionMethod }),
        ...(data.rentalIncome !== undefined && { rentalIncome: data.rentalIncome }),
        ...(data.projectedValue !== undefined && { projectedValue: data.projectedValue }),
        ...(data.gush && { gush: data.gush }),
        ...(data.helka && { helka: data.helka }),
        ...(data.cadastralNumber && { cadastralNumber: data.cadastralNumber }),
        ...(data.taxId && { taxId: data.taxId }),
        ...(data.registrationDate && { registrationDate: data.registrationDate }),
        ...(data.legalStatus && { legalStatus: data.legalStatus }),
        ...(data.constructionYear !== undefined && { constructionYear: data.constructionYear }),
        ...(data.lastRenovationYear !== undefined && { lastRenovationYear: data.lastRenovationYear }),
        ...(data.buildingPermitNumber && { buildingPermitNumber: data.buildingPermitNumber }),
        ...(data.propertyCondition && { propertyCondition: data.propertyCondition }),
        ...(data.floor !== undefined && { floor: data.floor }),
        ...(data.storage !== undefined && data.storage !== false && { storage: data.storage }),
        ...(data.landType && { landType: data.landType }),
        ...(data.landDesignation && { landDesignation: data.landDesignation }),
        ...(data.plotSize !== undefined && { plotSize: data.plotSize }),
        ...(data.buildingPotential && { buildingPotential: data.buildingPotential }),
        ...(data.isPartialOwnership !== undefined && data.isPartialOwnership !== false && { isPartialOwnership: data.isPartialOwnership }),
        ...(data.sharedOwnershipPercentage !== undefined && { sharedOwnershipPercentage: data.sharedOwnershipPercentage }),
        ...(data.coOwners && { coOwners: data.coOwners }),
        ...(data.isMortgaged !== undefined && data.isMortgaged !== false && { isMortgaged: data.isMortgaged }),
        ...(data.isSold !== undefined && data.isSold !== false && { isSold: data.isSold }),
        ...(data.saleDate && { saleDate: data.saleDate }),
        ...(data.salePrice !== undefined && { salePrice: data.salePrice }),
        ...(data.isSoldPending !== undefined && data.isSoldPending !== false && { isSoldPending: data.isSoldPending }),
        ...(data.propertyManager && { propertyManager: data.propertyManager }),
        ...(data.managementCompany && { managementCompany: data.managementCompany }),
        ...(data.managementFees !== undefined && { managementFees: data.managementFees }),
        ...(data.managementFeeFrequency && { managementFeeFrequency: data.managementFeeFrequency }),
        ...(data.taxAmount !== undefined && { taxAmount: data.taxAmount }),
        ...(data.taxFrequency && { taxFrequency: data.taxFrequency }),
        ...(data.lastTaxPayment && { lastTaxPayment: data.lastTaxPayment }),
        ...(data.insuranceDetails && { insuranceDetails: data.insuranceDetails }),
        ...(data.insuranceExpiry && { insuranceExpiry: data.insuranceExpiry }),
        ...(data.zoning && { zoning: data.zoning }),
        ...(data.utilities && { utilities: data.utilities }),
        ...(data.restrictions && { restrictions: data.restrictions }),
        ...(data.lastValuationDate && { lastValuationDate: data.lastValuationDate }),
        ...(data.estimationSource && { estimationSource: data.estimationSource }),
        ...(data.investmentCompanyId && { investmentCompanyId: data.investmentCompanyId }),
        ...(data.developmentStatus && { developmentStatus: data.developmentStatus }),
        ...(data.developmentCompany && { developmentCompany: data.developmentCompany }),
        ...(data.expectedCompletionYears !== undefined && { expectedCompletionYears: data.expectedCompletionYears }),
        ...(data.propertyDetails && { propertyDetails: data.propertyDetails }),
        ...(data.notes && { notes: data.notes }),
      };
      
      console.log('[PropertyForm] Raw submitData before filtering:', rawSubmitData);
      console.log('[PropertyForm] Raw submitData keys:', Object.keys(rawSubmitData));
      
      // Remove undefined/null/empty values - backend rejects fields that "should not exist"
      const submitData = removeUndefined(rawSubmitData) as CreatePropertyDto;
      
      console.log('[PropertyForm] Final submitData:', submitData);
      console.log('[PropertyForm] Final submitData keys:', Object.keys(submitData));
      console.log('[PropertyForm] Is edit mode?', isEdit);
      
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/5f8ed50f-0709-4648-bb8f-261a88441c96',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PropertyForm.tsx:495',message:'Frontend sending API request',data:{isEdit,submitDataKeys:Object.keys(submitData),submitDataSample:{address:submitData.address,type:submitData.type,status:submitData.status,totalArea:submitData.totalArea,floors:submitData.floors,totalUnits:submitData.totalUnits,parkingSpaces:submitData.parkingSpaces},fieldTypes:Object.entries(submitData).reduce((acc:Record<string,string>,[k,v])=>{acc[k]=typeof v;return acc},{})},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,B'})}).catch(()=>{});
      // #endregion
      
      try {
        // accountId is automatically included by API interceptor - no need to pass it!
        const result = isEdit
          ? await propertiesApi.update(property!.id, submitData)
          : await propertiesApi.create(submitData);
        console.log('[PropertyForm] API call successful:', result);
        
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/5f8ed50f-0709-4648-bb8f-261a88441c96',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PropertyForm.tsx:505',message:'API call succeeded',data:{resultId:result?.id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'SUCCESS'})}).catch(()=>{});
        // #endregion
        
        return result;
      } catch (error) {
        console.error('[PropertyForm] API call failed:', error);
        
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/5f8ed50f-0709-4648-bb8f-261a88441c96',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PropertyForm.tsx:511',message:'API call failed',data:{errorMessage:(error as any)?.message,errorResponse:(error as any)?.response?.status,errorData:(error as any)?.response?.data},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'ERROR'})}).catch(()=>{});
        // #endregion
        
        throw error;
      }
    },
    // onSuccess: Success is now handled in handlePropertySubmit
    // This gives us better control and ensures notification shows in parent component
    onError: (error: any) => {
      console.error('Form submission error:', error);
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'שגיאה בשמירת נכס',
        severity: 'error',
      });
    },
  });

  // Investment Company creation mutation
  const createCompanyMutation = useMutation({
    mutationFn: (data: CompanyFormData) => investmentCompaniesApi.create(data),
    onSuccess: (newCompany) => {
      queryClient.invalidateQueries({ queryKey: ['investment-companies'] });
      setCreateCompanyDialogOpen(false);
      companyForm.reset();
      // Auto-select newly created company
      propertyForm.setValue('investmentCompanyId', newCompany.id);
      setSnackbar({
        open: true,
        message: 'חברת השקעה נוספה בהצלחה',
        severity: 'success',
      });
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: 'שגיאה בהוספת חברת השקעה',
        severity: 'error',
      });
    },
  });

  const handlePropertySubmit = async (data: PropertyFormData) => {
    console.log('[PropertyForm] Submit handler called');
    console.log('[PropertyForm] Form data:', data);
    console.log('[PropertyForm] Calling mutation...');
    
    try {
      // Use mutateAsync for direct control over success/error handling
      const result = await propertyMutation.mutateAsync(data);
      console.log('[PropertyForm] ✅ Mutation completed successfully:', result);
      console.log('[PropertyForm] Result ID:', result?.id);
      
      // Invalidate queries to refresh list
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      
      // Reset form
      propertyForm.reset();
      
      // ALWAYS show snackbar in PropertyForm (for E2E test compatibility)
      // This ensures snackbar is visible even if parent callback closes dialog quickly
      const successMessage = isEdit ? 'הנכס עודכן בהצלחה' : 'הנכס נוסף בהצלחה';
      console.log('[PropertyForm] ✅ Mutation succeeded! Showing success snackbar:', successMessage);
      console.log('[PropertyForm] Current snackbar state before update:', snackbar);
      
      // Set snackbar state - use flushSync to ensure immediate DOM update
      flushSync(() => {
        setSnackbar({
          open: true,
          message: successMessage,
          severity: 'success',
        });
      });
      console.log('[PropertyForm] Snackbar state set via flushSync:', { open: true, message: successMessage });
      
      // Wait for React to process state update and render snackbar
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(() => {
              // Verify snackbar state was set
              console.log('[PropertyForm] After delay - checking if snackbar should be visible');
              resolve(undefined);
            }, 1500);
          });
        });
      });
      console.log('[PropertyForm] Snackbar render delay completed');
      
      // Call parent onSuccess callback if provided
      if (onSuccess) {
        console.log('[PropertyForm] 🎉 Calling onSuccess callback!');
        // Don't close dialog immediately - let snackbar show first
        setTimeout(() => {
          onSuccess();
        }, 500);
      } else {
        // If no parent callback, close dialog after snackbar shows
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    } catch (error: any) {
      // ✅ Error handling - show error notification
      console.error('[PropertyForm] ❌ Mutation failed:', error);
      console.error('[PropertyForm] Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'שגיאה בשמירת הנכס',
        severity: 'error',
      });
    }
  };

  const handleCompanySubmit = (data: CompanyFormData) => {
    createCompanyMutation.mutate(data);
  };

  const handleCreateNewCompany = () => {
    setCreateCompanyDialogOpen(true);
  };

  return (
    <>
      <Box 
        component="form" 
        onSubmit={propertyForm.handleSubmit(
          handlePropertySubmit,
          (errors) => {
            console.error('[PropertyForm] Form validation errors:', errors);
            console.error('[PropertyForm] Form values:', propertyForm.getValues());
          }
        )} 
        sx={{ direction: 'rtl' }}
        data-testid="property-form"
      >
        <DialogTitle>{isEdit ? 'עריכת נכס' : 'נכס חדש'}</DialogTitle>

        <DialogContent sx={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {/* Section 1: Basic Information - Always Expanded */}
            <Accordion defaultExpanded data-testid="accordion-מידע-בסיסי">
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                data-testid="accordion-summary-מידע-בסיסי"
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HomeIcon />
                  <Typography variant="h6">מידע בסיסי</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="כתובת *"
                      {...propertyForm.register('address')}
                      error={!!propertyForm.formState.errors.address}
                      helperText={propertyForm.formState.errors.address?.message}
                      fullWidth
                      autoFocus
                      disabled={propertyMutation.isPending}
                      data-testid="property-address-input"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="מספר תיק"
                      {...propertyForm.register('fileNumber')}
                      error={!!propertyForm.formState.errors.fileNumber}
                      helperText={propertyForm.formState.errors.fileNumber?.message}
                      fullWidth
                      disabled={propertyMutation.isPending}
                      data-testid="property-file-number-input"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>סוג נכס</InputLabel>
                      <Controller
                        name="type"
                        control={propertyForm.control as any}
                        defaultValue={undefined}
                        render={({ field }) => (
                          <Select
                            value={field.value || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? undefined : value);
                            }}
                            onBlur={field.onBlur}
                            name={field.name}
                            label="סוג נכס"
                            disabled={propertyMutation.isPending}
                            data-testid="property-type-select"
                          >
                            <MenuItem value="RESIDENTIAL">מגורים</MenuItem>
                            <MenuItem value="COMMERCIAL">מסחרי</MenuItem>
                            <MenuItem value="LAND">קרקע</MenuItem>
                            <MenuItem value="MIXED_USE">שימוש מעורב</MenuItem>
                          </Select>
                        )}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>סטטוס</InputLabel>
                      <Controller
                        name="status"
                        control={propertyForm.control as any}
                        defaultValue={undefined}
                        render={({ field }) => (
                          <Select
                            value={field.value || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? undefined : value);
                            }}
                            onBlur={field.onBlur}
                            name={field.name}
                            label="סטטוס"
                            disabled={propertyMutation.isPending}
                            data-testid="property-status-select"
                          >
                            <MenuItem value="OWNED">בבעלות</MenuItem>
                            <MenuItem value="IN_CONSTRUCTION">בבנייה</MenuItem>
                            <MenuItem value="IN_PURCHASE">בהליכי רכישה</MenuItem>
                            <MenuItem value="SOLD">נמכר</MenuItem>
                            <MenuItem value="INVESTMENT">השקעה</MenuItem>
                          </Select>
                        )}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="מדינה"
                      {...propertyForm.register('country')}
                      error={!!propertyForm.formState.errors.country}
                      helperText={propertyForm.formState.errors.country?.message}
                      fullWidth
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="עיר"
                      {...propertyForm.register('city')}
                      error={!!propertyForm.formState.errors.city}
                      helperText={propertyForm.formState.errors.city?.message}
                      fullWidth
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 2: Area & Dimensions */}
            <Accordion data-testid="accordion-שטחים-ומידות">
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                data-testid="accordion-summary-שטחים-ומידות"
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SquareFootIcon />
                  <Typography variant="h6">שטחים ומידות</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="שטח כולל (מ״ר)"
                      type="number"
                      inputProps={{ step: 'any' }}
                      {...propertyForm.register('totalArea')}
                      error={!!propertyForm.formState.errors.totalArea}
                      helperText={propertyForm.formState.errors.totalArea?.message}
                      fullWidth
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="שטח קרקע (מ״ר)"
                      type="number"
                      inputProps={{ step: 'any' }}
                      {...propertyForm.register('landArea')}
                      error={!!propertyForm.formState.errors.landArea}
                      helperText={propertyForm.formState.errors.landArea?.message}
                      fullWidth
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="מספר קומות"
                      type="number"
                      {...propertyForm.register('floors')}
                      error={!!propertyForm.formState.errors.floors}
                      helperText={propertyForm.formState.errors.floors?.message}
                      fullWidth
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="מספר יחידות כולל"
                      type="number"
                      {...propertyForm.register('totalUnits')}
                      error={!!propertyForm.formState.errors.totalUnits}
                      helperText={propertyForm.formState.errors.totalUnits?.message}
                      fullWidth
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="מספר מקומות חניה"
                      type="number"
                      {...propertyForm.register('parkingSpaces')}
                      error={!!propertyForm.formState.errors.parkingSpaces}
                      helperText={propertyForm.formState.errors.parkingSpaces?.message}
                      fullWidth
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="שטח מרפסת (מ״ר)"
                      type="number"
                      {...propertyForm.register('balconyArea')}
                      error={!!propertyForm.formState.errors.balconyArea}
                      helperText={propertyForm.formState.errors.balconyArea?.message}
                      fullWidth
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 3: Financial Details */}
            <Accordion data-testid="accordion-פרטים-פיננסיים">
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                data-testid="accordion-summary-פרטים-פיננסיים"
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachMoneyIcon />
                  <Typography variant="h6">פרטים פיננסיים</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="שווי משוער (₪)"
                      type="number"
                      inputProps={{ step: 'any' }}
                      {...propertyForm.register('estimatedValue')}
                      error={!!propertyForm.formState.errors.estimatedValue}
                      helperText={propertyForm.formState.errors.estimatedValue?.message}
                      fullWidth
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="מחיר רכישה (₪)"
                      type="number"
                      inputProps={{ step: 'any' }}
                      {...propertyForm.register('acquisitionPrice')}
                      error={!!propertyForm.formState.errors.acquisitionPrice}
                      helperText={propertyForm.formState.errors.acquisitionPrice?.message}
                      fullWidth
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="תאריך רכישה"
                      type="date"
                      {...propertyForm.register('acquisitionDate')}
                      error={!!propertyForm.formState.errors.acquisitionDate}
                      helperText={propertyForm.formState.errors.acquisitionDate?.message}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>שיטת רכישה</InputLabel>
                      <Select
                        value={propertyForm.watch('acquisitionMethod') || ''}
                        onChange={(e) => propertyForm.setValue('acquisitionMethod', e.target.value as any)}
                        label="שיטת רכישה"
                        disabled={propertyMutation.isPending}
                      >
                        <MenuItem value="PURCHASE">רכישה</MenuItem>
                        <MenuItem value="INHERITANCE">ירושה</MenuItem>
                        <MenuItem value="GIFT">מתנה</MenuItem>
                        <MenuItem value="EXCHANGE">החלפה</MenuItem>
                        <MenuItem value="OTHER">אחר</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="הכנסה משכירות (₪)"
                      type="number"
                      inputProps={{ step: 'any' }}
                      {...propertyForm.register('rentalIncome')}
                      error={!!propertyForm.formState.errors.rentalIncome}
                      helperText={propertyForm.formState.errors.rentalIncome?.message}
                      fullWidth
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="שווי צפוי (₪)"
                      type="number"
                      inputProps={{ step: 'any' }}
                      {...propertyForm.register('projectedValue')}
                      error={!!propertyForm.formState.errors.projectedValue}
                      helperText={propertyForm.formState.errors.projectedValue?.message}
                      fullWidth
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 4: Legal & Registry */}
            <Accordion data-testid="accordion-משפטי-ורישום">
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                data-testid="accordion-summary-משפטי-ורישום"
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GavelIcon />
                  <Typography variant="h6">משפטי ורישום</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="גוש"
                      {...propertyForm.register('gush')}
                      error={!!propertyForm.formState.errors.gush}
                      helperText={propertyForm.formState.errors.gush?.message}
                      fullWidth
                      placeholder="למשל: 6158"
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="חלקה"
                      {...propertyForm.register('helka')}
                      error={!!propertyForm.formState.errors.helka}
                      helperText={propertyForm.formState.errors.helka?.message}
                      fullWidth
                      placeholder="למשל: 371"
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="מספר קדסטרלי"
                      {...propertyForm.register('cadastralNumber')}
                      error={!!propertyForm.formState.errors.cadastralNumber}
                      helperText={propertyForm.formState.errors.cadastralNumber?.message}
                      fullWidth
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="מספר זהות מס"
                      {...propertyForm.register('taxId')}
                      error={!!propertyForm.formState.errors.taxId}
                      helperText={propertyForm.formState.errors.taxId?.message}
                      fullWidth
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="תאריך רישום"
                      type="date"
                      {...propertyForm.register('registrationDate')}
                      error={!!propertyForm.formState.errors.registrationDate}
                      helperText={propertyForm.formState.errors.registrationDate?.message}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>סטטוס משפטי</InputLabel>
                      <Select
                        value={propertyForm.watch('legalStatus') || ''}
                        onChange={(e) => propertyForm.setValue('legalStatus', e.target.value as any)}
                        label="סטטוס משפטי"
                        disabled={propertyMutation.isPending}
                      >
                        <MenuItem value="REGISTERED">רשום</MenuItem>
                        <MenuItem value="IN_REGISTRATION">בהליכי רישום</MenuItem>
                        <MenuItem value="DISPUTED">במחלוקת</MenuItem>
                        <MenuItem value="CLEAR">נקי</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 5: Property Details */}
            <Accordion data-testid="accordion-פרטי-הנכס">
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                data-testid="accordion-summary-פרטי-הנכס"
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InfoIcon />
                  <Typography variant="h6">פרטי הנכס</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="שנת בנייה"
                      type="number"
                      {...propertyForm.register('constructionYear')}
                      error={!!propertyForm.formState.errors.constructionYear}
                      helperText={propertyForm.formState.errors.constructionYear?.message}
                      fullWidth
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="שנת שיפוץ אחרונה"
                      type="number"
                      {...propertyForm.register('lastRenovationYear')}
                      error={!!propertyForm.formState.errors.lastRenovationYear}
                      helperText={propertyForm.formState.errors.lastRenovationYear?.message}
                      fullWidth
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="מספר היתר בנייה"
                      {...propertyForm.register('buildingPermitNumber')}
                      error={!!propertyForm.formState.errors.buildingPermitNumber}
                      helperText={propertyForm.formState.errors.buildingPermitNumber?.message}
                      fullWidth
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>מצב הנכס</InputLabel>
                      <Select
                        value={propertyForm.watch('propertyCondition') || ''}
                        onChange={(e) => propertyForm.setValue('propertyCondition', e.target.value as any)}
                        label="מצב הנכס"
                        disabled={propertyMutation.isPending}
                      >
                        <MenuItem value="EXCELLENT">מצוין</MenuItem>
                        <MenuItem value="GOOD">טוב</MenuItem>
                        <MenuItem value="FAIR">בינוני</MenuItem>
                        <MenuItem value="NEEDS_RENOVATION">דורש שיפוץ</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="קומה"
                      type="number"
                      {...propertyForm.register('floor')}
                      error={!!propertyForm.formState.errors.floor}
                      helperText={propertyForm.formState.errors.floor?.message}
                      fullWidth
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={propertyForm.watch('storage') || false}
                          onChange={(e) => propertyForm.setValue('storage', e.target.checked)}
                          disabled={propertyMutation.isPending}
                        />
                      }
                      label="מחסן"
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 6: Land Information */}
            <Accordion data-testid="accordion-מידע-על-הקרקע">
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                data-testid="accordion-summary-מידע-על-הקרקע"
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LandscapeIcon />
                  <Typography variant="h6">מידע על הקרקע</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>סוג קרקע</InputLabel>
                      <Select
                        value={propertyForm.watch('landType') || ''}
                        onChange={(e) => propertyForm.setValue('landType', e.target.value as any)}
                        label="סוג קרקע"
                        disabled={propertyMutation.isPending}
                      >
                        <MenuItem value="URBAN">עירוני</MenuItem>
                        <MenuItem value="AGRICULTURAL">חקלאי</MenuItem>
                        <MenuItem value="INDUSTRIAL">תעשייתי</MenuItem>
                        <MenuItem value="MIXED">מעורב</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="ייעוד קרקע"
                      {...propertyForm.register('landDesignation')}
                      error={!!propertyForm.formState.errors.landDesignation}
                      helperText={propertyForm.formState.errors.landDesignation?.message}
                      fullWidth
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="גודל חלקה (מ״ר)"
                      type="number"
                      {...propertyForm.register('plotSize')}
                      error={!!propertyForm.formState.errors.plotSize}
                      helperText={propertyForm.formState.errors.plotSize?.message}
                      fullWidth
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="פוטנציאל בנייה"
                      {...propertyForm.register('buildingPotential')}
                      error={!!propertyForm.formState.errors.buildingPotential}
                      helperText={propertyForm.formState.errors.buildingPotential?.message}
                      fullWidth
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 7: Ownership */}
            <Accordion data-testid="accordion-בעלות">
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                data-testid="accordion-summary-בעלות"
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountBalanceIcon />
                  <Typography variant="h6">בעלות</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={propertyForm.watch('isPartialOwnership') || false}
                          onChange={(e) => propertyForm.setValue('isPartialOwnership', e.target.checked)}
                          disabled={propertyMutation.isPending}
                        />
                      }
                      label="בעלות חלקית"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="אחוז בעלות משותפת (%)"
                      type="number"
                      {...propertyForm.register('sharedOwnershipPercentage')}
                      error={!!propertyForm.formState.errors.sharedOwnershipPercentage}
                      helperText={propertyForm.formState.errors.sharedOwnershipPercentage?.message}
                      fullWidth
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="שותפים"
                      {...propertyForm.register('coOwners')}
                      error={!!propertyForm.formState.errors.coOwners}
                      helperText={propertyForm.formState.errors.coOwners?.message}
                      fullWidth
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={propertyForm.watch('isMortgaged') || false}
                          onChange={(e) => propertyForm.setValue('isMortgaged', e.target.checked)}
                          disabled={propertyMutation.isPending}
                          data-testid="is-mortgaged-checkbox"
                        />
                      }
                      label="הנכס משועבד"
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 8: Sale Information */}
            <Accordion data-testid="accordion-מידע-מכירה">
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                data-testid="accordion-summary-מידע-מכירה"
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ShoppingCartIcon />
                  <Typography variant="h6">מידע מכירה</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={propertyForm.watch('isSold') || false}
                          onChange={(e) => propertyForm.setValue('isSold', e.target.checked)}
                          disabled={propertyMutation.isPending}
                        />
                      }
                      label="נמכר"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="תאריך מכירה"
                      type="date"
                      {...propertyForm.register('saleDate')}
                      error={!!propertyForm.formState.errors.saleDate}
                      helperText={propertyForm.formState.errors.saleDate?.message}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="מחיר מכירה (₪)"
                      type="number"
                      {...propertyForm.register('salePrice')}
                      error={!!propertyForm.formState.errors.salePrice}
                      helperText={propertyForm.formState.errors.salePrice?.message}
                      fullWidth
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={propertyForm.watch('isSoldPending') || false}
                          onChange={(e) => propertyForm.setValue('isSoldPending', e.target.checked)}
                          disabled={propertyMutation.isPending}
                        />
                      }
                      label="מכירה בהליכים"
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 9: Management */}
            <Accordion data-testid="accordion-ניהול">
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                data-testid="accordion-summary-ניהול"
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon />
                  <Typography variant="h6">ניהול</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="מנהל נכס"
                      {...propertyForm.register('propertyManager')}
                      error={!!propertyForm.formState.errors.propertyManager}
                      helperText={propertyForm.formState.errors.propertyManager?.message}
                      fullWidth
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="חברת ניהול"
                      {...propertyForm.register('managementCompany')}
                      error={!!propertyForm.formState.errors.managementCompany}
                      helperText={propertyForm.formState.errors.managementCompany?.message}
                      fullWidth
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="דמי ניהול (₪)"
                      type="number"
                      {...propertyForm.register('managementFees')}
                      error={!!propertyForm.formState.errors.managementFees}
                      helperText={propertyForm.formState.errors.managementFees?.message}
                      fullWidth
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>תדירות תשלום דמי ניהול</InputLabel>
                      <Select
                        value={propertyForm.watch('managementFeeFrequency') || ''}
                        onChange={(e) => propertyForm.setValue('managementFeeFrequency', e.target.value as any)}
                        label="תדירות תשלום דמי ניהול"
                        disabled={propertyMutation.isPending}
                      >
                        <MenuItem value="MONTHLY">חודשי</MenuItem>
                        <MenuItem value="QUARTERLY">רבעוני</MenuItem>
                        <MenuItem value="ANNUAL">שנתי</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 10: Financial Obligations */}
            <Accordion data-testid="accordion-התחייבויות-פיננסיות">
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                data-testid="accordion-summary-התחייבויות-פיננסיות"
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ReceiptIcon />
                  <Typography variant="h6">התחייבויות פיננסיות</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="סכום מס (₪)"
                      type="number"
                      {...propertyForm.register('taxAmount')}
                      error={!!propertyForm.formState.errors.taxAmount}
                      helperText={propertyForm.formState.errors.taxAmount?.message}
                      fullWidth
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>תדירות תשלום מס</InputLabel>
                      <Select
                        value={propertyForm.watch('taxFrequency') || ''}
                        onChange={(e) => propertyForm.setValue('taxFrequency', e.target.value as any)}
                        label="תדירות תשלום מס"
                        disabled={propertyMutation.isPending}
                      >
                        <MenuItem value="MONTHLY">חודשי</MenuItem>
                        <MenuItem value="QUARTERLY">רבעוני</MenuItem>
                        <MenuItem value="ANNUAL">שנתי</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="תאריך תשלום מס אחרון"
                      type="date"
                      {...propertyForm.register('lastTaxPayment')}
                      error={!!propertyForm.formState.errors.lastTaxPayment}
                      helperText={propertyForm.formState.errors.lastTaxPayment?.message}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 11: Insurance */}
            <Accordion data-testid="accordion-ביטוח">
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                data-testid="accordion-summary-ביטוח"
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SecurityIcon />
                  <Typography variant="h6">ביטוח</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="פרטי ביטוח"
                      {...propertyForm.register('insuranceDetails')}
                      error={!!propertyForm.formState.errors.insuranceDetails}
                      helperText={propertyForm.formState.errors.insuranceDetails?.message}
                      fullWidth
                      multiline
                      rows={3}
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="תאריך תפוגת ביטוח"
                      type="date"
                      {...propertyForm.register('insuranceExpiry')}
                      error={!!propertyForm.formState.errors.insuranceExpiry}
                      helperText={propertyForm.formState.errors.insuranceExpiry?.message}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 12: Utilities & Infrastructure */}
            <Accordion data-testid="accordion-תשתיות-ושירותים">
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                data-testid="accordion-summary-תשתיות-ושירותים"
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BuildIcon />
                  <Typography variant="h6">תשתיות ושירותים</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="ייעוד (תכנון)"
                      {...propertyForm.register('zoning')}
                      error={!!propertyForm.formState.errors.zoning}
                      helperText={propertyForm.formState.errors.zoning?.message}
                      fullWidth
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="תשתיות"
                      {...propertyForm.register('utilities')}
                      error={!!propertyForm.formState.errors.utilities}
                      helperText={propertyForm.formState.errors.utilities?.message}
                      fullWidth
                      disabled={propertyMutation.isPending}
                      placeholder="למשל: חשמל, מים, ביוב, גז"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="הגבלות"
                      {...propertyForm.register('restrictions')}
                      error={!!propertyForm.formState.errors.restrictions}
                      helperText={propertyForm.formState.errors.restrictions?.message}
                      fullWidth
                      multiline
                      rows={3}
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 13: Valuation */}
            <Accordion data-testid="accordion-הערכת-שווי">
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                data-testid="accordion-summary-הערכת-שווי"
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssessmentIcon />
                  <Typography variant="h6">הערכת שווי</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="תאריך הערכת שווי אחרונה"
                      type="date"
                      {...propertyForm.register('lastValuationDate')}
                      error={!!propertyForm.formState.errors.lastValuationDate}
                      helperText={propertyForm.formState.errors.lastValuationDate?.message}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>מקור הערכת שווי</InputLabel>
                      <Select
                        value={propertyForm.watch('estimationSource') || ''}
                        onChange={(e) => propertyForm.setValue('estimationSource', e.target.value as any)}
                        label="מקור הערכת שווי"
                        disabled={propertyMutation.isPending}
                      >
                        <MenuItem value="PROFESSIONAL_APPRAISAL">הערכת שמאי מקצועי</MenuItem>
                        <MenuItem value="MARKET_ESTIMATE">הערכת שוק</MenuItem>
                        <MenuItem value="TAX_ASSESSMENT">שווי מס</MenuItem>
                        <MenuItem value="OWNER_ESTIMATE">הערכת בעלים</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 14: Investment Company */}
            <Accordion data-testid="accordion-חברת-השקעה">
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                data-testid="accordion-summary-חברת-השקעה"
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessCenterIcon />
                  <Typography variant="h6">חברת השקעה</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>חברת השקעה</InputLabel>
                      <Select
                        value={propertyForm.watch('investmentCompanyId') || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '__CREATE_NEW__') {
                            handleCreateNewCompany();
                          } else {
                            propertyForm.setValue('investmentCompanyId', value);
                          }
                        }}
                        label="חברת השקעה"
                        disabled={propertyMutation.isPending}
                      >
                        <MenuItem value="">
                          <em>ללא</em>
                        </MenuItem>
                        {investmentCompanies.map((company) => (
                          <MenuItem key={company.id} value={company.id}>
                            {company.name}
                          </MenuItem>
                        ))}
                        <MenuItem
                          value="__CREATE_NEW__"
                          sx={{
                            color: 'primary.main',
                            fontWeight: 600,
                            borderTop: investmentCompanies.length > 0 ? 1 : 0,
                            borderColor: 'divider',
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            },
                          }}
                        >
                          + צור חברת השקעה חדשה
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 15: Additional Information */}
            <Accordion data-testid="accordion-מידע-נוסף">
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                data-testid="accordion-summary-מידע-נוסף"
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NoteIcon />
                  <Typography variant="h6">מידע נוסף</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="סטטוס פיתוח"
                      {...propertyForm.register('developmentStatus')}
                      error={!!propertyForm.formState.errors.developmentStatus}
                      helperText={propertyForm.formState.errors.developmentStatus?.message}
                      fullWidth
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="חברת פיתוח"
                      {...propertyForm.register('developmentCompany')}
                      error={!!propertyForm.formState.errors.developmentCompany}
                      helperText={propertyForm.formState.errors.developmentCompany?.message}
                      fullWidth
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="שנים צפויות להשלמה"
                      type="number"
                      {...propertyForm.register('expectedCompletionYears')}
                      error={!!propertyForm.formState.errors.expectedCompletionYears}
                      helperText={propertyForm.formState.errors.expectedCompletionYears?.message}
                      fullWidth
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="פרטי הנכס"
                      {...propertyForm.register('propertyDetails')}
                      error={!!propertyForm.formState.errors.propertyDetails}
                      helperText={propertyForm.formState.errors.propertyDetails?.message}
                      fullWidth
                      multiline
                      rows={4}
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="הערות"
                      {...propertyForm.register('notes')}
                      error={!!propertyForm.formState.errors.notes}
                      helperText={propertyForm.formState.errors.notes?.message}
                      fullWidth
                      multiline
                      rows={4}
                      disabled={propertyMutation.isPending}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button 
            onClick={onClose} 
            disabled={propertyMutation.isPending}
            data-testid="property-form-cancel-button"
          >
            ביטול
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={propertyMutation.isPending}
            startIcon={propertyMutation.isPending ? <CircularProgress size={20} /> : null}
            data-testid="property-form-submit-button"
          >
            {propertyMutation.isPending ? 'שומר...' : 'שמור'}
          </Button>
        </DialogActions>
      </Box>

      {/* Investment Company Creation Dialog */}
      <Dialog
        open={createCompanyDialogOpen}
        onClose={() => setCreateCompanyDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <Box component="form" onSubmit={companyForm.handleSubmit(handleCompanySubmit)} sx={{ direction: 'rtl' }}>
          <DialogTitle>צור חברת השקעה חדשה</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="שם *"
                {...companyForm.register('name')}
                error={!!companyForm.formState.errors.name}
                helperText={companyForm.formState.errors.name?.message}
                fullWidth
                autoFocus
                disabled={createCompanyMutation.isPending}
              />
              <TextField
                label="מדינה *"
                {...companyForm.register('country')}
                error={!!companyForm.formState.errors.country}
                helperText={companyForm.formState.errors.country?.message}
                fullWidth
                disabled={createCompanyMutation.isPending}
              />
              <TextField
                label="מספר רישום"
                {...companyForm.register('registrationNumber')}
                error={!!companyForm.formState.errors.registrationNumber}
                helperText={companyForm.formState.errors.registrationNumber?.message}
                fullWidth
                disabled={createCompanyMutation.isPending}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateCompanyDialogOpen(false)} disabled={createCompanyMutation.isPending}>
              ביטול
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createCompanyMutation.isPending}
              startIcon={createCompanyMutation.isPending ? <CircularProgress size={20} /> : null}
            >
              {createCompanyMutation.isPending ? 'יוצר...' : 'צור חברת השקעה'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Snackbar for notifications */}
      {/* Success Notification - Per GENERAL_REQUIREMENTS.md Section 12.5 */}
      {/* Use disablePortal={false} to ensure snackbar renders outside Dialog tree */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        data-testid="property-form-snackbar"
        sx={{
          zIndex: 1400, // MUI Dialog z-index is 1300, so 1400 ensures snackbar is above
          '& .MuiAlert-root': {
            fontSize: '1.1rem', // Larger text
            fontWeight: 600, // Bolder
            minWidth: '400px', // Wider
            boxShadow: '0 8px 16px rgba(0,0,0,0.3)', // More prominent shadow
          }
        }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
          data-testid="property-form-alert"
          variant="filled"
        >
          <span data-testid="property-form-alert-message">
            {snackbar.message || (isEdit ? 'הנכס עודכן בהצלחה' : 'הנכס נוסף בהצלחה')}
          </span>
        </Alert>
      </Snackbar>
    </>
  );
}
