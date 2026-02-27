import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BankAccountType {
  TRUST_ACCOUNT = 'TRUST_ACCOUNT',
  PERSONAL_CHECKING = 'PERSONAL_CHECKING',
  PERSONAL_SAVINGS = 'PERSONAL_SAVINGS',
  BUSINESS = 'BUSINESS',
}

export const BANK_ACCOUNT_TYPES = Object.values(BankAccountType);

/**
 * DTO for creating a bank account
 */
export class CreateBankAccountDto {
  @ApiProperty({
    description: 'Bank name',
    example: 'בנק לאומי',
  })
  @IsString()
  @MinLength(1, { message: 'bankName is required' })
  bankName: string;

  @ApiPropertyOptional({
    description: 'Branch number',
    example: '689',
  })
  @IsOptional()
  @IsString()
  branchNumber?: string;

  @ApiProperty({
    description: 'Account number',
    example: '123456',
  })
  @IsString()
  @MinLength(1, { message: 'accountNumber is required' })
  accountNumber: string;

  @ApiProperty({
    description: 'Account type',
    enum: BankAccountType,
    example: BankAccountType.PERSONAL_CHECKING,
  })
  @IsEnum(BankAccountType, {
    message: `accountType must be one of: ${BANK_ACCOUNT_TYPES.join(', ')}`,
  })
  accountType: BankAccountType;

  @ApiPropertyOptional({
    description: 'Account holder name',
    example: 'יוסי כהן',
  })
  @IsOptional()
  @IsString()
  accountHolder?: string;

  @ApiPropertyOptional({
    description: 'Notes',
    example: 'חשבון עיקרי',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Whether the account is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
