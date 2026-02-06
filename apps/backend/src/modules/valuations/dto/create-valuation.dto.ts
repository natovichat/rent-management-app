import {
  IsString,
  IsDateString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ValuationType } from '@prisma/client';

/**
 * DTO for creating a new property valuation.
 */
export class CreateValuationDto {
  @ApiProperty({
    description: 'Property ID',
    example: 'uuid-of-property',
  })
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @ApiProperty({
    description: 'Valuation date',
    example: '2024-01-15',
  })
  @IsDateString()
  @IsNotEmpty()
  valuationDate: string;

  @ApiProperty({
    description: 'Estimated property value',
    example: 1500000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  estimatedValue: number;

  @ApiProperty({
    description: 'Type of valuation',
    enum: ValuationType,
    example: ValuationType.MARKET,
  })
  @IsEnum(ValuationType)
  @IsNotEmpty()
  valuationType: ValuationType;

  @ApiPropertyOptional({
    description: 'Additional notes about the valuation',
    example: 'Valuation performed by certified appraiser',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
