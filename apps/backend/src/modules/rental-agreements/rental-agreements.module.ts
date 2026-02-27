import { Module } from '@nestjs/common';
import { RentalAgreementsController } from './rental-agreements.controller';
import { RentalAgreementsService } from './rental-agreements.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RentalAgreementsController],
  providers: [RentalAgreementsService],
  exports: [RentalAgreementsService],
})
export class RentalAgreementsModule {}
