import {
  IsString,
  IsDateString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  IsUUID,
  Min,
  Max,
  ValidateIf,
  Validate,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MortgageStatus } from '@prisma/client';
import { Type } from 'class-transformer';

/**
 * DTO for creating a new mortgage.
 */
export class CreateMortgageDto {
  @ApiProperty({
    description: 'Property ID',
    example: 'uuid-of-property',
  })
  @IsString()
  propertyId: string;

  @ApiProperty({
    description: 'Bank name',
    example: 'Bank Hapoalim',
  })
  @IsString()
  @IsNotEmpty({ message: 'Bank name cannot be empty' })
  bank: string;

  @ApiProperty({
    description: 'Loan amount',
    example: 1000000,
  })
  @IsNumber()
  @Min(0)
  loanAmount: number;

  @ApiPropertyOptional({
    description: 'Interest rate percentage',
    example: 3.5,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  interestRate?: number;

  @ApiPropertyOptional({
    description: 'Monthly payment amount',
    example: 5000,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  monthlyPayment?: number;

  @ApiProperty({
    description: 'Mortgage start date',
    example: '2024-01-01',
  })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({
    description: 'Mortgage end date (must be after start date)',
    example: '2054-01-01',
  })
  @IsDateString()
  @IsOptional()
  @ValidateIf((o) => o.endDate !== undefined)
  endDate?: string;

  @ApiProperty({
    description: 'Mortgage status',
    enum: MortgageStatus,
    example: MortgageStatus.ACTIVE,
  })
  @IsEnum(MortgageStatus)
  status: MortgageStatus;

  @ApiPropertyOptional({
    description: 'Bank account ID for automatic payments (חשבון בנק להוראת קבע)',
    example: 'uuid-of-bank-account',
  })
  @IsUUID()
  @IsOptional()
  bankAccountId?: string;

  @ApiPropertyOptional({
    description: 'Array of property IDs that are collateral for this mortgage',
    example: ['uuid-of-property-1', 'uuid-of-property-2'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  linkedProperties?: string[];

  @ApiPropertyOptional({
    description: 'Additional notes about the mortgage',
    example: 'Refinanced from previous mortgage',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
