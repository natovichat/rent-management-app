import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OwnershipType } from '@prisma/client';

export class CreateOwnershipDto {
  @ApiProperty({
    description: 'מזהה נכס',
    example: 'uuid-of-property',
  })
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @ApiProperty({
    description: 'מזהה בעלים',
    example: 'uuid-of-owner',
  })
  @IsString()
  @IsNotEmpty()
  ownerId: string;

  @ApiProperty({
    description: 'אחוז בעלות (0-100)',
    example: 50.5,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  ownershipPercentage: number;

  @ApiProperty({
    description: 'סוג בעלות',
    enum: OwnershipType,
    example: OwnershipType.PARTIAL,
  })
  @IsEnum(OwnershipType)
  @IsNotEmpty()
  ownershipType: OwnershipType;

  @ApiProperty({
    description: 'תאריך התחלה',
    example: '2024-01-01T00:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: 'תאריך סיום (אופציונלי)',
    example: '2025-01-01T00:00:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({
    description: 'הערות',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
