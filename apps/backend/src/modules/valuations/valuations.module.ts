import { Module } from '@nestjs/common';
import { ValuationsService } from './valuations.service';
import { ValuationsController } from './valuations.controller';
import { PrismaModule } from '../../database/prisma.module';

/**
 * Valuations module.
 * 
 * Provides property valuation management functionality.
 */
@Module({
  imports: [PrismaModule],
  controllers: [ValuationsController],
  providers: [ValuationsService],
  exports: [ValuationsService],
})
export class ValuationsModule {}
