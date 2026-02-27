import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  IsNumber,
  IsDateString,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
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
} from '@prisma/client';

export const PROPERTY_TYPES = Object.values(PropertyType);
export const PROPERTY_STATUSES = Object.values(PropertyStatus);
export const PARKING_TYPES = Object.values(ParkingType);
export const ACQUISITION_METHODS = Object.values(AcquisitionMethod);
export const LEGAL_STATUSES = Object.values(LegalStatus);
export const PROPERTY_CONDITIONS = Object.values(PropertyCondition);
export const LAND_TYPES = Object.values(LandType);
export const MANAGEMENT_FEE_FREQUENCIES = Object.values(ManagementFeeFrequency);
export const TAX_FREQUENCIES = Object.values(TaxFrequency);
export const ESTIMATION_SOURCES = Object.values(EstimationSource);

/**
 * DTO for creating a new Property
 */
export class CreatePropertyDto {
  @ApiProperty({
    description: 'Property address (required)',
    example: 'רחוב הרצל 15, תל אביב',
    minLength: 5,
  })
  @IsString()
  @MinLength(5, { message: 'address must be at least 5 characters' })
  @MaxLength(500)
  address: string;

  @ApiPropertyOptional({
    description: 'File number',
    example: '12345',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  fileNumber?: string;

  @ApiPropertyOptional({
    description: 'Property type',
    enum: PropertyType,
  })
  @IsOptional()
  @IsEnum(PropertyType, {
    message: `type must be one of: ${PROPERTY_TYPES.join(', ')}`,
  })
  type?: PropertyType;

  @ApiPropertyOptional({
    description: 'Property status',
    enum: PropertyStatus,
  })
  @IsOptional()
  @IsEnum(PropertyStatus, {
    message: `status must be one of: ${PROPERTY_STATUSES.join(', ')}`,
  })
  status?: PropertyStatus;

  @ApiPropertyOptional({
    description: 'Country',
    default: 'Israel',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({
    description: 'City',
    example: 'תל אביב',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({
    description: 'Total area in sqm',
    example: 120.5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalArea?: number;

  @ApiPropertyOptional({
    description: 'Land area in sqm',
    example: 200.0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  landArea?: number;

  @ApiPropertyOptional({
    description: 'Estimated value',
    example: 1500000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  estimatedValue?: number;

  @ApiPropertyOptional({
    description: 'Last valuation date',
    example: '2024-01-15',
  })
  @IsOptional()
  @IsDateString()
  lastValuationDate?: string;

  @ApiPropertyOptional({
    description: 'Gush (plot registry)',
    example: '123',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  gush?: string;

  @ApiPropertyOptional({
    description: 'Helka (parcel)',
    example: '45',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  helka?: string;

  @ApiPropertyOptional({
    description: 'Whether property is mortgaged',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isMortgaged?: boolean;

  @ApiPropertyOptional({
    description: 'Number of floors',
    example: 3,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  floors?: number;

  @ApiPropertyOptional({
    description: 'Total number of units',
    example: 4,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  totalUnits?: number;

  @ApiPropertyOptional({
    description: 'Number of parking spaces',
    example: 2,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  parkingSpaces?: number;

  @ApiPropertyOptional({
    description: 'Balcony size in sqm',
    example: 15.5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  balconySizeSqm?: number;

  @ApiPropertyOptional({
    description: 'Storage size in sqm',
    example: 8.0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  storageSizeSqm?: number;

  @ApiPropertyOptional({
    description: 'Parking type',
    enum: ParkingType,
  })
  @IsOptional()
  @IsEnum(ParkingType, {
    message: `parkingType must be one of: ${PARKING_TYPES.join(', ')}`,
  })
  parkingType?: ParkingType;

  @ApiPropertyOptional({
    description: 'Purchase price',
    example: 1200000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  purchasePrice?: number;

  @ApiPropertyOptional({
    description: 'Purchase date',
    example: '2020-06-01',
  })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({
    description: 'Acquisition method',
    enum: AcquisitionMethod,
  })
  @IsOptional()
  @IsEnum(AcquisitionMethod, {
    message: `acquisitionMethod must be one of: ${ACQUISITION_METHODS.join(', ')}`,
  })
  acquisitionMethod?: AcquisitionMethod;

  @ApiPropertyOptional({
    description: 'Estimated monthly rent',
    example: 5000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  estimatedRent?: number;

  @ApiPropertyOptional({
    description: 'Rental income',
    example: 4800,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  rentalIncome?: number;

  @ApiPropertyOptional({
    description: 'Projected value',
    example: 1600000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  projectedValue?: number;

  @ApiPropertyOptional({
    description: 'Sale projected tax',
    example: 120000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  saleProjectedTax?: number;

  @ApiPropertyOptional({
    description: 'Cadastral number',
    example: '123-456-789',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  cadastralNumber?: string;

  @ApiPropertyOptional({
    description: 'Tax ID',
    example: '123456789',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxId?: string;

  @ApiPropertyOptional({
    description: 'Registration date',
    example: '2020-07-15',
  })
  @IsOptional()
  @IsDateString()
  registrationDate?: string;

  @ApiPropertyOptional({
    description: 'Legal status',
    enum: LegalStatus,
  })
  @IsOptional()
  @IsEnum(LegalStatus, {
    message: `legalStatus must be one of: ${LEGAL_STATUSES.join(', ')}`,
  })
  legalStatus?: LegalStatus;

  @ApiPropertyOptional({
    description: 'Construction year',
    example: 1995,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1800)
  @Max(2100)
  constructionYear?: number;

  @ApiPropertyOptional({
    description: 'Last renovation year',
    example: 2020,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1800)
  @Max(2100)
  lastRenovationYear?: number;

  @ApiPropertyOptional({
    description: 'Building permit number',
    example: 'BP-2020-123',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  buildingPermitNumber?: string;

  @ApiPropertyOptional({
    description: 'Property condition',
    enum: PropertyCondition,
  })
  @IsOptional()
  @IsEnum(PropertyCondition, {
    message: `propertyCondition must be one of: ${PROPERTY_CONDITIONS.join(', ')}`,
  })
  propertyCondition?: PropertyCondition;

  @ApiPropertyOptional({
    description: 'Land type',
    enum: LandType,
  })
  @IsOptional()
  @IsEnum(LandType, {
    message: `landType must be one of: ${LAND_TYPES.join(', ')}`,
  })
  landType?: LandType;

  @ApiPropertyOptional({
    description: 'Land designation',
    example: 'Residential',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  landDesignation?: string;

  @ApiPropertyOptional({
    description: 'Partial ownership flag',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPartialOwnership?: boolean;

  @ApiPropertyOptional({
    description: 'Shared ownership percentage',
    example: 50.5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  sharedOwnershipPercentage?: number;

  @ApiPropertyOptional({
    description: 'Sold flag',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isSold?: boolean;

  @ApiPropertyOptional({
    description: 'Sale date',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  saleDate?: string;

  @ApiPropertyOptional({
    description: 'Sale price',
    example: 1400000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @ApiPropertyOptional({
    description: 'Property manager name',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  propertyManager?: string;

  @ApiPropertyOptional({
    description: 'Management company name',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  managementCompany?: string;

  @ApiPropertyOptional({
    description: 'Management fees amount',
    example: 500,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  managementFees?: number;

  @ApiPropertyOptional({
    description: 'Management fee frequency',
    enum: ManagementFeeFrequency,
  })
  @IsOptional()
  @IsEnum(ManagementFeeFrequency, {
    message: `managementFeeFrequency must be one of: ${MANAGEMENT_FEE_FREQUENCIES.join(', ')}`,
  })
  managementFeeFrequency?: ManagementFeeFrequency;

  @ApiPropertyOptional({
    description: 'Tax amount',
    example: 3000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @ApiPropertyOptional({
    description: 'Tax frequency',
    enum: TaxFrequency,
  })
  @IsOptional()
  @IsEnum(TaxFrequency, {
    message: `taxFrequency must be one of: ${TAX_FREQUENCIES.join(', ')}`,
  })
  taxFrequency?: TaxFrequency;

  @ApiPropertyOptional({
    description: 'Last tax payment date',
    example: '2024-01-15',
  })
  @IsOptional()
  @IsDateString()
  lastTaxPayment?: string;

  @ApiPropertyOptional({
    description: 'Insurance details',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  insuranceDetails?: string;

  @ApiPropertyOptional({
    description: 'Insurance expiry date',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  insuranceExpiry?: string;

  @ApiPropertyOptional({
    description: 'Zoning information',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  zoning?: string;

  @ApiPropertyOptional({
    description: 'Utilities information',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  utilities?: string;

  @ApiPropertyOptional({
    description: 'Restrictions',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  restrictions?: string;

  @ApiPropertyOptional({
    description: 'Estimation source',
    enum: EstimationSource,
  })
  @IsOptional()
  @IsEnum(EstimationSource, {
    message: `estimationSource must be one of: ${ESTIMATION_SOURCES.join(', ')}`,
  })
  estimationSource?: EstimationSource;

  @ApiPropertyOptional({
    description: 'Additional notes',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
