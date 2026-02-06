import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreatePlotInfoDto {
  @ApiProperty({
    description: 'גוש - Land registry block',
    example: '6393',
    required: false,
  })
  @IsOptional()
  @IsString()
  gush?: string;

  @ApiProperty({
    description: 'חלקה - Land registry parcel',
    example: '314',
    required: false,
  })
  @IsOptional()
  @IsString()
  chelka?: string;

  @ApiProperty({
    description: 'תת חלקה - Sub-parcel',
    example: '45',
    required: false,
  })
  @IsOptional()
  @IsString()
  subChelka?: string;

  @ApiProperty({
    description: 'Official registry number',
    example: 'REG-12345',
    required: false,
  })
  @IsOptional()
  @IsString()
  registryNumber?: string;

  @ApiProperty({
    description: 'Land registry office',
    example: 'תל אביב',
    required: false,
  })
  @IsOptional()
  @IsString()
  registryOffice?: string;

  @ApiProperty({
    description: 'General notes',
    example: 'Property spans multiple parcels',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
