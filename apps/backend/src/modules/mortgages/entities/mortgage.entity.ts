import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MortgageStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Mortgage entity for Swagger documentation.
 * Includes relations: property, bankAccount, mortgageOwner, payer.
 */
export class MortgageEntity {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiPropertyOptional({ description: 'Property ID (null for standalone loans)' })
  propertyId?: string | null;

  @ApiProperty({ description: 'Bank name' })
  bank: string;

  @ApiProperty({ description: 'Loan amount', example: 1000000 })
  loanAmount: Decimal | number;

  @ApiPropertyOptional({ description: 'Interest rate (e.g. 3.5 for 3.5%)' })
  interestRate?: Decimal | number | null;

  @ApiPropertyOptional({ description: 'Monthly payment amount' })
  monthlyPayment?: Decimal | number | null;

  @ApiPropertyOptional({ description: 'Early repayment penalty' })
  earlyRepaymentPenalty?: Decimal | number | null;

  @ApiPropertyOptional({ description: 'Bank account ID' })
  bankAccountId?: string | null;

  @ApiPropertyOptional({ description: 'Mortgage owner person ID' })
  mortgageOwnerId?: string | null;

  @ApiProperty({ description: 'Payer person ID (required)' })
  payerId: string;

  @ApiProperty({ description: 'Start date' })
  startDate: Date;

  @ApiPropertyOptional({ description: 'End date' })
  endDate?: Date | null;

  @ApiProperty({
    description: 'Mortgage status',
    enum: MortgageStatus,
  })
  status: MortgageStatus;

  @ApiProperty({
    description: 'Linked property IDs',
    type: [String],
    example: [],
  })
  linkedProperties: string[];

  @ApiPropertyOptional({ description: 'Notes' })
  notes?: string | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Related property' })
  property?: unknown;

  @ApiPropertyOptional({ description: 'Related bank account' })
  bankAccount?: unknown;

  @ApiPropertyOptional({ description: 'Mortgage owner (Person)' })
  mortgageOwner?: unknown;

  @ApiProperty({ description: 'Payer (Person)' })
  payer?: unknown;
}
