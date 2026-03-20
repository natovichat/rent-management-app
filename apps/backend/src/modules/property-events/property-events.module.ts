import { Module } from '@nestjs/common';
import { PropertyEventsController } from './property-events.controller';
import { PropertyEventsService } from './property-events.service';


@Module({
  imports: [],
  controllers: [PropertyEventsController],
  providers: [PropertyEventsService],
  exports: [PropertyEventsService],
})
export class PropertyEventsModule {}
