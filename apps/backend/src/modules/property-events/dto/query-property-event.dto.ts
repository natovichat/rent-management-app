import {
  IsOptional,
  IsEnum,
  IsInt,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PropertyEventType } from '../../../firebase/types';

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

  @ApiPropertyOptional({ description: 'Include soft-deleted records (admin only)', default: false })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  includeDeleted?: boolean;
}
