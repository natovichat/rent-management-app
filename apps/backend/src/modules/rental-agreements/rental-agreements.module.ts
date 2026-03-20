import { Module } from '@nestjs/common';
import { RentalAgreementsController } from './rental-agreements.controller';
import { RentalAgreementsService } from './rental-agreements.service';


@Module({
  imports: [],
  controllers: [RentalAgreementsController],
  providers: [RentalAgreementsService],
  exports: [RentalAgreementsService],
})
export class RentalAgreementsModule {}
