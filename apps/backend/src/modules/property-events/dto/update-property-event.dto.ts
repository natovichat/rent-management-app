import {
  IsString,
  IsOptional,
  IsDateString,
  IsUUID,
  IsEnum,
  IsInt,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ExpenseEventType,
  RentalPaymentStatus,
} from '@prisma/client';

/**
 * DTO for partial update of a property event.
 * Type-agnostic for common fields.
 * eventType is always preserved in update - never changed.
 */
export class UpdatePropertyEventDto {
  @ApiPropertyOptional({
    description: 'Event date',
    example: '2025-01-15',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'eventDate must be a valid ISO 8601 date string' },
  )
  eventDate?: string;

  @ApiPropertyOptional({
    description: 'Event description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Estimated value',
    example: 1000000,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  estimatedValue?: number;

  @ApiPropertyOptional({
    description: 'Estimated rent',
    example: 5000,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  estimatedRent?: number;

  // PlanningProcessEvent fields
  @ApiPropertyOptional({ description: 'Planning stage' })
  @IsOptional()
  @IsString()
  planningStage?: string;

  @ApiPropertyOptional({ description: 'Developer name' })
  @IsOptional()
  @IsString()
  developerName?: string;

  @ApiPropertyOptional({ description: 'Projected size after' })
  @IsOptional()
  @IsString()
  projectedSizeAfter?: string;

  // PropertyDamageEvent fields
  @ApiPropertyOptional({ description: 'Damage type' })
  @IsOptional()
  @IsString()
  damageType?: string;

  @ApiPropertyOptional({
    description: 'Estimated damage cost',
    example: 5000,
  })
  @IsOptional()
  @ValidateIf((o) => o.estimatedDamageCost != null)
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  estimatedDamageCost?: number;

  @ApiPropertyOptional({
    description: 'Optional link to ExpenseEvent (UUID). Pass null to disconnect.',
  })
  @IsOptional()
  @ValidateIf((o) => o.expenseId != null && o.expenseId !== '')
  @IsUUID('4')
  expenseId?: string | null;

  // ExpenseEvent fields
  @ApiPropertyOptional({
    description: 'Expense type',
    enum: ExpenseEventType,
  })
  @IsOptional()
  @IsEnum(ExpenseEventType)
  expenseType?: ExpenseEventType;

  @ApiPropertyOptional({
    description: 'Amount',
    example: 1500,
  })
  @IsOptional()
  @ValidateIf((o) => o.amount != null)
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount?: number;

  @ApiPropertyOptional({
    description: 'Bank account ID where payment was made. Pass null to disconnect.',
  })
  @IsOptional()
  @ValidateIf((o) => o.paidToAccountId != null && o.paidToAccountId !== '')
  @IsUUID('4')
  paidToAccountId?: string | null;

  @ApiPropertyOptional({
    description: 'Whether expense affects property value',
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  affectsPropertyValue?: boolean;

  // RentalPaymentRequestEvent fields
  @ApiPropertyOptional({
    description: 'Rental agreement UUID. Pass null to disconnect.',
  })
  @IsOptional()
  @ValidateIf((o) => o.rentalAgreementId != null && o.rentalAgreementId !== '')
  @IsUUID('4')
  rentalAgreementId?: string | null;

  @ApiPropertyOptional({
    description: 'Month (1-12)',
    minimum: 1,
    maximum: 12,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month?: number;

  @ApiPropertyOptional({
    description: 'Year',
    minimum: 1900,
    maximum: 2100,
  })
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  @Type(() => Number)
  year?: number;

  @ApiPropertyOptional({
    description: 'Amount due',
    example: 5000,
  })
  @IsOptional()
  @ValidateIf((o) => o.amountDue != null)
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amountDue?: number;

  @ApiPropertyOptional({
    description: 'Payment date',
  })
  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @ApiPropertyOptional({
    description: 'Payment status',
    enum: RentalPaymentStatus,
  })
  @IsOptional()
  @IsEnum(RentalPaymentStatus)
  paymentStatus?: RentalPaymentStatus;
}
