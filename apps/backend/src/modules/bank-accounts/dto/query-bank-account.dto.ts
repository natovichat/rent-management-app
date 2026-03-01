import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BankAccountType, BANK_ACCOUNT_TYPES } from './create-bank-account.dto';

/**
 * DTO for querying bank accounts with pagination and filters
 */
export class QueryBankAccountDto {
  @ApiPropertyOptional({
    description: 'Filter by bank name (partial match)',
    example: 'לאומי',
  })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional({
    description: 'Filter by account type',
    enum: BankAccountType,
  })
  @IsOptional()
  @IsEnum(BankAccountType, {
    message: `accountType must be one of: ${BANK_ACCOUNT_TYPES.join(', ')}`,
  })
  accountType?: BankAccountType;

  @ApiPropertyOptional({
    description: 'Filter by active status (true = active only)',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Include soft-deleted records', default: false })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  includeDeleted?: boolean;
}
