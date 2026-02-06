import {
  IsString,
  IsDateString,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExpenseType } from '@prisma/client';

/**
 * DTO for creating a new expense.
 */
export class CreateExpenseDto {
  @ApiProperty({
    description: 'Property ID',
    example: 'uuid-of-property',
  })
  @IsString()
  propertyId: string;

  @ApiProperty({
    description: 'Expense date',
    example: '2024-01-15T00:00:00Z',
  })
  @IsDateString()
  expenseDate: string;

  @ApiProperty({
    description: 'Expense amount',
    example: 1500.50,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Expense type',
    enum: ExpenseType,
    example: ExpenseType.MAINTENANCE,
  })
  @IsEnum(ExpenseType)
  expenseType: ExpenseType;

  @ApiProperty({
    description: 'Expense category',
    example: 'תחזוקה כללית',
  })
  @IsString()
  category: string;

  @ApiPropertyOptional({
    description: 'Expense description',
    example: 'Monthly maintenance fee',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Payment method',
    example: 'מזומן',
  })
  @IsString()
  @IsOptional()
  paymentMethod?: string;
}
