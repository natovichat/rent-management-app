import {
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a PlanningProcessEvent.
 * eventType is set by the service, not in DTO.
 */
export class CreatePlanningProcessEventDto {
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
    description: 'Planning stage',
  })
  @IsOptional()
  @IsString()
  planningStage?: string;

  @ApiPropertyOptional({
    description: 'Developer name',
  })
  @IsOptional()
  @IsString()
  developerName?: string;

  @ApiPropertyOptional({
    description: 'Projected size after planning',
  })
  @IsOptional()
  @IsString()
  projectedSizeAfter?: string;

  @ApiPropertyOptional({
    description: 'Event description',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
