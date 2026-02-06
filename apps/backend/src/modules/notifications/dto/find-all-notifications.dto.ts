import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { NotificationStatus, NotificationType } from '@prisma/client';
import { Type } from 'class-transformer';

export class FindAllNotificationsDto {
  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @IsString()
  leaseId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  pageSize?: number = 10;
}
