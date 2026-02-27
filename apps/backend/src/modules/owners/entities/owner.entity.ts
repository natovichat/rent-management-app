import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OwnerType } from '@prisma/client';

/**
 * Owner entity for Swagger documentation
 */
export class OwnerEntity {
  @ApiProperty({
    description: 'Unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Owner full name',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Owner type',
    enum: OwnerType,
    example: OwnerType.INDIVIDUAL,
  })
  type: OwnerType;

  @ApiPropertyOptional({
    description: 'ID number',
    example: '123456789',
  })
  idNumber?: string | null;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'john.doe@example.com',
  })
  email?: string | null;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '050-1234567',
  })
  phone?: string | null;

  @ApiPropertyOptional({
    description: 'Physical address',
    example: '123 Main St, Tel Aviv',
  })
  address?: string | null;

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
