import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePlotInfoDto } from './dto/create-plot-info.dto';
import { UpdatePlotInfoDto } from './dto/update-plot-info.dto';

@Injectable()
export class PlotInfoService {
  constructor(private prisma: PrismaService) {}

  async create(accountId: string, propertyId: string, createDto: CreatePlotInfoDto) {
    // Verify property exists and belongs to account
    const property = await this.prisma.property.findFirst({
      where: {
        id: propertyId,
        accountId,
      },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }

    // Check if plot info already exists for this property
    const existing = await this.prisma.plotInfo.findUnique({
      where: { propertyId },
    });

    if (existing) {
      throw new ConflictException(
        `Plot info already exists for property ${propertyId}`,
      );
    }

    // Create plot info
    const plotInfo = await this.prisma.plotInfo.create({
      data: {
        accountId,
        propertyId,
        gush: createDto.gush,
        chelka: createDto.chelka,
        subChelka: createDto.subChelka,
        registryNumber: createDto.registryNumber,
        registryOffice: createDto.registryOffice,
        notes: createDto.notes,
      },
    });

    return plotInfo;
  }

  async findOne(accountId: string, propertyId: string) {
    // Verify property exists and belongs to account
    const property = await this.prisma.property.findFirst({
      where: {
        id: propertyId,
        accountId,
      },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }

    const plotInfo = await this.prisma.plotInfo.findUnique({
      where: { propertyId },
    });

    if (!plotInfo) {
      throw new NotFoundException(
        `Plot info not found for property ${propertyId}`,
      );
    }

    // Verify plot info belongs to account
    if (plotInfo.accountId !== accountId) {
      throw new NotFoundException(
        `Plot info not found for property ${propertyId}`,
      );
    }

    return plotInfo;
  }

  async update(accountId: string, id: string, updateDto: UpdatePlotInfoDto) {
    // Find plot info
    const plotInfo = await this.prisma.plotInfo.findUnique({
      where: { id },
    });

    if (!plotInfo) {
      throw new NotFoundException(`Plot info with ID ${id} not found`);
    }

    // Verify plot info belongs to account
    if (plotInfo.accountId !== accountId) {
      throw new NotFoundException(`Plot info with ID ${id} not found`);
    }

    // Update plot info
    const updated = await this.prisma.plotInfo.update({
      where: { id },
      data: {
        gush: updateDto.gush,
        chelka: updateDto.chelka,
        subChelka: updateDto.subChelka,
        registryNumber: updateDto.registryNumber,
        registryOffice: updateDto.registryOffice,
        notes: updateDto.notes,
      },
    });

    return updated;
  }

  async remove(accountId: string, id: string) {
    // Find plot info
    const plotInfo = await this.prisma.plotInfo.findUnique({
      where: { id },
    });

    if (!plotInfo) {
      throw new NotFoundException(`Plot info with ID ${id} not found`);
    }

    // Verify plot info belongs to account
    if (plotInfo.accountId !== accountId) {
      throw new NotFoundException(`Plot info with ID ${id} not found`);
    }

    // Delete plot info
    await this.prisma.plotInfo.delete({
      where: { id },
    });

    return { message: 'Plot info deleted successfully' };
  }
}
