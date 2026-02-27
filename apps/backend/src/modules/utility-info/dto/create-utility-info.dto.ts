import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating utility info for a property.
 * All fields are optional - propertyId comes from the route param.
 */
export class CreateUtilityInfoDto {
  @ApiPropertyOptional({
    description: 'Arnona (property tax) account number',
    example: '12345678',
  })
  @IsOptional()
  @IsString()
  arnonaAccountNumber?: string;

  @ApiPropertyOptional({
    description: 'Electricity account number',
    example: '987654321',
  })
  @IsOptional()
  @IsString()
  electricityAccountNumber?: string;

  @ApiPropertyOptional({
    description: 'Water account number',
    example: '55555555',
  })
  @IsOptional()
  @IsString()
  waterAccountNumber?: string;

  @ApiPropertyOptional({
    description: 'Vaad Bayit (building committee) name',
    example: 'ועד בית גן',
  })
  @IsOptional()
  @IsString()
  vaadBayitName?: string;

  @ApiPropertyOptional({
    description: 'Water meter number',
    example: 'WM-001',
  })
  @IsOptional()
  @IsString()
  waterMeterNumber?: string;

  @ApiPropertyOptional({
    description: 'Electricity meter number',
    example: 'EM-002',
  })
  @IsOptional()
  @IsString()
  electricityMeterNumber?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Meter readings taken monthly',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
