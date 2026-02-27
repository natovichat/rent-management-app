import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Utility info entity response type.
 * Matches Prisma UtilityInfo model structure.
 */
export class UtilityInfoEntity {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Property ID' })
  propertyId: string;

  @ApiPropertyOptional({ description: 'Arnona (property tax) account number' })
  arnonaAccountNumber?: string | null;

  @ApiPropertyOptional({ description: 'Electricity account number' })
  electricityAccountNumber?: string | null;

  @ApiPropertyOptional({ description: 'Water account number' })
  waterAccountNumber?: string | null;

  @ApiPropertyOptional({ description: 'Vaad Bayit (building committee) name' })
  vaadBayitName?: string | null;

  @ApiPropertyOptional({ description: 'Water meter number' })
  waterMeterNumber?: string | null;

  @ApiPropertyOptional({ description: 'Electricity meter number' })
  electricityMeterNumber?: string | null;

  @ApiPropertyOptional({ description: 'Additional notes' })
  notes?: string | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
