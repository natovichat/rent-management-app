import { Module } from '@nestjs/common';
import { MortgagesService } from './mortgages.service';
import { MortgagesController } from './mortgages.controller';
import { PrismaModule } from '../../database/prisma.module';

/**
 * Mortgages module.
 * 
 * Provides mortgage management functionality including:
 * - Mortgage CRUD operations
 * - Payment tracking
 * - Remaining balance calculation
 */
@Module({
  imports: [PrismaModule],
  controllers: [MortgagesController],
  providers: [MortgagesService],
  exports: [MortgagesService],
})
export class MortgagesModule {}
