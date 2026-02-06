import { Module } from '@nestjs/common';
import { InvestmentCompaniesService } from './investment-companies.service';
import { InvestmentCompaniesController } from './investment-companies.controller';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InvestmentCompaniesController],
  providers: [InvestmentCompaniesService],
  exports: [InvestmentCompaniesService],
})
export class InvestmentCompaniesModule {}
