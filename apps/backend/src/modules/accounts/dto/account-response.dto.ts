import { ApiProperty } from '@nestjs/swagger';
import { AccountStatus } from '@prisma/client';

export class AccountResponseDto {
  @ApiProperty({ description: 'Account ID', example: '00000000-0000-0000-0000-000000000001' })
  id: string;

  @ApiProperty({ description: 'Account name', example: 'חשבון ראשי' })
  name: string;

  @ApiProperty({ description: 'Account status', enum: AccountStatus, example: AccountStatus.ACTIVE })
  status: AccountStatus;

  @ApiProperty({ description: 'Creation date', example: '2026-02-04T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date', example: '2026-02-04T00:00:00Z' })
  updatedAt: Date;
}
