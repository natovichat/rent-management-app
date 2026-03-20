import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsUUID,
  IsBoolean,
  Min,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { RentalAgreementStatus } from '../../../firebase/types';

export const RENTAL_AGREEMENT_STATUSES = Object.values(RentalAgreementStatus);

/**
 * DTO for creating a rental agreement
 */
export class CreateRentalAgreementDto {
  @ApiProperty({
    description: 'Property UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'propertyId must be a valid UUID' })
  propertyId: string;

  @ApiProperty({
    description: 'Tenant person UUID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID('4', { message: 'tenantId must be a valid UUID' })
  tenantId: string;

  @ApiProperty({
    description: 'Monthly rent amount (must be positive)',
    example: 5000,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01, { message: 'monthlyRent must be greater than 0' })
  @Type(() => Number)
  monthlyRent: number;

  @ApiProperty({
    description: 'Agreement start date',
    example: '2025-01-01',
  })
  @IsDateString({}, { message: 'startDate must be a valid ISO 8601 date string' })
  startDate: string;

  @ApiProperty({
    description: 'Agreement end date (must be after startDate)',
    example: '2026-12-31',
  })
  @IsDateString({}, { message: 'endDate must be a valid ISO 8601 date string' })
  endDate: string;

  @ApiPropertyOptional({
    description: 'Agreement status',
    enum: RentalAgreementStatus,
    default: RentalAgreementStatus.FUTURE,
  })
  @IsOptional()
  @IsEnum(RentalAgreementStatus, {
    message: `status must be one of: ${RENTAL_AGREEMENT_STATUSES.join(', ')}`,
  })
  status?: RentalAgreementStatus = RentalAgreementStatus.FUTURE;

  @ApiPropertyOptional({
    description: 'Whether agreement has extension option',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  hasExtensionOption?: boolean = false;

  @ApiPropertyOptional({
    description: 'Extension until date (when hasExtensionOption is true)',
    example: '2027-06-30',
  })
  @IsOptional()
  @IsDateString({}, { message: 'extensionUntilDate must be a valid ISO 8601 date string' })
  extensionUntilDate?: string;

  @ApiPropertyOptional({
    description: 'Monthly rent during extension period',
    example: 5500,
    minimum: 0.01,
  })
  @IsOptional()
  @ValidateIf((o) => o.extensionMonthlyRent != null)
  @IsNumber()
  @Min(0.01, { message: 'extensionMonthlyRent must be greater than 0 when provided' })
  @Type(() => Number)
  extensionMonthlyRent?: number;

  @ApiPropertyOptional({
    description: 'Notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
