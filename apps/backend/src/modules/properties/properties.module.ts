import { Module } from '@nestjs/common';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { PrismaModule } from '../../database/prisma.module';
import { MortgagesModule } from '../mortgages/mortgages.module';
import { RentalAgreementsModule } from '../rental-agreements/rental-agreements.module';

@Module({
  imports: [PrismaModule, MortgagesModule, RentalAgreementsModule],
  controllers: [PropertiesController],
  providers: [PropertiesService],
  exports: [PropertiesService],
})
export class PropertiesModule {}
