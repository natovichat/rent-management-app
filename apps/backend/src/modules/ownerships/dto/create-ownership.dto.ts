import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsDateString,
  IsUUID,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { OwnershipType } from '@prisma/client';

export const OWNERSHIP_TYPES = Object.values(OwnershipType);

/**
 * DTO for creating a new Ownership (M:N junction between Person and Property)
 */
export class CreateOwnershipDto {
  @ApiProperty({
    description: 'Person UUID (owner of the property)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'personId must be a valid UUID' })
  personId: string;

  @ApiProperty({
    description: 'Ownership percentage (0-100)',
    example: 50,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0, { message: 'ownershipPercentage must be at least 0' })
  @Max(100, { message: 'ownershipPercentage must not exceed 100' })
  @Type(() => Number)
  ownershipPercentage: number;

  @ApiProperty({
    description: 'Ownership type',
    enum: OwnershipType,
    example: OwnershipType.REAL,
  })
  @IsEnum(OwnershipType, {
    message: `ownershipType must be one of: ${OWNERSHIP_TYPES.join(', ')}`,
  })
  ownershipType: OwnershipType;

  @ApiProperty({
    description: 'Start date of ownership',
    example: '2025-01-01',
  })
  @IsDateString({}, { message: 'startDate must be a valid ISO 8601 date string' })
  startDate: string;

  @ApiPropertyOptional({
    description: 'End date of ownership (null = active)',
    example: '2030-12-31',
  })
  @IsOptional()
  @IsDateString({}, { message: 'endDate must be a valid ISO 8601 date string' })
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Management fee amount',
    example: 500,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'managementFee must be at least 0' })
  @Type(() => Number)
  managementFee?: number;

  @ApiPropertyOptional({
    description: 'Whether this is a family division',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  familyDivision?: boolean;

  @ApiPropertyOptional({
    description: 'Additional notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
