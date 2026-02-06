import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';

@Injectable()
export class OwnersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new owner.
   */
  async create(createDto: CreateOwnerDto, accountId: string) {
    // Validate email uniqueness per account if provided
    if (createDto.email) {
      const existingOwner = await this.prisma.owner.findFirst({
        where: {
          accountId,
          email: createDto.email,
        },
      });

      if (existingOwner) {
        throw new ConflictException(
          `Owner with email ${createDto.email} already exists`,
        );
      }
    }

    // Use idNumber if provided, otherwise use taxId (both map to idNumber in schema)
    const idNumber = createDto.idNumber || createDto.taxId;

    const owner = await this.prisma.owner.create({
      data: {
        accountId,
        name: createDto.name,
        type: createDto.type,
        idNumber,
        email: createDto.email,
        phone: createDto.phone,
        notes: createDto.notes,
      },
      include: {
        _count: {
          select: { ownerships: true },
        },
      },
    });

    return {
      ...owner,
      ownershipCount: owner._count.ownerships,
    };
  }

  /**
   * Get all owners for an account with pagination and search.
   */
  async findAll(
    accountId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ) {
    const skip = (page - 1) * limit;

    // Trim and check if search is meaningful (not just whitespace)
    const trimmedSearch = search?.trim();
    const hasSearch = trimmedSearch && trimmedSearch.length > 0;

    const where: any = {
      accountId,
      ...(hasSearch && {
        OR: [
          { name: { contains: trimmedSearch, mode: 'insensitive' as const } },
          { email: { contains: trimmedSearch, mode: 'insensitive' as const } },
          { phone: { contains: trimmedSearch, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [owners, total] = await Promise.all([
      this.prisma.owner.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: { ownerships: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.owner.count({ where }),
    ]);

    return {
      data: owners.map((o) => ({
        ...o,
        ownershipCount: o._count.ownerships,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single owner by ID.
   */
  async findOne(id: string, accountId: string) {
    const owner = await this.prisma.owner.findFirst({
      where: { id, accountId },
      include: {
        _count: {
          select: { ownerships: true },
        },
      },
    });

    if (!owner) {
      throw new NotFoundException(`Owner with ID ${id} not found`);
    }

    return owner;
  }

  /**
   * Update an owner.
   */
  async update(id: string, accountId: string, updateDto: UpdateOwnerDto) {
    // Verify ownership
    await this.verifyOwnership(id, accountId);

    // Validate email uniqueness if updating email
    if (updateDto.email) {
      const existingOwner = await this.prisma.owner.findFirst({
        where: {
          accountId,
          email: updateDto.email,
          NOT: { id },
        },
      });

      if (existingOwner) {
        throw new ConflictException(
          `Owner with email ${updateDto.email} already exists`,
        );
      }
    }

    // Prepare update data - handle idNumber/taxId mapping
    const updateData: any = { ...updateDto };
    if (updateDto.taxId !== undefined && updateDto.idNumber === undefined) {
      updateData.idNumber = updateDto.taxId;
      delete updateData.taxId;
    } else if (updateDto.idNumber !== undefined) {
      delete updateData.taxId;
    }

    const owner = await this.prisma.owner.update({
      where: { id },
      data: updateData,
    });

    return owner;
  }

  /**
   * Delete an owner.
   * Cannot delete if owner has active property ownerships.
   */
  async remove(id: string, accountId: string) {
    // Verify ownership
    await this.verifyOwnership(id, accountId);

    // Check if owner has any ownerships (active or inactive)
    const ownershipCount = await this.prisma.propertyOwnership.count({
      where: {
        ownerId: id,
      },
    });

    if (ownershipCount > 0) {
      throw new ForbiddenException(
        'Cannot delete owner with property ownerships. Remove ownerships first.',
      );
    }

    await this.prisma.owner.delete({
      where: { id },
    });

    return { message: 'Owner deleted successfully' };
  }

  /**
   * Delete all owners for test account (E2E testing only).
   * Safety: Only allows deletion for test account ID.
   */
  async deleteAllForAccount(accountId: string): Promise<{ deletedCount: number }> {
    console.log('[OwnersService] Deleting all owners for account:', accountId);
    
    // Safety check: Only allow deletion for test account
    const TEST_ACCOUNT_ID = '00000000-0000-0000-0000-000000000001';
    if (accountId !== TEST_ACCOUNT_ID) {
      throw new ForbiddenException(
        'Can only delete data for test account. This is a safety measure to prevent accidental data loss.'
      );
    }

    try {
      const result = await this.prisma.owner.deleteMany({
        where: { accountId },
      });

      console.log('[OwnersService] Deleted', result.count, 'owners for account', accountId);
      return { deletedCount: result.count };
    } catch (error) {
      console.error('[OwnersService] Error deleting owners:', error);
      throw error;
    }
  }

  /**
   * Get all properties owned by an owner.
   */
  async getOwnerProperties(ownerId: string, accountId: string) {
    // Verify owner exists and belongs to account
    const owner = await this.verifyOwnership(ownerId, accountId);

    // Get all ownerships for this owner
    const ownerships = await this.prisma.propertyOwnership.findMany({
      where: {
        ownerId,
        accountId,
      },
      include: {
        property: {
          select: {
            id: true,
            address: true,
            fileNumber: true,
            type: true,
            status: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return ownerships.map((ownership) => ({
      property: ownership.property,
      ownershipPercentage: ownership.ownershipPercentage.toNumber(),
      ownershipType: ownership.ownershipType,
      startDate: ownership.startDate,
      endDate: ownership.endDate,
      notes: ownership.notes,
    }));
  }

  /**
   * Helper: Verify owner belongs to account.
   */
  private async verifyOwnership(id: string, accountId: string) {
    const owner = await this.prisma.owner.findFirst({
      where: { id, accountId },
    });

    if (!owner) {
      throw new NotFoundException(`Owner with ID ${id} not found`);
    }

    return owner;
  }
}
