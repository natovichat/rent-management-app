import { ApiProperty } from '@nestjs/swagger';

/**
 * Ownership validation result entity for Swagger documentation
 */
export class OwnershipValidationEntity {
  @ApiProperty({
    description: 'Whether total ownership percentage is valid (100%)',
    example: true,
  })
  isValid: boolean;

  @ApiProperty({
    description: 'Total ownership percentage for active ownerships',
    example: 100,
  })
  totalPercentage: number;

  @ApiProperty({
    description: 'Validation message',
    example: 'Total ownership is 100%',
  })
  message: string;
}
