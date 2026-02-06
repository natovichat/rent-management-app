import { ApiProperty } from '@nestjs/swagger';
import { BankAccountType } from '@prisma/client';

export class BankAccountResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  accountId: string;

  @ApiProperty()
  bankName: string;

  @ApiProperty({ required: false })
  branchNumber?: string;

  @ApiProperty()
  accountNumber: string;

  @ApiProperty({ enum: BankAccountType })
  accountType: BankAccountType;

  @ApiProperty({ required: false })
  accountHolder?: string;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // Helper property for display
  @ApiProperty({
    description: 'תיאור מלא של החשבון לתצוגה',
    example: 'בנק הפועלים - 689/123456',
  })
  get displayName(): string {
    return this.branchNumber
      ? `${this.bankName} - ${this.branchNumber}/${this.accountNumber}`
      : `${this.bankName} - ${this.accountNumber}`;
  }
}
