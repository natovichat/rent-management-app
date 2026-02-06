import { Module } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PropertiesCsvService } from './properties-csv.service';
import { PropertiesController } from './properties.controller';
import { PrismaModule } from '../../database/prisma.module';
import { OwnershipsModule } from '../ownerships/ownerships.module';

@Module({
  imports: [PrismaModule, OwnershipsModule],
  controllers: [PropertiesController],
  providers: [PropertiesService, PropertiesCsvService],
  exports: [PropertiesService],
})
export class PropertiesModule {}
