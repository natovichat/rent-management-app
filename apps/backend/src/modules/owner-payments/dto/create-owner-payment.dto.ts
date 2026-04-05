import {
  IsNotEmpty,
  IsUUID,
  IsInt,
  IsNumber,
  IsOptional,
  IsEnum,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OwnerPaymentStatus } from '../../../firebase/types';

export class CreateOwnerPaymentDto {
  @ApiProperty({ description: 'Ownership record ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsNotEmpty()
  @IsUUID('4')
  ownershipId: string;

  @ApiProperty({ description: 'Rental agreement ID', example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsNotEmpty()
  @IsUUID('4')
  rentalAgreementId: string;

  @ApiProperty({ description: 'Year the payment covers', example: 2026 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;

  @ApiProperty({ description: 'Month the payment covers (1-12)', example: 3 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ description: 'Total rent collected this month', example: 5000 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalRent: number;

  @ApiPropertyOptional({ description: 'Amount actually transferred to owner', example: 1500 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amountPaid?: number;

  @ApiPropertyOptional({ enum: OwnerPaymentStatus, description: 'Payment status', default: OwnerPaymentStatus.PENDING })
  @IsOptional()
  @IsEnum(OwnerPaymentStatus)
  status?: OwnerPaymentStatus;

  @ApiPropertyOptional({ description: 'Payment date (ISO string)', example: '2026-03-15' })
  @IsOptional()
  @IsString()
  paymentDate?: string;

  @ApiPropertyOptional({ description: 'Optional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
