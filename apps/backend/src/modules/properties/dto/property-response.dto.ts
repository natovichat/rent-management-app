import { ApiProperty } from '@nestjs/swagger';
import { PropertyType, PropertyStatus } from '@prisma/client';

export class PropertyResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  address: string;

  @ApiProperty({ required: false })
  fileNumber?: string;

  @ApiProperty({ required: false })
  gush?: string;

  @ApiProperty({ required: false })
  helka?: string;

  @ApiProperty({ required: false, default: false })
  isMortgaged?: boolean;

  @ApiProperty({
    description: 'סוג הנכס',
    enum: PropertyType,
    required: false,
  })
  type?: PropertyType;

  @ApiProperty({
    description: 'סטטוס הנכס',
    enum: PropertyStatus,
    required: false,
  })
  status?: PropertyStatus;

  @ApiProperty({ required: false })
  country?: string;

  @ApiProperty({ required: false })
  city?: string;

  @ApiProperty({ required: false })
  totalArea?: number;

  @ApiProperty({ required: false })
  landArea?: number;

  @ApiProperty({ required: false })
  estimatedValue?: number;

  @ApiProperty({ required: false })
  lastValuationDate?: Date;

  @ApiProperty({ required: false })
  investmentCompanyId?: string;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  unitCount: number;

  // Relations
  @ApiProperty({ required: false })
  plotInfo?: any;

  @ApiProperty({ required: false, type: [Object] })
  ownerships?: any[];

  @ApiProperty({ required: false, type: [Object] })
  mortgages?: any[];

  @ApiProperty({ required: false, type: [Object] })
  valuations?: any[];

  @ApiProperty({ required: false })
  investmentCompany?: any;
}
