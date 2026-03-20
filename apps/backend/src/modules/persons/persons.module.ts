import { Module } from '@nestjs/common';
import { PersonsController } from './persons.controller';
import { PersonsService } from './persons.service';
import { RentalAgreementsModule } from '../rental-agreements/rental-agreements.module';

@Module({
  imports: [RentalAgreementsModule],
  controllers: [PersonsController],
  providers: [PersonsService],
  exports: [PersonsService],
})
export class PersonsModule {}
