import { Module } from '@nestjs/common';
import { PropertyEventsController } from './property-events.controller';
import { PropertyEventsService } from './property-events.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PropertyEventsController],
  providers: [PropertyEventsService],
  exports: [PropertyEventsService],
})
export class PropertyEventsModule {}
