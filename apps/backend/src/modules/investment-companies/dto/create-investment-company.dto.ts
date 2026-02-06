import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsDecimal,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO for creating a new investment company.
 */
export class CreateInvestmentCompanyDto {
  @ApiProperty({
    description: 'שם חברת ההשקעה',
    example: 'חברת השקעה בע"מ',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'מספר רישום',
    example: '123456789',
  })
  @IsString()
  @IsOptional()
  registrationNumber?: string;

  @ApiPropertyOptional({
    description: 'מדינה',
    example: 'ישראל',
    default: 'Israel',
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({
    description: 'סכום השקעה',
    example: 1000000.00,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  investmentAmount?: number;

  @ApiPropertyOptional({
    description: 'אחוז בעלות',
    example: 50.00,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  ownershipPercentage?: number;

  @ApiPropertyOptional({
    description: 'הערות',
    example: 'חברת השקעה ראשית',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
