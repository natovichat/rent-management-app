import {
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PropertyEventType } from '@prisma/client';

export const PROPERTY_EVENT_TYPES = Object.values(PropertyEventType);

/**
 * DTO for querying property events with pagination and filters
 */
export class QueryPropertyEventDto {
  @ApiPropertyOptional({
    description: 'Filter by event type',
    enum: PropertyEventType,
  })
  @IsOptional()
  @IsEnum(PropertyEventType, {
    message: `eventType must be one of: ${PROPERTY_EVENT_TYPES.join(', ')}`,
  })
  eventType?: PropertyEventType;

  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
