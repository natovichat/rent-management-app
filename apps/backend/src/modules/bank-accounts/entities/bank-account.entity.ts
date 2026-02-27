import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BankAccountType } from '../dto/create-bank-account.dto';

/**
 * Bank account entity response type.
 * Matches Prisma BankAccount model structure.
 */
export class BankAccountEntity {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Bank name' })
  bankName: string;

  @ApiPropertyOptional({ description: 'Branch number' })
  branchNumber?: string | null;

  @ApiProperty({ description: 'Account number' })
  accountNumber: string;

  @ApiProperty({
    description: 'Account type',
    enum: BankAccountType,
  })
  accountType: BankAccountType;

  @ApiPropertyOptional({ description: 'Account holder name' })
  accountHolder?: string | null;

  @ApiPropertyOptional({ description: 'Notes' })
  notes?: string | null;

  @ApiProperty({ description: 'Whether the account is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
