import { Module } from '@nestjs/common';
import { OwnershipsService } from './ownerships.service';
import {
  PropertyOwnershipsController,
  PersonOwnershipsController,
  OwnershipsController,
} from './ownerships.controller';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    PropertyOwnershipsController,
    PersonOwnershipsController,
    OwnershipsController,
  ],
  providers: [OwnershipsService],
  exports: [OwnershipsService],
})
export class OwnershipsModule {}
