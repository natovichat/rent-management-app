import { Module } from '@nestjs/common';
import { PlotInfoService } from './plot-info.service';
import { PlotInfoController } from './plot-info.controller';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PlotInfoController],
  providers: [PlotInfoService],
  exports: [PlotInfoService],
})
export class PlotInfoModule {}
