import { Module } from '@nestjs/common';
import { OwnershipsService } from './ownerships.service';
import { OwnershipsController } from './ownerships.controller';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OwnershipsController],
  providers: [OwnershipsService],
  exports: [OwnershipsService],
})
export class OwnershipsModule {}
