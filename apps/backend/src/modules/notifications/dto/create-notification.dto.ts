import { IsString, IsEnum, IsInt, IsOptional, IsDateString } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @IsString()
  leaseId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsInt()
  daysBeforeExpiration: number;
}
