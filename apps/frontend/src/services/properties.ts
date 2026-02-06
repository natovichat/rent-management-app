import { api } from '@/lib/api';

export type PropertyType = 'RESIDENTIAL' | 'COMMERCIAL' | 'LAND' | 'MIXED_USE';
export type PropertyStatus = 'OWNED' | 'IN_CONSTRUCTION' | 'IN_PURCHASE' | 'SOLD' | 'INVESTMENT';
export type AcquisitionMethod = 'PURCHASE' | 'INHERITANCE' | 'GIFT' | 'EXCHANGE' | 'OTHER';
export type LegalStatus = 'REGISTERED' | 'IN_REGISTRATION' | 'DISPUTED' | 'CLEAR';
export type PropertyCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'NEEDS_RENOVATION';
export type LandType = 'URBAN' | 'AGRICULTURAL' | 'INDUSTRIAL' | 'MIXED';
export type ManagementFeeFrequency = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
export type TaxFrequency = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
export type EstimationSource = 'PROFESSIONAL_APPRAISAL' | 'MARKET_ESTIMATE' | 'TAX_ASSESSMENT' | 'OWNER_ESTIMATE';

export interface Property {
  id: string;
  address: string;
  fileNumber?: string;
  type?: PropertyType;
  status?: PropertyStatus;
  country?: string;
  city?: string;
  totalArea?: number;
  landArea?: number;
  estimatedValue?: number;
  lastValuationDate?: string;
  gush?: string;
  helka?: string;
  isMortgaged?: boolean;
  investmentCompanyId?: string;
  // Area & Dimensions
  floors?: number;
  totalUnits?: number;
  parkingSpaces?: number;
  balconyArea?: number;
  // Financial
  acquisitionPrice?: number;
  acquisitionDate?: string;
  acquisitionMethod?: AcquisitionMethod;
  rentalIncome?: number;
  projectedValue?: number;
  // Legal & Registry
  cadastralNumber?: string;
  taxId?: string;
  registrationDate?: string;
  legalStatus?: LegalStatus;
  // Property Details
  constructionYear?: number;
  lastRenovationYear?: number;
  buildingPermitNumber?: string;
  propertyCondition?: PropertyCondition;
  floor?: number;
  storage?: boolean;
  // Land Information
  landType?: LandType;
  landDesignation?: string;
  plotSize?: number;
  buildingPotential?: string;
  // Ownership
  isPartialOwnership?: boolean;
  sharedOwnershipPercentage?: number;
  coOwners?: string;
  // Sale Information
  isSold?: boolean;
  saleDate?: string;
  salePrice?: number;
  isSoldPending?: boolean;
  // Management
  propertyManager?: string;
  managementCompany?: string;
  managementFees?: number;
  managementFeeFrequency?: ManagementFeeFrequency;
  // Financial Obligations
  taxAmount?: number;
  taxFrequency?: TaxFrequency;
  lastTaxPayment?: string;
  // Insurance
  insuranceDetails?: string;
  insuranceExpiry?: string;
  // Utilities & Infrastructure
  zoning?: string;
  utilities?: string;
  restrictions?: string;
  // Valuation
  estimationSource?: EstimationSource;
  // Additional Information
  developmentStatus?: string;
  developmentCompany?: string;
  expectedCompletionYears?: number;
  propertyDetails?: string;
  notes?: string;
  unitCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyWithDetails extends Property {
  units: Array<{
    id: string;
    apartmentNumber: string;
    floor?: number;
    roomCount?: number;
    leases: Array<{
      id: string;
      status: string;
      tenant: {
        id: string;
        name: string;
      };
    }>;
  }>;
  valuations?: Array<{
    id: string;
    value: number;
    valuationDate: string;
    source?: string;
  }>;
  mortgages?: Array<{
    id: string;
    lender: string;
    originalAmount: number;
    remainingAmount: number;
    interestRate: number;
    startDate: string;
    endDate: string;
    status: string;
  }>;
}

export interface CreatePropertyDto {
  address: string;
  fileNumber?: string;
  type?: PropertyType;
  status?: PropertyStatus;
  country?: string;
  city?: string;
  totalArea?: number;
  landArea?: number;
  estimatedValue?: number;
  lastValuationDate?: string;
  gush?: string;
  helka?: string;
  isMortgaged?: boolean;
  investmentCompanyId?: string;
  // Area & Dimensions
  floors?: number;
  totalUnits?: number;
  parkingSpaces?: number;
  balconyArea?: number;
  // Financial
  acquisitionPrice?: number;
  acquisitionDate?: string;
  acquisitionMethod?: AcquisitionMethod;
  rentalIncome?: number;
  projectedValue?: number;
  // Legal & Registry
  cadastralNumber?: string;
  taxId?: string;
  registrationDate?: string;
  legalStatus?: LegalStatus;
  // Property Details
  constructionYear?: number;
  lastRenovationYear?: number;
  buildingPermitNumber?: string;
  propertyCondition?: PropertyCondition;
  floor?: number;
  storage?: boolean;
  // Land Information
  landType?: LandType;
  landDesignation?: string;
  plotSize?: number;
  buildingPotential?: string;
  // Ownership
  isPartialOwnership?: boolean;
  sharedOwnershipPercentage?: number;
  coOwners?: string;
  // Sale Information
  isSold?: boolean;
  saleDate?: string;
  salePrice?: number;
  isSoldPending?: boolean;
  // Management
  propertyManager?: string;
  managementCompany?: string;
  managementFees?: number;
  managementFeeFrequency?: ManagementFeeFrequency;
  // Financial Obligations
  taxAmount?: number;
  taxFrequency?: TaxFrequency;
  lastTaxPayment?: string;
  // Insurance
  insuranceDetails?: string;
  insuranceExpiry?: string;
  // Utilities & Infrastructure
  zoning?: string;
  utilities?: string;
  restrictions?: string;
  // Valuation
  estimationSource?: EstimationSource;
  // Additional Information
  developmentStatus?: string;
  developmentCompany?: string;
  expectedCompletionYears?: number;
  propertyDetails?: string;
  notes?: string;
}

export interface PropertiesResponse {
  data: Property[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PropertyFilters {
  search?: string;
  // Basic filters
  type?: PropertyType | PropertyType[];
  status?: PropertyStatus | PropertyStatus[];
  city?: string;
  country?: string;
  isMortgaged?: boolean;
  // Advanced filters - Value ranges
  minEstimatedValue?: number;
  maxEstimatedValue?: number;
  // Advanced filters - Area ranges
  minTotalArea?: number;
  maxTotalArea?: number;
  minLandArea?: number;
  maxLandArea?: number;
  // Advanced filters - Date ranges
  createdFrom?: string;
  createdTo?: string;
  valuationFrom?: string;
  valuationTo?: string;
}

export const propertiesApi = {
  /**
   * Get all properties with pagination and filters.
   * 
   * Note: accountId is automatically added by the API interceptor from localStorage.
   * No need to pass it manually anymore!
   */
  getAll: async (
    page: number = 1,
    limit: number = 10,
    filters?: PropertyFilters,
  ): Promise<PropertiesResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // accountId is automatically added by API interceptor - no need to add it here!

    // Add search if provided
    if (filters?.search) {
      params.append('search', filters.search);
    }

    // Add type filter (handle array)
    // NestJS handles multiple query params with same name as arrays
    if (filters?.type) {
      const types = Array.isArray(filters.type) ? filters.type : [filters.type];
      types.forEach((type) => params.append('type', type));
    }

    // Add status filter (handle array)
    // NestJS handles multiple query params with same name as arrays
    if (filters?.status) {
      const statuses = Array.isArray(filters.status)
        ? filters.status
        : [filters.status];
      statuses.forEach((status) => params.append('status', status));
    }

    // Add city filter
    if (filters?.city) {
      params.append('city', filters.city);
    }

    // Add country filter
    if (filters?.country) {
      params.append('country', filters.country);
    }

    // Add isMortgaged filter
    if (filters?.isMortgaged !== undefined) {
      params.append('isMortgaged', filters.isMortgaged.toString());
    }

    // Add advanced filters - Value ranges
    if (filters?.minEstimatedValue !== undefined) {
      params.append('minEstimatedValue', filters.minEstimatedValue.toString());
    }
    if (filters?.maxEstimatedValue !== undefined) {
      params.append('maxEstimatedValue', filters.maxEstimatedValue.toString());
    }

    // Add advanced filters - Area ranges
    if (filters?.minTotalArea !== undefined) {
      params.append('minTotalArea', filters.minTotalArea.toString());
    }
    if (filters?.maxTotalArea !== undefined) {
      params.append('maxTotalArea', filters.maxTotalArea.toString());
    }
    if (filters?.minLandArea !== undefined) {
      params.append('minLandArea', filters.minLandArea.toString());
    }
    if (filters?.maxLandArea !== undefined) {
      params.append('maxLandArea', filters.maxLandArea.toString());
    }

    // Add advanced filters - Date ranges
    if (filters?.createdFrom) {
      params.append('createdFrom', filters.createdFrom);
    }
    if (filters?.createdTo) {
      params.append('createdTo', filters.createdTo);
    }
    if (filters?.valuationFrom) {
      params.append('valuationFrom', filters.valuationFrom);
    }
    if (filters?.valuationTo) {
      params.append('valuationTo', filters.valuationTo);
    }

    const response = await api.get(`/properties?${params}`);
    return response.data;
  },

  /**
   * Get a single property by ID.
   * 
   * Note: accountId is automatically added by the API interceptor.
   */
  getOne: async (id: string): Promise<PropertyWithDetails> => {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },

  /**
   * Create a new property.
   * 
   * Note: accountId is automatically added by the API interceptor to the request body.
   * No need to pass it manually!
   */
  create: async (data: CreatePropertyDto): Promise<Property> => {
    // accountId is automatically added by API interceptor - no need to add it here!
    const response = await api.post('/properties', data);
    return response.data;
  },

  /**
   * Update an existing property.
   * 
   * Note: accountId is automatically added by the API interceptor.
   */
  update: async (
    id: string,
    data: Partial<CreatePropertyDto>,
  ): Promise<Property> => {
    // accountId is automatically added by API interceptor - no need to add it here!
    const response = await api.patch(`/properties/${id}`, data);
    return response.data;
  },

  /**
   * Delete a property.
   * 
   * Note: accountId is automatically added by the API interceptor.
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/properties/${id}`);
  },

  /**
   * Get property statistics.
   * 
   * Note: accountId is automatically added by the API interceptor.
   */
  getStatistics: async () => {
    const response = await api.get('/properties/statistics');
    return response.data;
  },
};
