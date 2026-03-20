import { Module } from '@nestjs/common';
import { UtilityInfoController } from './utility-info.controller';
import { UtilityInfoService } from './utility-info.service';


@Module({
  imports: [],
  controllers: [UtilityInfoController],
  providers: [UtilityInfoService],
  exports: [UtilityInfoService],
})
export class UtilityInfoModule {}
