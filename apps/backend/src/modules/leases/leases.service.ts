import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { UpdateLeaseDto } from './dto/update-lease.dto';
import { LeaseStatus } from '@prisma/client';

/**
 * Service for managing leases.
 * 
 * Handles CRUD operations for leases with:
 * - Automatic status calculation based on dates
 * - Date validation (end > start)
 * - Conflict detection (overlapping leases for same unit)
 * - Account isolation
 */
@Injectable()
export class LeasesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculate lease status based on dates.
   */
  private calculateLeaseStatus(startDate: Date, endDate: Date): LeaseStatus {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Compare dates without time

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    if (now < start) {
      return LeaseStatus.FUTURE;
    } else if (now >= start && now <= end) {
      return LeaseStatus.ACTIVE;
    } else {
      return LeaseStatus.EXPIRED;
    }
  }

  /**
   * Validate lease dates.
   */
  private validateDates(startDate: string | Date, endDate: string | Date) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      throw new BadRequestException('End date must be after start date');
    }
  }

  /**
   * Check for overlapping leases on the same unit.
   */
  private async checkForOverlap(
    accountId: string,
    unitId: string,
    startDate: Date,
    endDate: Date,
    excludeLeaseId?: string,
  ) {
    const overlapping = await this.prisma.lease.findFirst({
      where: {
        accountId,
        unitId,
        id: excludeLeaseId ? { not: excludeLeaseId } : undefined,
        status: {
          in: [LeaseStatus.FUTURE, LeaseStatus.ACTIVE],
        },
        OR: [
          // New lease starts during existing lease
          {
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: startDate } },
            ],
          },
          // New lease ends during existing lease
          {
            AND: [
              { startDate: { lte: endDate } },
              { endDate: { gte: endDate } },
            ],
          },
          // New lease completely contains existing lease
          {
            AND: [
              { startDate: { gte: startDate } },
              { endDate: { lte: endDate } },
            ],
          },
        ],
      },
    });

    if (overlapping) {
      throw new ConflictException(
        'This unit already has a lease during the selected period',
      );
    }
  }

  /**
   * Create a new lease.
   */
  async create(accountId: string, createLeaseDto: CreateLeaseDto) {
    // Validate dates
    this.validateDates(createLeaseDto.startDate, createLeaseDto.endDate);

    // Verify unit belongs to account
    const unit = await this.prisma.unit.findFirst({
      where: {
        id: createLeaseDto.unitId,
        accountId,
      },
    });

    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    // Verify tenant belongs to account
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        id: createLeaseDto.tenantId,
        accountId,
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Check for overlapping leases
    await this.checkForOverlap(
      accountId,
      createLeaseDto.unitId,
      new Date(createLeaseDto.startDate),
      new Date(createLeaseDto.endDate),
    );

    // Calculate status
    const status = this.calculateLeaseStatus(
      new Date(createLeaseDto.startDate),
      new Date(createLeaseDto.endDate),
    );

    return this.prisma.lease.create({
      data: {
        accountId,
        unitId: createLeaseDto.unitId,
        tenantId: createLeaseDto.tenantId,
        startDate: new Date(createLeaseDto.startDate),
        endDate: new Date(createLeaseDto.endDate),
        monthlyRent: createLeaseDto.monthlyRent,
        paymentTo: createLeaseDto.paymentTo,
        notes: createLeaseDto.notes,
        status,
      },
      include: {
        unit: {
          include: {
            property: true,
          },
        },
        tenant: true,
      },
    });
  }

  /**
   * Get all leases for an account.
   */
  async findAll(
    accountId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    startDateFrom?: string,
    startDateTo?: string,
    endDateFrom?: string,
    endDateTo?: string,
    minMonthlyRent?: number,
    maxMonthlyRent?: number,
    propertyId?: string,
    tenantId?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      accountId,
      ...(tenantId && { tenantId }),
      ...(propertyId && {
        unit: {
          propertyId,
        },
      }),
    };

    // Search across property address and tenant name
    if (search) {
      const trimmedSearch = search.trim();
      if (trimmedSearch.length > 0) {
        where.OR = [
          {
            unit: {
              property: {
                address: { contains: trimmedSearch, mode: 'insensitive' as const },
              },
            },
          },
          {
            tenant: {
              name: { contains: trimmedSearch, mode: 'insensitive' as const },
            },
          },
        ];
      }
    }

    // Advanced filters - Start date range
    if (startDateFrom || startDateTo) {
      where.startDate = {};
      if (startDateFrom) {
        where.startDate.gte = new Date(startDateFrom);
      }
      if (startDateTo) {
        where.startDate.lte = new Date(startDateTo);
      }
    }

    // Advanced filters - End date range
    if (endDateFrom || endDateTo) {
      where.endDate = {};
      if (endDateFrom) {
        where.endDate.gte = new Date(endDateFrom);
      }
      if (endDateTo) {
        where.endDate.lte = new Date(endDateTo);
      }
    }

    // Advanced filters - Monthly rent range
    if (minMonthlyRent !== undefined || maxMonthlyRent !== undefined) {
      where.monthlyRent = {};
      if (minMonthlyRent !== undefined) {
        where.monthlyRent.gte = minMonthlyRent;
      }
      if (maxMonthlyRent !== undefined) {
        where.monthlyRent.lte = maxMonthlyRent;
      }
    }

    const [leases, total] = await Promise.all([
      this.prisma.lease.findMany({
        where,
        skip,
        take: limit,
        include: {
          unit: {
            include: {
              property: true,
            },
          },
          tenant: true,
        },
        orderBy: { startDate: 'desc' },
      }),
      this.prisma.lease.count({ where }),
    ]);

    return {
      data: leases,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single lease by ID.
   */
  async findOne(accountId: string, id: string) {
    const lease = await this.prisma.lease.findFirst({
      where: { id, accountId },
      include: {
        unit: {
          include: {
            property: true,
          },
        },
        tenant: true,
      },
    });

    if (!lease) {
      throw new NotFoundException(`Lease with ID ${id} not found`);
    }

    return lease;
  }

  /**
   * Update a lease.
   */
  async update(accountId: string, id: string, updateLeaseDto: UpdateLeaseDto) {
    // Verify lease belongs to account
    const existingLease = await this.findOne(accountId, id);

    // Don't allow updating terminated leases
    if (existingLease.status === LeaseStatus.TERMINATED) {
      throw new BadRequestException('Cannot update a terminated lease');
    }

    // Validate dates if provided
    const startDate =
      updateLeaseDto.startDate !== undefined
        ? new Date(updateLeaseDto.startDate)
        : existingLease.startDate;
    const endDate =
      updateLeaseDto.endDate !== undefined
        ? new Date(updateLeaseDto.endDate)
        : existingLease.endDate;

    if (updateLeaseDto.startDate !== undefined || updateLeaseDto.endDate !== undefined) {
      this.validateDates(startDate, endDate);
    }

    // Check for overlapping leases if dates or unit changed
    if (updateLeaseDto.unitId !== undefined || updateLeaseDto.startDate !== undefined || updateLeaseDto.endDate !== undefined) {
      const unitId = updateLeaseDto.unitId !== undefined ? updateLeaseDto.unitId : existingLease.unitId;
      await this.checkForOverlap(accountId, unitId, startDate, endDate, id);
    }

    // Recalculate status
    const status = this.calculateLeaseStatus(startDate, endDate);

    return this.prisma.lease.update({
      where: { id },
      data: {
        ...updateLeaseDto,
        startDate: updateLeaseDto.startDate !== undefined ? new Date(updateLeaseDto.startDate) : undefined,
        endDate: updateLeaseDto.endDate !== undefined ? new Date(updateLeaseDto.endDate) : undefined,
        status,
      },
      include: {
        unit: {
          include: {
            property: true,
          },
        },
        tenant: true,
      },
    });
  }

  /**
   * Terminate a lease early.
   */
  async terminate(accountId: string, id: string) {
    // Verify lease belongs to account
    await this.findOne(accountId, id);

    return this.prisma.lease.update({
      where: { id },
      data: { status: LeaseStatus.TERMINATED },
      include: {
        unit: {
          include: {
            property: true,
          },
        },
        tenant: true,
      },
    });
  }

  /**
   * Delete a lease.
   */
  async remove(accountId: string, id: string) {
    // Verify lease belongs to account
    await this.findOne(accountId, id);

    await this.prisma.lease.delete({
      where: { id },
    });

    return { message: 'Lease deleted successfully' };
  }

  /**
   * Update statuses for all leases (run daily via cron).
   */
  async updateAllStatuses() {
    const leases = await this.prisma.lease.findMany({
      where: {
        status: {
          in: [LeaseStatus.FUTURE, LeaseStatus.ACTIVE],
        },
      },
    });

    for (const lease of leases) {
      const newStatus = this.calculateLeaseStatus(
        lease.startDate,
        lease.endDate,
      );

      if (newStatus !== lease.status) {
        await this.prisma.lease.update({
          where: { id: lease.id },
          data: { status: newStatus },
        });
      }
    }

    return {
      message: `Updated ${leases.length} leases`,
    };
  }

  /**
   * Delete all leases for test account (E2E testing only).
   */
  async deleteAllForAccount(accountId: string): Promise<{ deletedCount: number }> {
    console.log('[LeasesService] Deleting all leases for account:', accountId);
    
    // Safety check: Only allow deletion for test account
    const TEST_ACCOUNT_ID = '00000000-0000-0000-0000-000000000001';
    if (accountId !== TEST_ACCOUNT_ID) {
      throw new ForbiddenException(
        'Can only delete data for test account. This is a safety measure to prevent accidental data loss.'
      );
    }

    try {
      const result = await this.prisma.lease.deleteMany({
        where: { accountId },
      });

      console.log('[LeasesService] Deleted', result.count, 'leases for account', accountId);
      return { deletedCount: result.count };
    } catch (error) {
      console.error('[LeasesService] Error deleting leases:', error);
      throw error;
    }
  }

  async getExpirationTimeline(accountId: string, monthsAhead: number = 12) {
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + monthsAhead);

    const leases = await this.prisma.lease.findMany({
      where: {
        accountId,
        endDate: {
          lte: endDate,
        },
      },
      include: {
        unit: {
          include: {
            property: {
              select: {
                id: true,
                address: true,
              },
            },
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        endDate: 'asc',
      },
    });

    return leases.map((lease) => ({
      id: lease.id,
      endDate: lease.endDate,
      startDate: lease.startDate,
      status: lease.status,
      monthlyRent: lease.monthlyRent,
      unit: {
        id: lease.unit.id,
        apartmentNumber: lease.unit.apartmentNumber,
        property: lease.unit.property,
      },
      tenant: lease.tenant,
    }));
  }
}
