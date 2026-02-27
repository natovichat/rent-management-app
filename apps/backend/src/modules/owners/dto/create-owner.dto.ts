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
import { OwnerType } from '@prisma/client';

export const OWNER_TYPES = Object.values(OwnerType);

/**
 * DTO for creating a new Owner
 */
export class CreateOwnerDto {
  @ApiProperty({
    description: 'Owner full name',
    example: 'יוסי כהן',
    minLength: 2,
  })
  @IsString()
  @MinLength(2, { message: 'name must be at least 2 characters' })
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Owner type',
    enum: OwnerType,
    example: OwnerType.INDIVIDUAL,
  })
  @IsEnum(OwnerType, {
    message: `type must be one of: ${OWNER_TYPES.join(', ')}`,
  })
  type: OwnerType;

  @ApiPropertyOptional({
    description: 'ID number (תעודת זהות / ח.פ.)',
    example: '123456789',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  idNumber?: string;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'owner@example.com',
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
    example: 'Primary contact for property management',
  })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
