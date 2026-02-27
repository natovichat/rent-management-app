import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PersonType } from '@prisma/client';

export const PERSON_TYPES = Object.values(PersonType);

/**
 * DTO for creating a new Person (individual, company, or partnership)
 */
export class CreatePersonDto {
  @ApiProperty({
    description: 'Person or company full name',
    example: 'יוסי כהן',
    minLength: 2,
  })
  @IsString()
  @MinLength(2, { message: 'name must be at least 2 characters' })
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Entity type',
    enum: PersonType,
    default: PersonType.INDIVIDUAL,
    example: PersonType.INDIVIDUAL,
  })
  @IsOptional()
  @IsEnum(PersonType, {
    message: `type must be one of: ${PERSON_TYPES.join(', ')}`,
  })
  type?: PersonType;

  @ApiPropertyOptional({
    description: 'Israeli ID number (תעודת זהות / ח.פ.)',
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
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsEmail({}, { message: 'email must be a valid email address' })
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '050-1234567',
  })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({
    description: 'Physical address',
    example: '123 Main St, Tel Aviv',
  })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Contact preferred in Hebrew',
  })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
