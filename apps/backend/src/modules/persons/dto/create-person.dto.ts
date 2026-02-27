import {
  IsString,
  IsOptional,
  IsEmail,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a new Person
 */
export class CreatePersonDto {
  @ApiProperty({
    description: 'Person full name',
    example: 'יוסי כהן',
    minLength: 2,
  })
  @IsString()
  @MinLength(2, { message: 'name must be at least 2 characters' })
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Israeli ID number (תעודת זהות)',
    example: '123456789',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  idNumber?: string;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'yossi@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'email must be a valid email address' })
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '050-1234567',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Contact preferred in Hebrew',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
