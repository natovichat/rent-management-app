import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a new tenant.
 */
export class CreateTenantDto {
  @ApiProperty({
    description: 'Tenant full name',
    example: 'יוסי כהן',
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({
    description: 'Tenant email address',
    example: 'yossi@example.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Tenant phone number',
    example: '050-1234567',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Additional notes about the tenant',
    example: 'דייר מצוין, משלם בזמן',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
