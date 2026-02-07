import { IsString, IsArray, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ColumnConfigDto } from './column-config.dto';

/**
 * Valid entity types for table configuration
 */
export const VALID_ENTITY_TYPES = [
  'properties',
  'tenants',
  'leases',
  'units',
  'expenses',
  'income',
  'owners',
  'ownerships',
  'bankAccounts',
  'mortgages',
] as const;

export type EntityType = typeof VALID_ENTITY_TYPES[number];

/**
 * DTO for creating or updating table configuration
 */
export class UpdateTableConfigDto {
  @ApiProperty({
    description: 'Entity type',
    enum: VALID_ENTITY_TYPES,
    example: 'properties',
  })
  @IsString()
  @IsIn(VALID_ENTITY_TYPES)
  entityType: EntityType;

  @ApiProperty({
    description: 'Column configurations',
    type: [ColumnConfigDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColumnConfigDto)
  columns: ColumnConfigDto[];
}
