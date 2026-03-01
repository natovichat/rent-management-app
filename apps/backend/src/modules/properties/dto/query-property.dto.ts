import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  IsBoolean,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PropertyType, PropertyStatus } from '@prisma/client';
import { PROPERTY_TYPES, PROPERTY_STATUSES } from './create-property.dto';

/**
 * DTO for querying properties with pagination, search and filters
 */
export class QueryPropertyDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Search by address, city, or country (partial match, case-insensitive)',
    example: 'תל אביב',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by property type',
    enum: PropertyType,
  })
  @IsOptional()
  @IsEnum(PropertyType, {
    message: `type must be one of: ${PROPERTY_TYPES.join(', ')}`,
  })
  type?: PropertyType;

  @ApiPropertyOptional({
    description: 'Filter by property status',
    enum: PropertyStatus,
  })
  @IsOptional()
  @IsEnum(PropertyStatus, {
    message: `status must be one of: ${PROPERTY_STATUSES.join(', ')}`,
  })
  status?: PropertyStatus;

  @ApiPropertyOptional({
    description: 'Filter by city',
    example: 'תל אביב',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({
    description: 'Filter by country',
    example: 'Israel',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ description: 'Include soft-deleted records (admin only)', default: false })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  includeDeleted?: boolean;
}
