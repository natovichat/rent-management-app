import {
  IsString,
  IsOptional,
  IsDateString,
  IsUUID,
  IsEnum,
  IsInt,
  IsNumber,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { RentalPaymentStatus } from '@prisma/client';

export const RENTAL_PAYMENT_STATUSES = Object.values(RentalPaymentStatus);

/**
 * DTO for creating a RentalPaymentRequestEvent.
 * eventType is set by the service, not in DTO.
 */
export class CreateRentalPaymentRequestEventDto {
  @ApiProperty({
    description: 'Event date',
    example: '2025-01-15',
  })
  @IsDateString(
    {},
    { message: 'eventDate must be a valid ISO 8601 date string' },
  )
  eventDate: string;

  @ApiProperty({
    description: 'Rental agreement UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'rentalAgreementId must be a valid UUID' })
  rentalAgreementId: string;

  @ApiProperty({
    description: 'Month (1-12)',
    example: 1,
    minimum: 1,
    maximum: 12,
  })
  @IsInt()
  @Min(1, { message: 'month must be between 1 and 12' })
  @Max(12, { message: 'month must be between 1 and 12' })
  @Type(() => Number)
  month: number;

  @ApiProperty({
    description: 'Year',
    example: 2025,
  })
  @IsInt()
  @Min(1900, { message: 'year must be a valid year' })
  @Max(2100, { message: 'year must be a valid year' })
  @Type(() => Number)
  year: number;

  @ApiProperty({
    description: 'Amount due (must be positive)',
    example: 5000,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01, { message: 'amountDue must be greater than 0' })
  @Type(() => Number)
  amountDue: number;

  @ApiPropertyOptional({
    description: 'Payment date',
    example: '2025-01-20',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'paymentDate must be a valid ISO 8601 date string' },
  )
  paymentDate?: string;

  @ApiPropertyOptional({
    description: 'Payment status',
    enum: RentalPaymentStatus,
    default: RentalPaymentStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(RentalPaymentStatus, {
    message: `paymentStatus must be one of: ${RENTAL_PAYMENT_STATUSES.join(', ')}`,
  })
  paymentStatus?: RentalPaymentStatus = RentalPaymentStatus.PENDING;

  @ApiPropertyOptional({
    description: 'Event description',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
