import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { AccountStatus } from '@prisma/client';

export class CreateAccountDto {
  @ApiProperty({ 
    description: 'Account ID (optional, will generate UUID if not provided)', 
    example: 'test-account-2',
    required: false 
  })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Account name', example: 'חשבון משני' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ 
    description: 'Account status', 
    enum: AccountStatus, 
    example: AccountStatus.ACTIVE,
    required: false,
    default: AccountStatus.ACTIVE
  })
  @IsEnum(AccountStatus)
  @IsOptional()
  status?: AccountStatus;
}
