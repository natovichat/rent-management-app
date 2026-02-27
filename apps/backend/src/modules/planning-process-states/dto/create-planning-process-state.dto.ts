import {
  IsString,
  IsOptional,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a PlanningProcessState (1:1 with Property)
 */
export class CreatePlanningProcessStateDto {
  @ApiProperty({
    description: 'State type of the planning process',
    example: 'IN_PROGRESS',
    minLength: 1,
  })
  @IsString()
  @MinLength(1, { message: 'stateType must not be empty' })
  @MaxLength(100)
  stateType: string;

  @ApiProperty({
    description: 'Last update date of the planning process',
    example: '2025-02-27T10:00:00.000Z',
  })
  @IsDateString()
  lastUpdateDate: string;

  @ApiPropertyOptional({
    description: 'Developer name',
    example: 'Acme Developers Ltd',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  developerName?: string;

  @ApiPropertyOptional({
    description: 'Projected size after planning',
    example: '150 sqm',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  projectedSizeAfter?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Awaiting municipality approval',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
