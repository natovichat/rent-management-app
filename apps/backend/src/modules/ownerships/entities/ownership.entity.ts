import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OwnershipType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { OwnerEntity } from '../../owners/entities/owner.entity';
import { PropertyEntity } from '../../properties/entities/property.entity';

/**
 * Ownership entity for Swagger documentation (M:N junction between Owner and Property)
 */
export class OwnershipEntity {
  @ApiProperty({
    description: 'Unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Property ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  propertyId: string;

  @ApiProperty({
    description: 'Owner ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  ownerId: string;

  @ApiProperty({
    description: 'Ownership percentage (0-100)',
    example: 50,
  })
  ownershipPercentage: Decimal | number;

  @ApiProperty({
    description: 'Ownership type',
    enum: OwnershipType,
    example: OwnershipType.REAL,
  })
  ownershipType: OwnershipType;

  @ApiPropertyOptional({
    description: 'Management fee amount',
  })
  managementFee?: Decimal | number | null;

  @ApiProperty({
    description: 'Whether this is a family division',
    default: false,
  })
  familyDivision: boolean;

  @ApiProperty({
    description: 'Start date of ownership',
    example: '2025-01-01T00:00:00.000Z',
  })
  startDate: Date;

  @ApiPropertyOptional({
    description: 'End date of ownership (null = active)',
    example: '2030-12-31T00:00:00.000Z',
  })
  endDate?: Date | null;

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

  @ApiPropertyOptional({
    description: 'Owner details (included when requested)',
    type: OwnerEntity,
  })
  owner?: OwnerEntity;

  @ApiPropertyOptional({
    description: 'Property details (included when requested)',
    type: PropertyEntity,
  })
  property?: PropertyEntity;
}
