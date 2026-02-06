import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsEmail,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OwnerType } from '@prisma/client';

/**
 * DTO for creating a new owner.
 */
export class CreateOwnerDto {
  @ApiProperty({
    description: 'שם הבעלים',
    example: 'יוסי כהן',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'סוג בעלים',
    enum: OwnerType,
    example: OwnerType.INDIVIDUAL,
  })
  @IsEnum(OwnerType)
  @IsNotEmpty()
  type: OwnerType;

  @ApiPropertyOptional({
    description: 'אימייל',
    example: 'owner@example.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'טלפון',
    example: '050-1234567',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'מספר ת.ז.',
    example: '123456789',
  })
  @IsString()
  @IsOptional()
  idNumber?: string;

  @ApiPropertyOptional({
    description: 'מספר עוסק מורשה / ח.פ.',
    example: '123456789',
  })
  @IsString()
  @IsOptional()
  taxId?: string;

  @ApiPropertyOptional({
    description: 'הערות',
    example: 'בעלים ראשי',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
