import { ApiProperty } from '@nestjs/swagger';

export class SessionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  device: string | null;

  @ApiProperty()
  ipAddress: string | null;

  @ApiProperty()
  lastActivity: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  isCurrent: boolean;
}
