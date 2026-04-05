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
import { OwnerPaymentStatus } from '../../../firebase/types';

export class QueryOwnerPaymentDto {
  @ApiPropertyOptional({ description: 'Filter by rental agreement ID' })
  @IsOptional()
  @IsUUID('4')
  rentalAgreementId?: string;

  @ApiPropertyOptional({ description: 'Filter by person (owner) ID' })
  @IsOptional()
  @IsUUID('4')
  personId?: string;

  @ApiPropertyOptional({ description: 'Filter by property ID' })
  @IsOptional()
  @IsUUID('4')
  propertyId?: string;

  @ApiPropertyOptional({ description: 'Filter by ownership ID' })
  @IsOptional()
  @IsUUID('4')
  ownershipId?: string;

  @ApiPropertyOptional({ enum: OwnerPaymentStatus, description: 'Filter by payment status' })
  @IsOptional()
  @IsEnum(OwnerPaymentStatus)
  status?: OwnerPaymentStatus;

  @ApiPropertyOptional({ description: 'Filter by year', example: 2026 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;

  @ApiPropertyOptional({ description: 'Filter by month (1-12)', example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @ApiPropertyOptional({ description: 'Page number (1-based)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 100, minimum: 1, maximum: 500 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number = 100;

  @ApiPropertyOptional({ description: 'Include soft-deleted records', default: false })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  includeDeleted?: boolean;
}
