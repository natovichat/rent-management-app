import { IsString, IsOptional, IsInt, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUnitDto {
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @IsString()
  @IsNotEmpty()
  apartmentNumber: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  floor?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  roomCount?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
