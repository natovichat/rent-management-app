import { IsString, IsIn, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePreferencesDto {
  @ApiPropertyOptional({
    description: 'Language preference',
    example: 'he',
    enum: ['he', 'en'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['he', 'en'])
  language?: string;

  @ApiPropertyOptional({
    description: 'Date format preference',
    example: 'DD/MM/YYYY',
    enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'])
  dateFormat?: string;

  @ApiPropertyOptional({
    description: 'Currency preference',
    example: 'ILS',
    enum: ['ILS', 'USD', 'EUR'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['ILS', 'USD', 'EUR'])
  currency?: string;

  @ApiPropertyOptional({
    description: 'Theme preference',
    example: 'light',
    enum: ['light', 'dark'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['light', 'dark'])
  theme?: string;
}
