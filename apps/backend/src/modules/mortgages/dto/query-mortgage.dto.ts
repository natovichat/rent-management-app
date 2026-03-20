import {
  IsOptional,
  IsEnum,
  IsUUID,
  IsInt,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MortgageStatus } from '../../../firebase/types';
import { MORTGAGE_STATUSES } from './create-mortgage.dto';

/**
 * DTO for querying mortgages with pagination and filters
 */
export class QueryMortgageDto {
  @ApiPropertyOptional({
    description: 'Filter by mortgage status',
    enum: MortgageStatus,
  })
  @IsOptional()
  @IsEnum(MortgageStatus, {
    message: `status must be one of: ${MORTGAGE_STATUSES.join(', ')}`,
  })
  status?: MortgageStatus;

  @ApiPropertyOptional({
    description: 'Filter by property ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'propertyId must be a valid UUID' })
  propertyId?: string;

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
