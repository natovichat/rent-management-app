import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * PlanningProcessState entity for Swagger documentation
 */
export class PlanningProcessStateEntity {
  @ApiProperty({
    description: 'Unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Property ID (1:1 relationship)',
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
  propertyId: string;

  @ApiProperty({
    description: 'State type of the planning process',
    example: 'IN_PROGRESS',
  })
  stateType: string;

  @ApiPropertyOptional({
    description: 'Developer name',
    example: 'Acme Developers Ltd',
  })
  developerName?: string | null;

  @ApiPropertyOptional({
    description: 'Projected size after planning',
    example: '150 sqm',
  })
  projectedSizeAfter?: string | null;

  @ApiProperty({
    description: 'Last update date of the planning process',
    example: '2025-02-27T10:00:00.000Z',
  })
  lastUpdateDate: Date;

  @ApiPropertyOptional({
    description: 'Additional notes',
  })
  notes?: string | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-02-27T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-02-27T10:00:00.000Z',
  })
  updatedAt: Date;
}
