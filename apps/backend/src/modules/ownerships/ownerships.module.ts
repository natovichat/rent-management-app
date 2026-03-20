import { Module } from '@nestjs/common';
import { OwnershipsService } from './ownerships.service';
import {
  PropertyOwnershipsController,
  PersonOwnershipsController,
  OwnershipsController,
} from './ownerships.controller';


@Module({
  imports: [],
  controllers: [
    PropertyOwnershipsController,
    PersonOwnershipsController,
    OwnershipsController,
  ],
  providers: [OwnershipsService],
  exports: [OwnershipsService],
})
export class OwnershipsModule {}
