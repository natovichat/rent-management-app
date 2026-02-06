import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsScheduler } from './notifications.scheduler';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsScheduler, PrismaService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
