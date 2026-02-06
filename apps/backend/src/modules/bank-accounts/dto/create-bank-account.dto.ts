import { ApiProperty } from '@nestjs/swagger';
import { BankAccountType } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';

export class CreateBankAccountDto {
  @ApiProperty({
    description: 'שם הבנק',
    example: 'בנק הפועלים',
  })
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty({
    description: 'מספר סניף',
    example: '689',
    required: false,
  })
  @IsString()
  @IsOptional()
  branchNumber?: string;

  @ApiProperty({
    description: 'מספר חשבון',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiProperty({
    description: 'סוג חשבון',
    enum: BankAccountType,
    example: BankAccountType.CHECKING,
    default: BankAccountType.CHECKING,
    required: false,
  })
  @IsEnum(BankAccountType)
  @IsOptional()
  accountType?: BankAccountType;

  @ApiProperty({
    description: 'שם בעל החשבון',
    example: 'יוסי כהן',
    required: false,
  })
  @IsString()
  @IsOptional()
  accountHolder?: string;

  @ApiProperty({
    description: 'הערות',
    example: 'חשבון ראשי לתשלומי משכנתא',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'האם החשבון פעיל',
    example: true,
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
