import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RentalAgreementStatus } from '../../../firebase/types';


/**
 * Rental agreement entity for Swagger documentation.
 * Includes relations: property, tenant (Person).
 */
export class RentalAgreementEntity {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Property ID' })
  propertyId: string;

  @ApiProperty({ description: 'Tenant (Person) ID' })
  tenantId: string;

  @ApiProperty({ description: 'Monthly rent amount', example: 5000 })
  monthlyRent: number;

  @ApiProperty({ description: 'Start date' })
  startDate: Date;

  @ApiProperty({ description: 'End date' })
  endDate: Date;

  @ApiProperty({
    description: 'Agreement status',
    enum: RentalAgreementStatus,
  })
  status: RentalAgreementStatus;

  @ApiProperty({ description: 'Whether agreement has extension option' })
  hasExtensionOption: boolean;

  @ApiPropertyOptional({ description: 'Extension until date' })
  extensionUntilDate?: Date | null;

  @ApiPropertyOptional({ description: 'Monthly rent during extension period' })
  extensionMonthlyRent?: number | null;

  @ApiPropertyOptional({ description: 'Notes' })
  notes?: string | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Related property' })
  property?: unknown;

  @ApiPropertyOptional({ description: 'Related tenant (Person)' })
  tenant?: unknown;
}
