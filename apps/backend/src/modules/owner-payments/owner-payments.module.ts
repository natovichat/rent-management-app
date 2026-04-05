import { Module } from '@nestjs/common';
import { OwnerPaymentsController } from './owner-payments.controller';
import { OwnerPaymentsService } from './owner-payments.service';

@Module({
  imports: [],
  controllers: [OwnerPaymentsController],
  providers: [OwnerPaymentsService],
  exports: [OwnerPaymentsService],
})
export class OwnerPaymentsModule {}
