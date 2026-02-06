import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PropertyType, PropertyStatus } from '@prisma/client';
import { Type, Transform } from 'class-transformer';

export class FindAllPropertiesDto {
  @ApiProperty({
    description: 'חיפוש בכתובת או מספר תיק',
    example: 'תל אביב',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: 'סוג נכס',
    enum: PropertyType,
    isArray: true,
    required: false,
    example: PropertyType.RESIDENTIAL,
  })
  @IsEnum(PropertyType, { each: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value;
    }
    return value ? [value] : undefined;
  })
  type?: PropertyType | PropertyType[];

  @ApiProperty({
    description: 'סטטוס נכס',
    enum: PropertyStatus,
    isArray: true,
    required: false,
    example: PropertyStatus.OWNED,
  })
  @IsEnum(PropertyStatus, { each: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value;
    }
    return value ? [value] : undefined;
  })
  status?: PropertyStatus | PropertyStatus[];

  @ApiProperty({
    description: 'עיר',
    example: 'תל אביב',
    required: false,
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({
    description: 'מדינה',
    example: 'Israel',
    required: false,
    default: 'Israel',
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({
    description: 'האם משועבד',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  isMortgaged?: boolean;

  // Advanced filters - Value ranges
  @ApiProperty({
    description: 'ערך מינימלי משוער',
    example: 1000000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minEstimatedValue?: number;

  @ApiProperty({
    description: 'ערך מקסימלי משוער',
    example: 5000000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxEstimatedValue?: number;

  // Advanced filters - Area ranges
  @ApiProperty({
    description: 'שטח כולל מינימלי',
    example: 100,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minTotalArea?: number;

  @ApiProperty({
    description: 'שטח כולל מקסימלי',
    example: 500,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxTotalArea?: number;

  @ApiProperty({
    description: 'שטח קרקע מינימלי',
    example: 80,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minLandArea?: number;

  @ApiProperty({
    description: 'שטח קרקע מקסימלי',
    example: 400,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxLandArea?: number;

  // Advanced filters - Date ranges
  @ApiProperty({
    description: 'תאריך יצירה מ-',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  createdFrom?: string;

  @ApiProperty({
    description: 'תאריך יצירה עד',
    example: '2024-12-31T23:59:59.999Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  createdTo?: string;

  @ApiProperty({
    description: 'תאריך הערכה אחרונה מ-',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  valuationFrom?: string;

  @ApiProperty({
    description: 'תאריך הערכה אחרונה עד',
    example: '2024-12-31T23:59:59.999Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  valuationTo?: string;
}
