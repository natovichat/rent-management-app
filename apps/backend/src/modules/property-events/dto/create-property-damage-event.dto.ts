import {
  IsString,
  IsOptional,
  IsDateString,
  IsUUID,
  IsNumber,
  Min,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO for creating a PropertyDamageEvent.
 * eventType is set by the service, not in DTO.
 */
export class CreatePropertyDamageEventDto {
  @ApiProperty({
    description: 'Event date',
    example: '2025-01-15',
  })
  @IsDateString(
    {},
    { message: 'eventDate must be a valid ISO 8601 date string' },
  )
  eventDate: string;

  @ApiPropertyOptional({
    description: 'Type of damage',
  })
  @IsOptional()
  @IsString()
  damageType?: string;

  @ApiPropertyOptional({
    description: 'Estimated damage cost (must be positive when provided)',
    example: 5000,
    minimum: 0.01,
  })
  @IsOptional()
  @ValidateIf((o) => o.estimatedDamageCost != null)
  @IsNumber()
  @Min(0.01, {
    message: 'estimatedDamageCost must be greater than 0 when provided',
  })
  @Type(() => Number)
  estimatedDamageCost?: number;

  @ApiPropertyOptional({
    description: 'Optional link to ExpenseEvent (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'expenseId must be a valid UUID' })
  expenseId?: string;

  @ApiPropertyOptional({
    description: 'Event description',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
