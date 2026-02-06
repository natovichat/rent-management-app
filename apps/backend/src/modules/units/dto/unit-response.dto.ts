import { ApiProperty } from '@nestjs/swagger';

export class PropertyInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  address: string;

  @ApiProperty({ required: false })
  fileNumber?: string;
}

export class TenantInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

export class ActiveLeaseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty()
  monthlyRent: number;

  @ApiProperty()
  status: string;

  @ApiProperty({ type: TenantInfoDto, required: false })
  tenant?: TenantInfoDto;
}

export class UnitResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  propertyId: string;

  @ApiProperty()
  apartmentNumber: string;

  @ApiProperty({ required: false })
  floor?: number;

  @ApiProperty({ required: false })
  roomCount?: number;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: PropertyInfoDto })
  property: PropertyInfoDto;

  @ApiProperty({ type: [ActiveLeaseDto], required: false })
  leases?: ActiveLeaseDto[];

  @ApiProperty({ type: ActiveLeaseDto, required: false })
  activeLease?: ActiveLeaseDto;
}
