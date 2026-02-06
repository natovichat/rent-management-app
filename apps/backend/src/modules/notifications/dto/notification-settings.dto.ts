import { IsArray, IsInt, Min, Max, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NotificationSettingsDto {
  @ApiProperty({
    description: 'Array of days before expiration to send notifications',
    example: [30, 60, 90],
    type: [Number],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one day value is required' })
  @IsInt({ each: true, message: 'Each day value must be an integer' })
  @Min(1, { each: true, message: 'Each day value must be at least 1' })
  @Max(365, { each: true, message: 'Each day value must be at most 365' })
  daysBeforeExpiration: number[];
}

export class NotificationSettingsResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  accountId: string;

  @ApiProperty({ example: [30, 60, 90] })
  daysBeforeExpiration: number[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
