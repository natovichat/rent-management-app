import { api } from '../api';

export type PropertyType = 'RESIDENTIAL' | 'COMMERCIAL' | 'LAND' | 'MIXED_USE';
export type PropertyStatus = 'OWNED' | 'IN_CONSTRUCTION' | 'IN_PURCHASE' | 'SOLD' | 'INVESTMENT';
export type AcquisitionMethod = 'PURCHASE' | 'INHERITANCE' | 'GIFT' | 'EXCHANGE' | 'OTHER';
export type PropertyCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'NEEDS_RENOVATION';
export type LegalStatus = 'REGISTERED' | 'IN_REGISTRATION' | 'DISPUTED' | 'CLEAR';
export type LandType = 'URBAN' | 'AGRICULTURAL' | 'INDUSTRIAL' | 'MIXED';
export type ParkingType = 'REGULAR' | 'CONSECUTIVE';
export type Frequency = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
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
  floors?: number;
  totalUnits?: number;
  parkingSpaces?: number;
  balconySizeSqm?: number;
  storageSizeSqm?: number;
  parkingType?: ParkingType;
  purchasePrice?: number;
  purchaseDate?: string;
  acquisitionMethod?: AcquisitionMethod;
  estimatedRent?: number;
  rentalIncome?: number;
  projectedValue?: number;
  saleProjectedTax?: number;
  cadastralNumber?: string;
  taxId?: string;
  registrationDate?: string;
  legalStatus?: LegalStatus;
  constructionYear?: number;
  lastRenovationYear?: number;
  buildingPermitNumber?: string;
  propertyCondition?: PropertyCondition;
  landType?: LandType;
  landDesignation?: string;
  isPartialOwnership?: boolean;
  sharedOwnershipPercentage?: number;
  isSold?: boolean;
  saleDate?: string;
  salePrice?: number;
  propertyManager?: string;
  managementCompany?: string;
  managementFees?: number;
  managementFeeFrequency?: Frequency;
  taxAmount?: number;
  taxFrequency?: Frequency;
  lastTaxPayment?: string;
  insuranceDetails?: string;
  insuranceExpiry?: string;
  zoning?: string;
  utilities?: string;
  restrictions?: string;
  estimationSource?: EstimationSource;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  planningProcessState?: any;
  utilityInfo?: any;
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
  floors?: number;
  totalUnits?: number;
  parkingSpaces?: number;
  balconySizeSqm?: number;
  storageSizeSqm?: number;
  parkingType?: ParkingType;
  purchasePrice?: number;
  purchaseDate?: string;
  acquisitionMethod?: AcquisitionMethod;
  estimatedRent?: number;
  rentalIncome?: number;
  projectedValue?: number;
  saleProjectedTax?: number;
  cadastralNumber?: string;
  taxId?: string;
  registrationDate?: string;
  legalStatus?: LegalStatus;
  constructionYear?: number;
  lastRenovationYear?: number;
  buildingPermitNumber?: string;
  propertyCondition?: PropertyCondition;
  landType?: LandType;
  landDesignation?: string;
  isPartialOwnership?: boolean;
  sharedOwnershipPercentage?: number;
  isSold?: boolean;
  saleDate?: string;
  salePrice?: number;
  propertyManager?: string;
  managementCompany?: string;
  managementFees?: number;
  managementFeeFrequency?: Frequency;
  taxAmount?: number;
  taxFrequency?: Frequency;
  lastTaxPayment?: string;
  insuranceDetails?: string;
  insuranceExpiry?: string;
  zoning?: string;
  utilities?: string;
  restrictions?: string;
  estimationSource?: EstimationSource;
  notes?: string;
}

export interface UpdatePropertyDto extends Partial<CreatePropertyDto> {}

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
  type?: PropertyType;
  status?: PropertyStatus;
  city?: string;
  country?: string;
}

/**
 * Property API service.
 */
export const propertiesApi = {
  /**
   * Get all properties with pagination, search, and filters.
   */
  getProperties: async (
    page: number = 1,
    limit: number = 10,
    filters?: PropertyFilters,
  ): Promise<PropertiesResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.type) {
      params.append('type', filters.type);
    }
    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.city) {
      params.append('city', filters.city);
    }
    if (filters?.country) {
      params.append('country', filters.country);
    }

    const response = await api.get<PropertiesResponse>(`/properties?${params}`);
    return response.data;
  },

  /**
   * Get a property by ID.
   * Optionally include planningProcessState and utilityInfo.
   */
  getProperty: async (
    id: string,
    include?: ('planningProcessState' | 'utilityInfo')[],
  ): Promise<Property> => {
    const params = new URLSearchParams();
    if (include && include.length > 0) {
      params.append('include', include.join(','));
    }

    const url = `/properties/${id}${params.toString() ? `?${params}` : ''}`;
    const response = await api.get<Property>(url);
    return response.data;
  },

  /**
   * Create a new property.
   */
  createProperty: async (data: CreatePropertyDto): Promise<Property> => {
    const response = await api.post<Property>('/properties', data);
    return response.data;
  },

  /**
   * Update a property.
   */
  updateProperty: async (id: string, data: UpdatePropertyDto): Promise<Property> => {
    const response = await api.patch<Property>(`/properties/${id}`, data);
    return response.data;
  },

  /**
   * Delete a property.
   */
  deleteProperty: async (id: string): Promise<void> => {
    await api.delete(`/properties/${id}`);
  },

  /**
   * Get mortgages for a property.
   */
  getPropertyMortgages: async (id: string): Promise<any[]> => {
    const response = await api.get<any[]>(`/properties/${id}/mortgages`);
    return response.data;
  },

  /**
   * Get rental agreements for a property.
   */
  getPropertyRentalAgreements: async (id: string): Promise<any[]> => {
    const response = await api.get<any[]>(`/properties/${id}/rental-agreements`);
    return response.data;
  },
};
