import { Module } from '@nestjs/common';
import { MortgagesController } from './mortgages.controller';
import { MortgagesService } from './mortgages.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MortgagesController],
  providers: [MortgagesService],
  exports: [MortgagesService],
})
export class MortgagesModule {}
