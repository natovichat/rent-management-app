import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PersonType } from '../../../firebase/types';

/**
 * Person entity for Swagger documentation (universal entity for individuals and companies)
 */
export class PersonEntity {
  @ApiProperty({
    description: 'Unique identifier (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Person or company full name',
    example: 'יוסי כהן',
  })
  name: string;

  @ApiProperty({
    description: 'Entity type',
    enum: PersonType,
    example: PersonType.INDIVIDUAL,
  })
  type: PersonType;

  @ApiPropertyOptional({
    description: 'Israeli ID number (תעודת זהות / ח.פ.)',
    example: '123456789',
  })
  idNumber?: string | null;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'yossi@example.com',
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
