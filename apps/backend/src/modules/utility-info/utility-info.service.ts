import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUtilityInfoDto } from './dto/create-utility-info.dto';
import { UpdateUtilityInfoDto } from './dto/update-utility-info.dto';

/**
 * Service for managing utility info (1:1 with Property).
 * Handles CRUD operations with property existence validation
 * and enforces one UtilityInfo per property.
 */
@Injectable()
export class UtilityInfoService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create utility info for a property.
   * Validates property exists and no existing utility info (1:1 constraint).
   */
  async create(propertyId: string, dto: CreateUtilityInfoDto) {
    await this.ensurePropertyExists(propertyId);
    await this.ensureNoExistingUtilityInfo(propertyId);

    return this.prisma.utilityInfo.create({
      data: {
        propertyId,
        arnonaAccountNumber: dto.arnonaAccountNumber,
        electricityAccountNumber: dto.electricityAccountNumber,
        waterAccountNumber: dto.waterAccountNumber,
        vaadBayitName: dto.vaadBayitName,
        waterMeterNumber: dto.waterMeterNumber,
        electricityMeterNumber: dto.electricityMeterNumber,
        notes: dto.notes,
      },
    });
  }

  /**
   * Find utility info by property ID.
   */
  async findByProperty(propertyId: string) {
    const utilityInfo = await this.prisma.utilityInfo.findUnique({
      where: { propertyId },
    });

    if (!utilityInfo) {
      throw new NotFoundException(
        `Utility info for property ${propertyId} not found`,
      );
    }

    return utilityInfo;
  }

  /**
   * Update utility info for a property.
   */
  async update(propertyId: string, dto: UpdateUtilityInfoDto) {
    await this.findByProperty(propertyId);

    const data: Record<string, string | undefined> = {};
    if (dto.arnonaAccountNumber !== undefined)
      data.arnonaAccountNumber = dto.arnonaAccountNumber;
    if (dto.electricityAccountNumber !== undefined)
      data.electricityAccountNumber = dto.electricityAccountNumber;
    if (dto.waterAccountNumber !== undefined)
      data.waterAccountNumber = dto.waterAccountNumber;
    if (dto.vaadBayitName !== undefined)
      data.vaadBayitName = dto.vaadBayitName;
    if (dto.waterMeterNumber !== undefined)
      data.waterMeterNumber = dto.waterMeterNumber;
    if (dto.electricityMeterNumber !== undefined)
      data.electricityMeterNumber = dto.electricityMeterNumber;
    if (dto.notes !== undefined) data.notes = dto.notes;

    return this.prisma.utilityInfo.update({
      where: { propertyId },
      data,
    });
  }

  /**
   * Remove utility info for a property.
   */
  async remove(propertyId: string) {
    await this.findByProperty(propertyId);

    return this.prisma.utilityInfo.delete({
      where: { propertyId },
    });
  }

  private async ensurePropertyExists(propertyId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }
  }

  private async ensureNoExistingUtilityInfo(propertyId: string) {
    const existing = await this.prisma.utilityInfo.findUnique({
      where: { propertyId },
    });

    if (existing) {
      throw new ConflictException(
        `Utility info already exists for property ${propertyId}. Use PATCH to update.`,
      );
    }
  }
}
