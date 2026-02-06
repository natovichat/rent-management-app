import { Module } from '@nestjs/common';
import { ImportService } from './import.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ImportService],
  exports: [ImportService],
})
export class ImportModule {}
