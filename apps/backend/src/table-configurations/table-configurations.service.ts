import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateTableConfigDto, EntityType } from './dto/update-table-config.dto';
import { ColumnConfigDto } from './dto/column-config.dto';

/**
 * Service for managing table column configurations
 */
@Injectable()
export class TableConfigurationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get configuration for specific entity type
   * Returns null if no configuration exists (use defaults)
   */
  async getConfiguration(entityType: EntityType) {
    const config = await this.prisma.tableConfiguration.findUnique({
      where: { entityType },
    });

    return config;
  }

  /**
   * Get all table configurations
   */
  async getAllConfigurations() {
    return this.prisma.tableConfiguration.findMany({
      orderBy: { entityType: 'asc' },
    });
  }

  /**
   * Create or update table configuration
   */
  async upsertConfiguration(dto: UpdateTableConfigDto) {
    const { entityType, columns } = dto;

    // Validate that required columns are visible
    const requiredColumns = columns.filter((col) => col.required);
    const hiddenRequiredColumns = requiredColumns.filter((col) => !col.visible);

    if (hiddenRequiredColumns.length > 0) {
      throw new Error(
        `Cannot hide required columns: ${hiddenRequiredColumns.map((c) => c.field).join(', ')}`,
      );
    }

    // Upsert configuration
    return this.prisma.tableConfiguration.upsert({
      where: { entityType },
      create: {
        entityType,
        columns: columns as any, // Prisma Json type
      },
      update: {
        columns: columns as any,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Delete configuration for specific entity type
   * This will make the frontend fall back to default configuration
   */
  async deleteConfiguration(entityType: EntityType) {
    try {
      await this.prisma.tableConfiguration.delete({
        where: { entityType },
      });
      return { message: 'Configuration deleted successfully' };
    } catch (error) {
      throw new NotFoundException(
        `Configuration for entity type '${entityType}' not found`,
      );
    }
  }

  /**
   * Reset configuration to defaults
   * This deletes the configuration, forcing the frontend to use hardcoded defaults
   */
  async resetToDefaults(entityType: EntityType) {
    return this.deleteConfiguration(entityType);
  }
}
