import { Module } from '@nestjs/common';
import { TableConfigurationsController } from './table-configurations.controller';
import { TableConfigurationsService } from './table-configurations.service';
import { PrismaModule } from '../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TableConfigurationsController],
  providers: [TableConfigurationsService],
  exports: [TableConfigurationsService],
})
export class TableConfigurationsModule {}
