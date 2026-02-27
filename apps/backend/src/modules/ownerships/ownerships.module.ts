import { Module } from '@nestjs/common';
import { OwnershipsService } from './ownerships.service';
import {
  PropertyOwnershipsController,
  OwnerOwnershipsController,
  OwnershipsController,
} from './ownerships.controller';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    PropertyOwnershipsController,
    OwnerOwnershipsController,
    OwnershipsController,
  ],
  providers: [OwnershipsService],
  exports: [OwnershipsService],
})
export class OwnershipsModule {}
