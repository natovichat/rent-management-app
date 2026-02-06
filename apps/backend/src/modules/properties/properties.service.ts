import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PropertyType, PropertyStatus } from '@prisma/client';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Delete all test data for a specific account
   * ⚠️ ONLY for testing - deletes all properties for the account
   * Should only be used with test accounts, never in production with real data
   * 
   * @param accountId - Account ID to delete data for (should be test account only)
   * @returns Count of deleted properties
   */
  async deleteAllForAccount(accountId: string): Promise<{ deletedCount: number }> {
    console.log('[PropertiesService] Deleting all properties for account:', accountId);
    
    // Safety check: Only allow deletion for test account
    const TEST_ACCOUNT_ID = '00000000-0000-0000-0000-000000000001';
    if (accountId !== TEST_ACCOUNT_ID) {
      throw new ForbiddenException(
        'Can only delete data for test account. This is a safety measure to prevent accidental data loss.'
      );
    }

    try {
      const result = await this.prisma.property.deleteMany({
        where: { accountId },
      });

      console.log('[PropertiesService] Deleted', result.count, 'properties for account', accountId);
      return { deletedCount: result.count };
    } catch (error) {
      console.error('[PropertiesService] Error deleting properties:', error);
      throw error;
    }
  }

  // Create
  async create(accountId: string, createDto: CreatePropertyDto) {
    console.log('[PropertiesService] ===== ENTERED CREATE METHOD =====');
    console.log('[PropertiesService] accountId type:', typeof accountId, 'value:', accountId);
    console.log('[PropertiesService] createDto type:', typeof createDto, 'keys:', createDto ? Object.keys(createDto) : 'null/undefined');
    try {
      console.log('[PropertiesService] Creating property with data:', JSON.stringify(createDto, null, 2));
      console.log('[PropertiesService] Account ID:', accountId);
      console.log('[PropertiesService] DTO field types:', Object.keys(createDto).map(k => `${k}:${typeof (createDto as any)[k]}`).join(', '));

      // Business rule validations
      this.validateBusinessRules(createDto);

      // Prepare data for Prisma - convert date strings to Date objects and clean up data
      // Extract date fields first to avoid passing strings to Prisma
      const {
        lastValuationDate,
        acquisitionDate,
        registrationDate,
        saleDate,
        lastTaxPayment,
        insuranceExpiry,
        ...restDto
      } = createDto;

      // Clean up restDto - remove empty strings, null values, and undefined
      const cleanedDto: any = {};
      for (const [key, value] of Object.entries(restDto)) {
        // Skip empty strings, null, and undefined for optional fields
        if (value === '' || value === null || value === undefined) {
          continue;
        }
        // Special handling for investmentCompanyId - must be valid UUID or not included
        if (key === 'investmentCompanyId' && (value === '' || !value)) {
          continue;
        }
        cleanedDto[key] = value;
      }

      const prismaData: any = {
        accountId,
        ...cleanedDto,
        // Convert date strings to Date objects
        ...(lastValuationDate && lastValuationDate !== '' && { lastValuationDate: new Date(lastValuationDate) }),
        ...(acquisitionDate && acquisitionDate !== '' && { acquisitionDate: new Date(acquisitionDate) }),
        ...(registrationDate && registrationDate !== '' && { registrationDate: new Date(registrationDate) }),
        ...(saleDate && saleDate !== '' && { saleDate: new Date(saleDate) }),
        ...(lastTaxPayment && lastTaxPayment !== '' && { lastTaxPayment: new Date(lastTaxPayment) }),
        ...(insuranceExpiry && insuranceExpiry !== '' && { insuranceExpiry: new Date(insuranceExpiry) }),
      };

      console.log('[PropertiesService] Prepared Prisma data (keys):', Object.keys(prismaData));
      console.log('[PropertiesService] Prisma data sample:', { 
        address: prismaData.address,
        type: prismaData.type,
        totalArea: prismaData.totalArea,
        floors: prismaData.floors
      });

      const property = await this.prisma.property.create({
        data: prismaData,
        include: {
          _count: {
            select: { units: true },
          },
        },
      });

      console.log('[PropertiesService] Property created successfully:', property.id);
      return {
        ...property,
        unitCount: property._count.units,
      };
    } catch (error) {
      console.error('[PropertiesService] ========== ERROR CREATING PROPERTY ==========');
      console.error('[PropertiesService] Error:', error);
      console.error('[PropertiesService] Error type:', typeof error);
      console.error('[PropertiesService] Error constructor:', error?.constructor?.name);
      console.error('[PropertiesService] Error name:', error?.name);
      console.error('[PropertiesService] Error message:', error?.message);
      console.error('[PropertiesService] Error stack:', error?.stack);
      if (error?.code) {
        console.error('[PropertiesService] Error code:', error.code);
      }
      if (error?.meta) {
        console.error('[PropertiesService] Error meta:', JSON.stringify(error.meta, null, 2));
      }
      if (error?.cause) {
        console.error('[PropertiesService] Error cause:', error.cause);
      }
      console.error('[PropertiesService] Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      console.error('[PropertiesService] ============================================');
      
      throw error; // Re-throw to see full error details
    }
  }

  // Business Rule Validations
  private validateBusinessRules(dto: CreatePropertyDto | UpdatePropertyDto) {
    // Rule 1: acquisitionDate <= saleDate (if both provided)
    if (dto.acquisitionDate && dto.saleDate) {
      const acquisitionDate = new Date(dto.acquisitionDate);
      const saleDate = new Date(dto.saleDate);
      if (acquisitionDate > saleDate) {
        throw new BadRequestException(
          'תאריך רכישה חייב להיות לפני או שווה לתאריך מכירה',
        );
      }
    }

    // Rule 2: landArea <= totalArea (if both provided)
    if (dto.landArea !== undefined && dto.totalArea !== undefined) {
      if (dto.landArea > dto.totalArea) {
        throw new BadRequestException(
          'שטח קרקע לא יכול להיות גדול משטח כולל',
        );
      }
    }

    // Rule 3: ownershipPercentage 0-100 (if provided)
    if (dto.sharedOwnershipPercentage !== undefined) {
      if (
        dto.sharedOwnershipPercentage < 0 ||
        dto.sharedOwnershipPercentage > 100
      ) {
        throw new BadRequestException(
          'אחוז בעלות משותפת חייב להיות בין 0 ל-100',
        );
      }
    }

    // Rule 4: If isSold is true, saleDate should be provided
    if (dto.isSold === true && !dto.saleDate) {
      throw new BadRequestException(
        'נכס שנמכר חייב לכלול תאריך מכירה',
      );
    }

    // Rule 5: If isPartialOwnership is true, sharedOwnershipPercentage should be provided
    if (dto.isPartialOwnership === true && dto.sharedOwnershipPercentage === undefined) {
      throw new BadRequestException(
        'נכס בבעלות חלקית חייב לכלול אחוז בעלות משותפת',
      );
    }
  }

  // Find All (with pagination)
  async findAll(
    accountId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    type?: PropertyType | PropertyType[],
    status?: PropertyStatus | PropertyStatus[],
    city?: string,
    country?: string,
    isMortgaged?: boolean,
    minEstimatedValue?: number,
    maxEstimatedValue?: number,
    minTotalArea?: number,
    maxTotalArea?: number,
    minLandArea?: number,
    maxLandArea?: number,
    createdFrom?: string,
    createdTo?: string,
    valuationFrom?: string,
    valuationTo?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      accountId,
      ...(search && {
        OR: [
          { address: { contains: search, mode: 'insensitive' as const } },
          { fileNumber: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(type && {
        type: Array.isArray(type) ? { in: type } : type,
      }),
      ...(status && {
        status: Array.isArray(status) ? { in: status } : status,
      }),
      ...(city && {
        city: { contains: city, mode: 'insensitive' as const },
      }),
      ...(country && { country }),
      ...(isMortgaged !== undefined && { isMortgaged }),
    };

    // Advanced filters - Value ranges
    if (minEstimatedValue !== undefined || maxEstimatedValue !== undefined) {
      where.estimatedValue = {};
      if (minEstimatedValue !== undefined) {
        where.estimatedValue.gte = minEstimatedValue;
      }
      if (maxEstimatedValue !== undefined) {
        where.estimatedValue.lte = maxEstimatedValue;
      }
    }

    // Advanced filters - Area ranges
    if (minTotalArea !== undefined || maxTotalArea !== undefined) {
      where.totalArea = {};
      if (minTotalArea !== undefined) {
        where.totalArea.gte = minTotalArea;
      }
      if (maxTotalArea !== undefined) {
        where.totalArea.lte = maxTotalArea;
      }
    }

    if (minLandArea !== undefined || maxLandArea !== undefined) {
      where.landArea = {};
      if (minLandArea !== undefined) {
        where.landArea.gte = minLandArea;
      }
      if (maxLandArea !== undefined) {
        where.landArea.lte = maxLandArea;
      }
    }

    // Advanced filters - Date ranges
    if (createdFrom || createdTo) {
      where.createdAt = {};
      if (createdFrom) {
        where.createdAt.gte = new Date(createdFrom);
      }
      if (createdTo) {
        where.createdAt.lte = new Date(createdTo);
      }
    }

    if (valuationFrom || valuationTo) {
      where.lastValuationDate = {};
      if (valuationFrom) {
        where.lastValuationDate.gte = new Date(valuationFrom);
      }
      if (valuationTo) {
        where.lastValuationDate.lte = new Date(valuationTo);
      }
    }

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip,
        take: limit,
        include: {
          investmentCompany: true,
          _count: {
            select: { units: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      data: properties.map((p) => ({
        ...p,
        unitCount: p._count.units,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Find One
  async findOne(id: string, accountId: string) {
    const property = await this.prisma.property.findFirst({
      where: { id, accountId },
      include: {
        units: {
          include: {
            leases: {
              where: { status: 'ACTIVE' },
              include: { tenant: true },
            },
          },
        },
        plotInfo: true,
        ownerships: {
          include: {
            owner: true,
          },
        },
        mortgages: true,
        valuations: {
          orderBy: {
            valuationDate: 'desc',
          },
        },
        investmentCompany: true,
        _count: {
          select: { units: true },
        },
      },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    return {
      ...property,
      unitCount: property._count.units,
    };
  }

  // Update
  async update(id: string, accountId: string, updateDto: UpdatePropertyDto) {
    // Verify ownership
    await this.verifyOwnership(id, accountId);

    // Business rule validations
    this.validateBusinessRules(updateDto);

    // Get existing property to validate against current values
    const existingProperty = await this.prisma.property.findFirst({
      where: { id, accountId },
    });

    if (!existingProperty) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    // Validate combined rules (existing + new values)
    if (updateDto.acquisitionDate !== undefined || updateDto.saleDate !== undefined) {
      const acquisitionDate = updateDto.acquisitionDate
        ? new Date(updateDto.acquisitionDate)
        : existingProperty.acquisitionDate
          ? new Date(existingProperty.acquisitionDate)
          : null;
      const saleDate = updateDto.saleDate
        ? new Date(updateDto.saleDate)
        : existingProperty.saleDate
          ? new Date(existingProperty.saleDate)
          : null;

      if (acquisitionDate && saleDate && acquisitionDate > saleDate) {
        throw new BadRequestException(
          'תאריך רכישה חייב להיות לפני או שווה לתאריך מכירה',
        );
      }
    }

    if (updateDto.landArea !== undefined || updateDto.totalArea !== undefined) {
      const landArea = updateDto.landArea ?? existingProperty.landArea
        ? Number(updateDto.landArea ?? existingProperty.landArea)
        : null;
      const totalArea = updateDto.totalArea ?? existingProperty.totalArea
        ? Number(updateDto.totalArea ?? existingProperty.totalArea)
        : null;

      if (landArea !== null && totalArea !== null && landArea > totalArea) {
        throw new BadRequestException(
          'שטח קרקע לא יכול להיות גדול משטח כולל',
        );
      }
    }

    const property = await this.prisma.property.update({
      where: { id },
      data: updateDto,
      include: {
        _count: {
          select: { units: true },
        },
      },
    });

    return {
      ...property,
      unitCount: property._count.units,
    };
  }

  // Delete
  async remove(id: string, accountId: string) {
    // Verify ownership
    await this.verifyOwnership(id, accountId);

    // Check if property has units
    const unitCount = await this.prisma.unit.count({
      where: { propertyId: id },
    });

    if (unitCount > 0) {
      throw new ForbiddenException(
        'Cannot delete property with existing units. Delete units first.',
      );
    }

    await this.prisma.property.delete({
      where: { id },
    });

    return { message: 'Property deleted successfully' };
  }

  // Helper: Verify Ownership
  private async verifyOwnership(id: string, accountId: string) {
    const property = await this.prisma.property.findFirst({
      where: { id, accountId },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    return property;
  }

  // Additional: Get Statistics
  async getStatistics(accountId: string) {
    const [totalProperties, totalUnits, activeLeases] = await Promise.all([
      this.prisma.property.count({ where: { accountId } }),
      this.prisma.unit.count({
        where: { accountId },
      }),
      this.prisma.lease.count({
        where: {
          accountId,
          status: 'ACTIVE',
        },
      }),
    ]);

    return {
      totalProperties,
      totalUnits,
      activeLeases,
      occupancyRate:
        totalUnits > 0 ? ((activeLeases / totalUnits) * 100).toFixed(2) : 0,
    };
  }

  // Portfolio Summary
  async getPortfolioSummary(accountId: string) {
    const properties = await this.prisma.property.findMany({
      where: { accountId },
      include: {
        units: {
          include: {
            leases: {
              where: { status: 'ACTIVE' },
            },
          },
        },
        mortgages: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            payments: {
              where: {
                principal: { not: null },
              },
              select: {
                principal: true,
              },
            },
          },
        },
        valuations: {
          orderBy: {
            valuationDate: 'desc',
          },
          take: 1,
        },
      },
    });

    // Calculate aggregate statistics
    const totalProperties = properties.length;
    const totalUnits = properties.reduce(
      (sum, p) => sum + p.units.length,
      0,
    );
    const activeLeases = properties.reduce(
      (sum, p) =>
        sum + p.units.reduce((unitSum, u) => unitSum + u.leases.length, 0),
      0,
    );

    // Calculate total estimated value
    const totalEstimatedValue = properties.reduce((sum, p) => {
      const value = p.estimatedValue
        ? Number(p.estimatedValue)
        : p.valuations.length > 0
          ? Number(p.valuations[0].estimatedValue)
          : 0;
      return sum + value;
    }, 0);

    // Calculate total mortgage debt (remaining balance)
    const totalMortgageDebt = properties.reduce((sum: number, p: any) => {
      return (
        sum +
        p.mortgages.reduce((mortgageSum: number, m: any) => {
          // Calculate remaining balance: loanAmount - sum of principal payments
          const totalPrincipalPaid = m.payments.reduce((paymentSum: number, payment: any) => {
            return paymentSum + Number(payment.principal || 0);
          }, 0);
          const remainingBalance = Number(m.loanAmount) - totalPrincipalPaid;
          return mortgageSum + Math.max(0, remainingBalance);
        }, 0)
      );
    }, 0);

    // Group by property type
    const propertiesByType = properties.reduce((acc: Record<string, number>, p: any) => {
      const type = p.type || 'UNKNOWN';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by status
    const propertiesByStatus = properties.reduce((acc: Record<string, number>, p: any) => {
      const status = p.status || 'UNKNOWN';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate total area
    const totalArea = properties.reduce((sum: number, p: any) => {
      return sum + (p.totalArea ? Number(p.totalArea) : 0);
    }, 0);

    const landArea = properties.reduce((sum: number, p: any) => {
      return sum + (p.landArea ? Number(p.landArea) : 0);
    }, 0);

    return {
      totalProperties,
      totalUnits,
      activeLeases,
      occupancyRate:
        totalUnits > 0
          ? Number(((activeLeases / totalUnits) * 100).toFixed(2))
          : 0,
      totalEstimatedValue: Number(totalEstimatedValue.toFixed(2)),
      totalMortgageDebt: Number(totalMortgageDebt.toFixed(2)),
      netEquity: Number((totalEstimatedValue - totalMortgageDebt).toFixed(2)),
      totalArea: Number(totalArea.toFixed(2)),
      landArea: Number(landArea.toFixed(2)),
      propertiesByType,
      propertiesByStatus,
    };
  }

  async getPortfolioDistribution(accountId: string) {
    const properties = await this.prisma.property.findMany({
      where: { accountId },
      select: {
        type: true,
        status: true,
      },
    });

    const distributionByType = properties.reduce((acc: Record<string, number>, p: any) => {
      const type = p.type || 'UNKNOWN';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const distributionByStatus = properties.reduce((acc: Record<string, number>, p: any) => {
      const status = p.status || 'UNKNOWN';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      distributionByType,
      distributionByStatus,
    };
  }

  async getValuationHistory(
    accountId: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const where: any = {
      accountId,
    };

    if (startDate || endDate) {
      where.valuationDate = {};
      if (startDate) {
        where.valuationDate.gte = startDate;
      }
      if (endDate) {
        where.valuationDate.lte = endDate;
      }
    }

    const valuations = await this.prisma.propertyValuation.findMany({
      where,
      orderBy: {
        valuationDate: 'asc',
      },
      select: {
        valuationDate: true,
        estimatedValue: true,
      },
    });

    // Aggregate by date (sum values for same date)
    const aggregatedByDate = valuations.reduce((acc: Record<string, number>, v: any) => {
      const dateKey = v.valuationDate.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = 0;
      }
      acc[dateKey] += Number(v.estimatedValue);
      return acc;
    }, {} as Record<string, number>);

    // Convert to array format
    return Object.entries(aggregatedByDate)
      .map(([date, totalValue]: [string, number]) => ({
        date,
        totalValue: Number(totalValue.toFixed(2)),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
