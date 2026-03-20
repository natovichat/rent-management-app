import { Module } from '@nestjs/common';
import { MortgagesController } from './mortgages.controller';
import { MortgagesService } from './mortgages.service';


@Module({
  imports: [],
  controllers: [MortgagesController],
  providers: [MortgagesService],
  exports: [MortgagesService],
})
export class MortgagesModule {}
