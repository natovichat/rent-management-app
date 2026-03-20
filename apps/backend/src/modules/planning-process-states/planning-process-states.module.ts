import { Module } from '@nestjs/common';
import { PlanningProcessStatesController } from './planning-process-states.controller';
import { PlanningProcessStatesService } from './planning-process-states.service';


@Module({
  imports: [],
  controllers: [PlanningProcessStatesController],
  providers: [PlanningProcessStatesService],
  exports: [PlanningProcessStatesService],
})
export class PlanningProcessStatesModule {}
