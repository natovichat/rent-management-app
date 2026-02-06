import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new unit
   * Verifies property ownership before creating
   */
  async create(accountId: string, createDto: CreateUnitDto) {
    // Verify property belongs to account
    const property = await this.prisma.property.findFirst({
      where: {
        id: createDto.propertyId,
        accountId,
      },
    });

    if (!property) {
      throw new NotFoundException(
        `Property with ID ${createDto.propertyId} not found or does not belong to your account`,
      );
    }

    // Check if apartment number already exists for this property
    const existingUnit = await this.prisma.unit.findUnique({
      where: {
        propertyId_apartmentNumber: {
          propertyId: createDto.propertyId,
          apartmentNumber: createDto.apartmentNumber,
        },
      },
    });

    if (existingUnit) {
      throw new BadRequestException(
        `מספר דירה ${createDto.apartmentNumber} כבר קיים בנכס זה`,
      );
    }

    const unit = await this.prisma.unit.create({
      data: {
        propertyId: createDto.propertyId,
        accountId, // Denormalized for faster queries
        apartmentNumber: createDto.apartmentNumber,
        floor: createDto.floor,
        roomCount: createDto.roomCount,
        notes: createDto.notes,
        // Detailed Information
        unitType: createDto.unitType,
        area: createDto.area,
        bedrooms: createDto.bedrooms,
        bathrooms: createDto.bathrooms,
        balconyArea: createDto.balconyArea,
        storageArea: createDto.storageArea,
        // Amenities
        hasElevator: createDto.hasElevator ?? false,
        hasParking: createDto.hasParking ?? false,
        parkingSpots: createDto.parkingSpots,
        // Status & Condition
        furnishingStatus: createDto.furnishingStatus,
        condition: createDto.condition,
        occupancyStatus: createDto.occupancyStatus,
        isOccupied: createDto.isOccupied ?? false,
        // Dates
        entryDate: createDto.entryDate ? new Date(createDto.entryDate) : null,
        lastRenovationDate: createDto.lastRenovationDate ? new Date(createDto.lastRenovationDate) : null,
        // Financial
        currentRent: createDto.currentRent,
        marketRent: createDto.marketRent,
        // Additional
        utilities: createDto.utilities,
      },
      include: {
        property: {
          select: {
            id: true,
            address: true,
            fileNumber: true,
          },
        },
        leases: {
          where: {
            status: 'ACTIVE',
          },
          take: 1,
          orderBy: {
            startDate: 'desc',
          },
          select: {
            id: true,
            startDate: true,
            endDate: true,
            monthlyRent: true,
            status: true,
          },
        },
      },
    });

    return {
      ...unit,
      activeLease: unit.leases[0] || null,
    };
  }

  /**
   * Find all units for account with optional filters
   */
  async findAll(
    accountId: string,
    propertyId?: string,
    unitType?: string,
    floor?: number,
    roomCount?: number,
    occupancyStatus?: string,
    search?: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      accountId,
    };

    if (propertyId) {
      // Verify property belongs to account
      const property = await this.prisma.property.findFirst({
        where: {
          id: propertyId,
          accountId,
        },
      });

      if (!property) {
        throw new NotFoundException(
          `Property with ID ${propertyId} not found or does not belong to your account`,
        );
      }

      where.propertyId = propertyId;
    }

    // Filter by unit type
    if (unitType) {
      where.unitType = unitType;
    }

    // Filter by floor
    if (floor !== undefined && floor !== null) {
      where.floor = floor;
    }

    // Filter by room count
    if (roomCount !== undefined && roomCount !== null) {
      where.roomCount = roomCount;
    }

    // Filter by occupancy status
    if (occupancyStatus) {
      where.occupancyStatus = occupancyStatus;
    }

    // Search filter: search by apartment number OR property address
    if (search && search.trim()) {
      const searchTerm = search.trim();
      where.OR = [
        {
          apartmentNumber: {
            contains: searchTerm,
            mode: 'insensitive' as const,
          },
        },
        {
          property: {
            address: {
              contains: searchTerm,
              mode: 'insensitive' as const,
            },
          },
        },
      ];
    }

    // Fetch units with property info
    // Note: Prisma doesn't support nested orderBy for relations in all cases
    // So we fetch and sort in memory for proper sorting by property address
    const [allUnits, total] = await Promise.all([
      this.prisma.unit.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              address: true,
              fileNumber: true,
            },
          },
          leases: {
            where: {
              status: 'ACTIVE',
            },
            take: 1,
            orderBy: {
              startDate: 'desc',
            },
            select: {
              id: true,
              startDate: true,
              endDate: true,
              monthlyRent: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.unit.count({ where }),
    ]);

    // Sort by property address, then apartment number
    const sortedUnits = allUnits.sort((a: any, b: any) => {
      // First sort by property address
      const addressCompare = (a.property.address || '').localeCompare(b.property.address || '');
      if (addressCompare !== 0) {
        return addressCompare;
      }
      // Then sort by apartment number (numeric if possible)
      const aptA = parseInt(a.apartmentNumber);
      const aptB = parseInt(b.apartmentNumber);
      if (!isNaN(aptA) && !isNaN(aptB)) {
        return aptA - aptB;
      }
      return a.apartmentNumber.localeCompare(b.apartmentNumber);
    });

    // Apply pagination after sorting
    const paginatedUnits = sortedUnits.slice(skip, skip + limit);

    return {
      data: paginatedUnits.map((unit: any) => ({
        ...unit,
        activeLease: unit.leases[0] || null,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find one unit by ID with property and lease info (all leases for history)
   */
  async findOne(id: string, accountId: string) {
    const unit = await this.prisma.unit.findFirst({
      where: { id, accountId },
      include: {
        property: {
          select: {
            id: true,
            address: true,
            fileNumber: true,
          },
        },
        leases: {
          orderBy: {
            startDate: 'desc',
          },
          select: {
            id: true,
            startDate: true,
            endDate: true,
            monthlyRent: true,
            status: true,
            tenant: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }

    // Find active lease (if exists)
    const activeLease = unit.leases.find((lease: any) => lease.status === 'ACTIVE') || null;

    return {
      ...unit,
      activeLease,
    };
  }

  /**
   * Update unit
   */
  async update(id: string, accountId: string, updateDto: UpdateUnitDto) {
    // Verify ownership
    const existingUnit = await this.verifyOwnership(id, accountId);

    let newPropertyId = existingUnit.propertyId;
    let newAccountId = accountId;

    // If propertyId is being updated, verify new property belongs to account
    if (updateDto.propertyId !== undefined) {
      const property = await this.prisma.property.findFirst({
        where: {
          id: updateDto.propertyId,
          accountId,
        },
      });

      if (!property) {
        throw new NotFoundException(
          `Property with ID ${updateDto.propertyId} not found or does not belong to your account`,
        );
      }

      newPropertyId = updateDto.propertyId;
      newAccountId = property.accountId; // Update denormalized accountId
    }

    // Check for duplicate apartment numbers
    const apartmentNumberToCheck =
      updateDto.apartmentNumber !== undefined ? updateDto.apartmentNumber : existingUnit.apartmentNumber;
    const propertyIdToCheck = updateDto.propertyId !== undefined ? updateDto.propertyId : existingUnit.propertyId;

    if (apartmentNumberToCheck !== existingUnit.apartmentNumber || newPropertyId !== existingUnit.propertyId) {
      const existingUnitWithSameNumber = await this.prisma.unit.findFirst({
        where: {
          propertyId: propertyIdToCheck,
          apartmentNumber: apartmentNumberToCheck,
          id: { not: id },
        },
      });

      if (existingUnitWithSameNumber) {
        throw new BadRequestException(
          `מספר דירה ${apartmentNumberToCheck} כבר קיים בנכס זה`,
        );
      }
    }

    const unit = await this.prisma.unit.update({
      where: { id },
      data: {
        ...updateDto,
        accountId: newAccountId, // Update denormalized accountId if property changed
      },
      include: {
        property: {
          select: {
            id: true,
            address: true,
            fileNumber: true,
          },
        },
        leases: {
          where: {
            status: 'ACTIVE',
          },
          take: 1,
          orderBy: {
            startDate: 'desc',
          },
          select: {
            id: true,
            startDate: true,
            endDate: true,
            monthlyRent: true,
            status: true,
          },
        },
      },
    });

    return {
      ...unit,
      activeLease: unit.leases[0] || null,
    };
  }

  /**
   * Delete unit
   * Cannot delete if unit has any leases (active or historical)
   */
  async remove(id: string, accountId: string) {
    // Verify ownership
    await this.verifyOwnership(id, accountId);

    // Check if unit has any leases (active or historical)
    const leaseCount = await this.prisma.lease.count({
      where: {
        unitId: id,
      },
    });

    if (leaseCount > 0) {
      throw new ForbiddenException(
        'לא ניתן למחוק דירה עם חוזי שכירות. יש להסיר את כל החוזים תחילה.',
      );
    }

    await this.prisma.unit.delete({
      where: { id },
    });

    return { message: 'Unit deleted successfully' };
  }

  /**
   * Helper: Verify unit ownership
   */
  private async verifyOwnership(id: string, accountId: string) {
    const unit = await this.prisma.unit.findFirst({
      where: { id, accountId },
    });

    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }

    return unit;
  }
}
