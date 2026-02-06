import { Module } from '@nestjs/common';
import { OwnersService } from './owners.service';
import { OwnersController } from './owners.controller';
import { OwnersCsvService } from './owners-csv.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OwnersController],
  providers: [OwnersService, OwnersCsvService],
  exports: [OwnersService, OwnersCsvService],
})
export class OwnersModule {}
