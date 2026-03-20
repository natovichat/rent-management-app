import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsUUID,
  IsArray,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MortgageStatus } from '../../../firebase/types';

export const MORTGAGE_STATUSES = Object.values(MortgageStatus);

/**
 * DTO for creating a mortgage
 */
export class CreateMortgageDto {
  @ApiProperty({
    description: 'Bank name',
    example: 'בנק לאומי',
  })
  @IsString()
  @MinLength(1, { message: 'bank is required' })
  bank: string;

  @ApiProperty({
    description: 'Loan amount (must be positive)',
    example: 1000000,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01, { message: 'loanAmount must be greater than 0' })
  @Type(() => Number)
  loanAmount: number;

  @ApiProperty({
    description: 'Payer person UUID (required)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'payerId must be a valid UUID' })
  payerId: string;

  @ApiProperty({
    description: 'Mortgage start date',
    example: '2025-01-01',
  })
  @IsDateString({}, { message: 'startDate must be a valid ISO 8601 date string' })
  startDate: string;

  @ApiProperty({
    description: 'Mortgage status',
    enum: MortgageStatus,
    example: MortgageStatus.ACTIVE,
  })
  @IsEnum(MortgageStatus, {
    message: `status must be one of: ${MORTGAGE_STATUSES.join(', ')}`,
  })
  status: MortgageStatus;

  @ApiPropertyOptional({
    description: 'Property UUID (nullable for standalone loans)',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID('4', { message: 'propertyId must be a valid UUID' })
  propertyId?: string;

  @ApiPropertyOptional({
    description: 'Bank account UUID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsOptional()
  @IsUUID('4', { message: 'bankAccountId must be a valid UUID' })
  bankAccountId?: string;

  @ApiPropertyOptional({
    description: 'Mortgage owner person UUID',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  @IsOptional()
  @IsUUID('4', { message: 'mortgageOwnerId must be a valid UUID' })
  mortgageOwnerId?: string;

  @ApiPropertyOptional({
    description: 'Interest rate (e.g. 3.5 for 3.5%)',
    example: 3.5,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'interestRate must be at least 0' })
  @Type(() => Number)
  interestRate?: number;

  @ApiPropertyOptional({
    description: 'Monthly payment amount',
    example: 5000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'monthlyPayment must be at least 0' })
  @Type(() => Number)
  monthlyPayment?: number;

  @ApiPropertyOptional({
    description: 'Early repayment penalty amount',
    example: 10000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'earlyRepaymentPenalty must be at least 0' })
  @Type(() => Number)
  earlyRepaymentPenalty?: number;

  @ApiPropertyOptional({
    description: 'Mortgage end date',
    example: '2040-12-31',
  })
  @IsOptional()
  @IsDateString({}, { message: 'endDate must be a valid ISO 8601 date string' })
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Linked property IDs (for multi-property mortgages)',
    example: ['550e8400-e29b-41d4-a716-446655440001'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true, message: 'Each linkedProperties item must be a valid UUID' })
  linkedProperties?: string[];

  @ApiPropertyOptional({
    description: 'Notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
