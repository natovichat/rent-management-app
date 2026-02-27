import {
  IsOptional,
  IsEnum,
  IsUUID,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RentalAgreementStatus } from '@prisma/client';
import { RENTAL_AGREEMENT_STATUSES } from './create-rental-agreement.dto';

/**
 * DTO for querying rental agreements with pagination and filters
 */
export class QueryRentalAgreementDto {
  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: RentalAgreementStatus,
  })
  @IsOptional()
  @IsEnum(RentalAgreementStatus, {
    message: `status must be one of: ${RENTAL_AGREEMENT_STATUSES.join(', ')}`,
  })
  status?: RentalAgreementStatus;

  @ApiPropertyOptional({
    description: 'Filter by property ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'propertyId must be a valid UUID' })
  propertyId?: string;

  @ApiPropertyOptional({
    description: 'Filter by tenant ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID('4', { message: 'tenantId must be a valid UUID' })
  tenantId?: string;

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
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
