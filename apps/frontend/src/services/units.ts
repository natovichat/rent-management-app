import { api } from '@/lib/api';

export enum UnitType {
  APARTMENT = 'APARTMENT',
  STUDIO = 'STUDIO',
  PENTHOUSE = 'PENTHOUSE',
  COMMERCIAL = 'COMMERCIAL',
  STORAGE = 'STORAGE',
  PARKING = 'PARKING',
}

export enum FurnishingStatus {
  FURNISHED = 'FURNISHED',
  UNFURNISHED = 'UNFURNISHED',
  PARTIALLY_FURNISHED = 'PARTIALLY_FURNISHED',
}

export enum UnitCondition {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  NEEDS_RENOVATION = 'NEEDS_RENOVATION',
}

export enum OccupancyStatus {
  VACANT = 'VACANT',
  OCCUPIED = 'OCCUPIED',
  UNDER_RENOVATION = 'UNDER_RENOVATION',
}

export interface Unit {
  id: string;
  propertyId: string;
  apartmentNumber: string;
  floor?: number;
  roomCount?: number;
  notes?: string;
  // Detailed Information
  unitType?: UnitType;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  balconyArea?: number;
  storageArea?: number;
  // Amenities
  hasElevator?: boolean;
  hasParking?: boolean;
  parkingSpots?: number;
  // Status & Condition
  furnishingStatus?: FurnishingStatus;
  condition?: UnitCondition;
  occupancyStatus?: OccupancyStatus;
  isOccupied?: boolean;
  // Dates
  entryDate?: string;
  lastRenovationDate?: string;
  // Financial
  currentRent?: number;
  marketRent?: number;
  // Additional
  utilities?: string;
  createdAt: string;
  updatedAt: string;
  // Relations (optional, included when fetched with include)
  property?: {
    id: string;
    address: string;
    fileNumber?: string;
  };
}

export interface UnitWithDetails extends Unit {
  property: {
    id: string;
    address: string;
    fileNumber?: string;
  };
  leases: Array<{
    id: string;
    status: string;
    startDate: string;
    endDate: string;
    tenant: {
      id: string;
      name: string;
    };
  }>;
}

export interface CreateUnitDto {
  propertyId: string;
  apartmentNumber: string;
  floor?: number;
  roomCount?: number;
  notes?: string;
  // Detailed Information
  unitType?: UnitType;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  balconyArea?: number;
  storageArea?: number;
  // Amenities
  hasElevator?: boolean;
  hasParking?: boolean;
  parkingSpots?: number;
  // Status & Condition
  furnishingStatus?: FurnishingStatus;
  condition?: UnitCondition;
  occupancyStatus?: OccupancyStatus;
  isOccupied?: boolean;
  // Dates
  entryDate?: string;
  lastRenovationDate?: string;
  // Financial
  currentRent?: number;
  marketRent?: number;
  // Additional
  utilities?: string;
}

export interface UnitsResponse {
  data: Unit[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UnitFilters {
  propertyId?: string;
  unitType?: UnitType;
  floor?: number;
  roomCount?: number;
  occupancyStatus?: OccupancyStatus;
  search?: string;
}

export const unitsApi = {
  getAll: async (
    filters?: UnitFilters,
    page: number = 1,
    limit: number = 10,
  ): Promise<UnitsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.propertyId && { propertyId: filters.propertyId }),
      ...(filters?.unitType && { unitType: filters.unitType }),
      ...(filters?.floor !== undefined && { floor: filters.floor.toString() }),
      ...(filters?.roomCount !== undefined && { roomCount: filters.roomCount.toString() }),
      ...(filters?.occupancyStatus && { occupancyStatus: filters.occupancyStatus }),
      ...(filters?.search && { search: filters.search }),
    });
    const response = await api.get(`/units?${params}`);
    return response.data;
  },

  getOne: async (id: string): Promise<UnitWithDetails> => {
    const response = await api.get(`/units/${id}`);
    return response.data;
  },

  create: async (data: CreateUnitDto): Promise<Unit> => {
    const response = await api.post('/units', data);
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<CreateUnitDto>,
  ): Promise<Unit> => {
    const response = await api.patch(`/units/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/units/${id}`);
  },
};
