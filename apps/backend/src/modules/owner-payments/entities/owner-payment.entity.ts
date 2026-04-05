import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OwnerPaymentStatus } from '../../../firebase/types';

export class OwnerPaymentEntity {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Ownership record ID' })
  ownershipId: string;

  @ApiProperty({ description: 'Rental agreement ID' })
  rentalAgreementId: string;

  @ApiProperty({ description: 'Property ID' })
  propertyId: string;

  @ApiProperty({ description: 'Person (owner) ID' })
  personId: string;

  @ApiProperty({ description: 'Year the payment is for' })
  year: number;

  @ApiProperty({ description: 'Month (1-12) the payment is for' })
  month: number;

  @ApiProperty({ description: 'Total rent collected for this month' })
  totalRent: number;

  @ApiProperty({ description: 'Owner\'s ownership percentage (0-100)' })
  ownershipPercentage: number;

  @ApiProperty({ description: 'Amount owed to owner = totalRent * ownershipPercentage / 100' })
  amountDue: number;

  @ApiProperty({ description: 'Amount actually transferred to owner' })
  amountPaid: number;

  @ApiProperty({ enum: OwnerPaymentStatus, description: 'Payment status' })
  status: OwnerPaymentStatus;

  @ApiPropertyOptional({ description: 'Date payment was made' })
  paymentDate?: Date;

  @ApiPropertyOptional({ description: 'Notes' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Soft-delete timestamp' })
  deletedAt?: Date | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Related person (owner) data' })
  person?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Related property data' })
  property?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Related rental agreement data' })
  rentalAgreement?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Related ownership data' })
  ownership?: Record<string, unknown>;
}
