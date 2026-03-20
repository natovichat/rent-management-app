import {
  IsString,
  IsOptional,
  IsDateString,
  IsUUID,
  IsEnum,
  IsNumber,
  IsBoolean,
  Min,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ExpenseEventType } from '../../../firebase/types';

export const EXPENSE_EVENT_TYPES = Object.values(ExpenseEventType);

/**
 * DTO for creating an ExpenseEvent.
 * eventType is set by the service, not in DTO.
 */
export class CreateExpenseEventDto {
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
    description: 'Expense type',
    enum: ExpenseEventType,
  })
  @IsEnum(ExpenseEventType, {
    message: `expenseType must be one of: ${EXPENSE_EVENT_TYPES.join(', ')}`,
  })
  expenseType: ExpenseEventType;

  @ApiProperty({
    description: 'Amount (must be positive)',
    example: 1500,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01, { message: 'amount must be greater than 0' })
  @Type(() => Number)
  amount: number;

  @ApiPropertyOptional({
    description: 'Bank account ID where payment was made (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'paidToAccountId must be a valid UUID' })
  paidToAccountId?: string;

  @ApiPropertyOptional({
    description: 'Whether this expense affects property value',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  affectsPropertyValue?: boolean;

  @ApiPropertyOptional({
    description: 'Event description',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
