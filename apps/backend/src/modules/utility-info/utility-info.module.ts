import { Module } from '@nestjs/common';
import { UtilityInfoController } from './utility-info.controller';
import { UtilityInfoService } from './utility-info.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UtilityInfoController],
  providers: [UtilityInfoService],
  exports: [UtilityInfoService],
})
export class UtilityInfoModule {}
