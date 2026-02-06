import {
  IsString,
  IsDateString,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a new lease.
 */
export class CreateLeaseDto {
  @ApiProperty({
    description: 'Unit ID',
    example: 'uuid-of-unit',
  })
  @IsString()
  unitId: string;

  @ApiProperty({
    description: 'Tenant ID',
    example: 'uuid-of-tenant',
  })
  @IsString()
  tenantId: string;

  @ApiProperty({
    description: 'Lease start date',
    example: '2024-01-01',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Lease end date',
    example: '2025-01-01',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Monthly rent amount',
    example: 5000,
  })
  @IsNumber()
  @Min(0)
  monthlyRent: number;

  @ApiProperty({
    description: 'Payment recipient information',
    example: 'Bank transfer to account 123456',
  })
  @IsString()
  paymentTo: string;

  @ApiPropertyOptional({
    description: 'Additional notes about the lease',
    example: 'Includes parking spot',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
