import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
  Validate,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO for creating a mortgage payment.
 */
export class CreatePaymentDto {
  @ApiProperty({
    description: 'Payment date',
    example: '2024-01-15',
  })
  @IsDateString()
  paymentDate: string;

  @ApiProperty({
    description: 'Total payment amount',
    example: 5000,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({
    description: 'Principal portion of payment',
    example: 3000,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  principal?: number;

  @ApiPropertyOptional({
    description: 'Interest portion of payment',
    example: 2000,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  interest?: number;

  @ApiPropertyOptional({
    description: 'Additional notes about the payment',
    example: 'Early payment',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
