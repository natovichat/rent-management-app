import {
  IsString,
  IsDateString,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IncomeType } from '@prisma/client';

/**
 * DTO for creating a new income.
 */
export class CreateIncomeDto {
  @ApiProperty({
    description: 'Property ID',
    example: 'uuid-of-property',
  })
  @IsString()
  propertyId: string;

  @ApiProperty({
    description: 'Income date',
    example: '2024-01-15T00:00:00Z',
  })
  @IsDateString()
  incomeDate: string;

  @ApiProperty({
    description: 'Income amount',
    example: 5000.00,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Income type',
    enum: IncomeType,
    example: IncomeType.RENT,
  })
  @IsEnum(IncomeType)
  incomeType: IncomeType;

  @ApiPropertyOptional({
    description: 'Income source',
    example: 'דייר ראשי',
  })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiPropertyOptional({
    description: 'Income description',
    example: 'Monthly rent payment',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
