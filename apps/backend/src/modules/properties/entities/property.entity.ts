import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  PropertyType,
  PropertyStatus,
  ParkingType,
  AcquisitionMethod,
  LegalStatus,
  PropertyCondition,
  LandType,
  ManagementFeeFrequency,
  TaxFrequency,
  EstimationSource,
} from '../../../firebase/types';

/**
 * Property entity for Swagger documentation
 */
export class PropertyEntity {
  @ApiProperty({
    description: 'Unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Property address',
    example: 'רחוב הרצל 15, תל אביב',
  })
  address: string;

  @ApiPropertyOptional({
    description: 'File number',
  })
  fileNumber?: string | null;

  @ApiPropertyOptional({
    description: 'Property type',
    enum: PropertyType,
  })
  type?: PropertyType | null;

  @ApiPropertyOptional({
    description: 'Property status',
    enum: PropertyStatus,
  })
  status?: PropertyStatus | null;

  @ApiPropertyOptional({
    description: 'Country',
  })
  country?: string | null;

  @ApiPropertyOptional({
    description: 'City',
  })
  city?: string | null;

  @ApiPropertyOptional({
    description: 'Total area in sqm',
  })
  totalArea?: number | null;

  @ApiPropertyOptional({
    description: 'Land area in sqm',
  })
  landArea?: number | null;

  @ApiPropertyOptional({
    description: 'Estimated value',
  })
  estimatedValue?: number | null;

  @ApiPropertyOptional({
    description: 'Last valuation date',
  })
  lastValuationDate?: Date | null;

  @ApiPropertyOptional({
    description: 'Gush (plot registry)',
  })
  gush?: string | null;

  @ApiPropertyOptional({
    description: 'Helka (parcel)',
  })
  helka?: string | null;

  @ApiPropertyOptional({
    description: 'Whether property is mortgaged',
  })
  isMortgaged?: boolean | null;

  @ApiPropertyOptional({
    description: 'Number of floors',
  })
  floors?: number | null;

  @ApiPropertyOptional({
    description: 'Apartment floor (not building floor count)',
  })
  floor?: number | null;

  @ApiPropertyOptional({
    description: 'Number of rooms',
  })
  roomCount?: number | null;

  @ApiPropertyOptional({
    description: 'Apartment number within the building',
  })
  apartmentNumber?: string | null;

  @ApiPropertyOptional({
    description: 'Total number of units',
  })
  totalUnits?: number | null;

  @ApiPropertyOptional({
    description: 'Number of parking spaces',
  })
  parkingSpaces?: number | null;

  @ApiPropertyOptional({
    description: 'Balcony size in sqm',
  })
  balconySizeSqm?: number | null;

  @ApiPropertyOptional({
    description: 'Storage size in sqm',
  })
  storageSizeSqm?: number | null;

  @ApiPropertyOptional({
    description: 'Parking type',
    enum: ParkingType,
  })
  parkingType?: ParkingType | null;

  @ApiPropertyOptional({
    description: 'Purchase price',
  })
  purchasePrice?: number | null;

  @ApiPropertyOptional({
    description: 'Purchase date',
  })
  purchaseDate?: Date | null;

  @ApiPropertyOptional({
    description: 'Acquisition method',
    enum: AcquisitionMethod,
  })
  acquisitionMethod?: AcquisitionMethod | null;

  @ApiPropertyOptional({
    description: 'Estimated monthly rent',
  })
  estimatedRent?: number | null;

  @ApiPropertyOptional({
    description: 'Rental income',
  })
  rentalIncome?: number | null;

  @ApiPropertyOptional({
    description: 'Projected value',
  })
  projectedValue?: number | null;

  @ApiPropertyOptional({
    description: 'Sale projected tax',
  })
  saleProjectedTax?: number | null;

  @ApiPropertyOptional({
    description: 'Cadastral number',
  })
  cadastralNumber?: string | null;

  @ApiPropertyOptional({
    description: 'Tax ID',
  })
  taxId?: string | null;

  @ApiPropertyOptional({
    description: 'Registration date',
  })
  registrationDate?: Date | null;

  @ApiPropertyOptional({
    description: 'Legal status',
    enum: LegalStatus,
  })
  legalStatus?: LegalStatus | null;

  @ApiPropertyOptional({
    description: 'Construction year',
  })
  constructionYear?: number | null;

  @ApiPropertyOptional({
    description: 'Last renovation year',
  })
  lastRenovationYear?: number | null;

  @ApiPropertyOptional({
    description: 'Building permit number',
  })
  buildingPermitNumber?: string | null;

  @ApiPropertyOptional({
    description: 'Property condition',
    enum: PropertyCondition,
  })
  propertyCondition?: PropertyCondition | null;

  @ApiPropertyOptional({
    description: 'Land type',
    enum: LandType,
  })
  landType?: LandType | null;

  @ApiPropertyOptional({
    description: 'Land designation',
  })
  landDesignation?: string | null;

  @ApiPropertyOptional({
    description: 'Partial ownership flag',
  })
  isPartialOwnership?: boolean | null;

  @ApiPropertyOptional({
    description: 'Shared ownership percentage',
  })
  sharedOwnershipPercentage?: number | null;

  @ApiPropertyOptional({
    description: 'Sold flag',
  })
  isSold?: boolean | null;

  @ApiPropertyOptional({
    description: 'Sale date',
  })
  saleDate?: Date | null;

  @ApiPropertyOptional({
    description: 'Sale price',
  })
  salePrice?: number | null;

  @ApiPropertyOptional({
    description: 'Property manager',
  })
  propertyManager?: string | null;

  @ApiPropertyOptional({
    description: 'Management company',
  })
  managementCompany?: string | null;

  @ApiPropertyOptional({
    description: 'Management fees',
  })
  managementFees?: number | null;

  @ApiPropertyOptional({
    description: 'Management fee frequency',
    enum: ManagementFeeFrequency,
  })
  managementFeeFrequency?: ManagementFeeFrequency | null;

  @ApiPropertyOptional({
    description: 'Tax amount',
  })
  taxAmount?: number | null;

  @ApiPropertyOptional({
    description: 'Tax frequency',
    enum: TaxFrequency,
  })
  taxFrequency?: TaxFrequency | null;

  @ApiPropertyOptional({
    description: 'Last tax payment date',
  })
  lastTaxPayment?: Date | null;

  @ApiPropertyOptional({
    description: 'Insurance details',
  })
  insuranceDetails?: string | null;

  @ApiPropertyOptional({
    description: 'Insurance expiry date',
  })
  insuranceExpiry?: Date | null;

  @ApiPropertyOptional({
    description: 'Zoning',
  })
  zoning?: string | null;

  @ApiPropertyOptional({
    description: 'Utilities',
  })
  utilities?: string | null;

  @ApiPropertyOptional({
    description: 'Restrictions',
  })
  restrictions?: string | null;

  @ApiPropertyOptional({
    description: 'Estimation source',
    enum: EstimationSource,
  })
  estimationSource?: EstimationSource | null;

  @ApiPropertyOptional({
    description: 'Notes',
  })
  notes?: string | null;

  @ApiProperty({
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}
