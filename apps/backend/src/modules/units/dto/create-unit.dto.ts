import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsInt,
  IsUUID,
  Min,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsDateString,
  IsDecimal,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

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

export class CreateUnitDto {
  @ApiProperty({
    description: 'מזהה הנכס',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  propertyId: string;

  @ApiProperty({
    description: 'מספר דירה',
    example: '5',
  })
  @IsString()
  @IsNotEmpty()
  apartmentNumber: string;

  // Basic Information
  @ApiProperty({
    description: 'קומה',
    example: 2,
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  floor?: number;

  @ApiProperty({
    description: 'מספר חדרים',
    example: 3,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  roomCount?: number;

  // Detailed Information
  @ApiProperty({
    description: 'סוג יחידה',
    enum: UnitType,
    required: false,
  })
  @IsEnum(UnitType)
  @IsOptional()
  unitType?: UnitType;

  @ApiProperty({
    description: 'שטח במ"ר',
    example: 85.5,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  area?: number;

  @ApiProperty({
    description: 'מספר חדרי שינה',
    example: 3,
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  bedrooms?: number;

  @ApiProperty({
    description: 'מספר חדרי רחצה',
    example: 2.5,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  bathrooms?: number;

  @ApiProperty({
    description: 'שטח מרפסת במ"ר',
    example: 15.0,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  balconyArea?: number;

  @ApiProperty({
    description: 'שטח מחסן במ"ר',
    example: 5.0,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  storageArea?: number;

  // Amenities
  @ApiProperty({
    description: 'יש מעלית',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  hasElevator?: boolean;

  @ApiProperty({
    description: 'יש חניה',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  hasParking?: boolean;

  @ApiProperty({
    description: 'מספר מקומות חניה',
    example: 2,
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  parkingSpots?: number;

  // Status & Condition
  @ApiProperty({
    description: 'סטטוס ריהוט',
    enum: FurnishingStatus,
    required: false,
  })
  @IsEnum(FurnishingStatus)
  @IsOptional()
  furnishingStatus?: FurnishingStatus;

  @ApiProperty({
    description: 'מצב היחידה',
    enum: UnitCondition,
    required: false,
  })
  @IsEnum(UnitCondition)
  @IsOptional()
  condition?: UnitCondition;

  @ApiProperty({
    description: 'סטטוס תפוסה',
    enum: OccupancyStatus,
    required: false,
  })
  @IsEnum(OccupancyStatus)
  @IsOptional()
  occupancyStatus?: OccupancyStatus;

  @ApiProperty({
    description: 'תפוס',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isOccupied?: boolean;

  // Dates
  @ApiProperty({
    description: 'תאריך כניסה',
    example: '2026-03-01',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  entryDate?: string;

  @ApiProperty({
    description: 'תאריך שיפוץ אחרון',
    example: '2025-01-15',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  lastRenovationDate?: string;

  // Financial
  @ApiProperty({
    description: 'שכירות נוכחית',
    example: 5000.00,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  currentRent?: number;

  @ApiProperty({
    description: 'שכירות שוק',
    example: 5500.00,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  marketRent?: number;

  // Additional
  @ApiProperty({
    description: 'תשלומים כלולים',
    example: 'מים, חשמל, ארנונה',
    required: false,
  })
  @IsString()
  @IsOptional()
  utilities?: string;

  @ApiProperty({
    description: 'הערות',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
