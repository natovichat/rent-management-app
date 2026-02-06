import { ApiProperty } from '@nestjs/swagger';

export class PlotInfoResponseDto {
  @ApiProperty({ description: 'Plot info ID' })
  id: string;

  @ApiProperty({ description: 'Property ID' })
  propertyId: string;

  @ApiProperty({ description: 'Account ID' })
  accountId: string;

  @ApiProperty({ description: 'גוש - Land registry block', nullable: true })
  gush: string | null;

  @ApiProperty({ description: 'חלקה - Land registry parcel', nullable: true })
  chelka: string | null;

  @ApiProperty({ description: 'תת חלקה - Sub-parcel', nullable: true })
  subChelka: string | null;

  @ApiProperty({ description: 'Official registry number', nullable: true })
  registryNumber: string | null;

  @ApiProperty({ description: 'Land registry office', nullable: true })
  registryOffice: string | null;

  @ApiProperty({ description: 'General notes', nullable: true })
  notes: string | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
