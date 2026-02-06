import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateOwnershipDto } from './dto/create-ownership.dto';
import { UpdateOwnershipDto } from './dto/update-ownership.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class OwnershipsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all ownerships for a property
   */
  async findAllByProperty(propertyId: string, accountId: string) {
    // Verify property belongs to account
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, accountId },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }

    const ownerships = await this.prisma.propertyOwnership.findMany({
      where: {
        propertyId,
        accountId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        property: {
          select: {
            id: true,
            address: true,
            fileNumber: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    return ownerships;
  }

  /**
   * Get a single ownership by ID
   */
  async findOne(id: string, accountId: string) {
    const ownership = await this.prisma.propertyOwnership.findFirst({
      where: { id, accountId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            type: true,
            email: true,
            phone: true,
          },
        },
        property: {
          select: {
            id: true,
            address: true,
            fileNumber: true,
          },
        },
      },
    });

    if (!ownership) {
      throw new NotFoundException(`Ownership with ID ${id} not found`);
    }

    return ownership;
  }

  /**
   * Create a new ownership
   */
  async create(createOwnershipDto: CreateOwnershipDto, accountId: string) {
    // Verify property belongs to account
    const property = await this.prisma.property.findFirst({
      where: { id: createOwnershipDto.propertyId, accountId },
    });

    if (!property) {
      throw new NotFoundException(
        `Property with ID ${createOwnershipDto.propertyId} not found`,
      );
    }

    // Verify owner belongs to account
    const owner = await this.prisma.owner.findFirst({
      where: { id: createOwnershipDto.ownerId, accountId },
    });

    if (!owner) {
      throw new NotFoundException(
        `Owner with ID ${createOwnershipDto.ownerId} not found`,
      );
    }

    // Validate total percentage equals 100%
    await this.validateTotalPercentage(
      createOwnershipDto.propertyId,
      accountId,
      createOwnershipDto.ownershipPercentage,
    );

    const ownership = await this.prisma.propertyOwnership.create({
      data: {
        propertyId: createOwnershipDto.propertyId,
        ownerId: createOwnershipDto.ownerId,
        accountId,
        ownershipPercentage: new Decimal(
          createOwnershipDto.ownershipPercentage,
        ),
        ownershipType: createOwnershipDto.ownershipType,
        startDate: new Date(createOwnershipDto.startDate),
        endDate: createOwnershipDto.endDate
          ? new Date(createOwnershipDto.endDate)
          : null,
        notes: createOwnershipDto.notes,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        property: {
          select: {
            id: true,
            address: true,
            fileNumber: true,
          },
        },
      },
    });

    return ownership;
  }

  /**
   * Update an ownership
   */
  async update(
    id: string,
    updateOwnershipDto: UpdateOwnershipDto,
    accountId: string,
  ) {
    // Verify ownership exists and belongs to account
    const existingOwnership = await this.prisma.propertyOwnership.findFirst({
      where: { id, accountId },
    });

    if (!existingOwnership) {
      throw new NotFoundException(`Ownership with ID ${id} not found`);
    }

    // If updating propertyId, verify it belongs to account
    if (updateOwnershipDto.propertyId) {
      const property = await this.prisma.property.findFirst({
        where: { id: updateOwnershipDto.propertyId, accountId },
      });

      if (!property) {
        throw new NotFoundException(
          `Property with ID ${updateOwnershipDto.propertyId} not found`,
        );
      }
    }

    // If updating ownerId, verify it belongs to account
    if (updateOwnershipDto.ownerId) {
      const owner = await this.prisma.owner.findFirst({
        where: { id: updateOwnershipDto.ownerId, accountId },
      });

      if (!owner) {
        throw new NotFoundException(
          `Owner with ID ${updateOwnershipDto.ownerId} not found`,
        );
      }
    }

    // Calculate new percentage for validation
    const propertyIdToCheck =
      updateOwnershipDto.propertyId || existingOwnership.propertyId;
    const newPercentage =
      updateOwnershipDto.ownershipPercentage !== undefined
        ? updateOwnershipDto.ownershipPercentage
        : existingOwnership.ownershipPercentage.toNumber();

    // Validate total percentage equals 100% (excluding current ownership if updating percentage)
    await this.validateTotalPercentage(
      propertyIdToCheck,
      accountId,
      newPercentage,
      id, // Exclude current ownership from calculation
    );

    const ownership = await this.prisma.propertyOwnership.update({
      where: { id },
      data: {
        ...(updateOwnershipDto.propertyId && {
          propertyId: updateOwnershipDto.propertyId,
        }),
        ...(updateOwnershipDto.ownerId && {
          ownerId: updateOwnershipDto.ownerId,
        }),
        ...(updateOwnershipDto.ownershipPercentage !== undefined && {
          ownershipPercentage: new Decimal(
            updateOwnershipDto.ownershipPercentage,
          ),
        }),
        ...(updateOwnershipDto.ownershipType && {
          ownershipType: updateOwnershipDto.ownershipType,
        }),
        ...(updateOwnershipDto.startDate && {
          startDate: new Date(updateOwnershipDto.startDate),
        }),
        ...(updateOwnershipDto.endDate !== undefined && {
          endDate: updateOwnershipDto.endDate
            ? new Date(updateOwnershipDto.endDate)
            : null,
        }),
        ...(updateOwnershipDto.notes !== undefined && {
          notes: updateOwnershipDto.notes,
        }),
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        property: {
          select: {
            id: true,
            address: true,
            fileNumber: true,
          },
        },
      },
    });

    return ownership;
  }

  /**
   * Delete an ownership
   */
  async remove(id: string, accountId: string) {
    // Verify ownership exists and belongs to account
    const ownership = await this.prisma.propertyOwnership.findFirst({
      where: { id, accountId },
    });

    if (!ownership) {
      throw new NotFoundException(`Ownership with ID ${id} not found`);
    }

    await this.prisma.propertyOwnership.delete({
      where: { id },
    });

    return { message: 'Ownership deleted successfully' };
  }

  /**
   * Validate that total ownership percentage equals 100%
   * @param propertyId - Property ID to check
   * @param accountId - Account ID for security
   * @param newPercentage - New percentage being added/updated
   * @param excludeOwnershipId - Optional ownership ID to exclude from calculation (for updates)
   */
  async validateTotalPercentage(
    propertyId: string,
    accountId: string,
    newPercentage: number,
    excludeOwnershipId?: string,
  ): Promise<void> {
    // Get all active ownerships for this property (excluding the one being updated if provided)
    const where: any = {
      propertyId,
      accountId,
      endDate: null, // Only active ownerships (no end date)
    };

    if (excludeOwnershipId) {
      where.NOT = { id: excludeOwnershipId };
    }

    const existingOwnerships = await this.prisma.propertyOwnership.findMany({
      where,
      select: {
        id: true,
        ownershipPercentage: true,
      },
    });

    // Calculate total percentage
    const existingTotal = existingOwnerships.reduce(
      (sum, ownership) => sum + ownership.ownershipPercentage.toNumber(),
      0,
    );

    const totalPercentage = existingTotal + newPercentage;

    // Validate total equals 100%
    if (Math.abs(totalPercentage - 100) > 0.01) {
      // Allow small floating point differences
      throw new BadRequestException(
        `Total ownership percentage must equal 100%. Current total: ${totalPercentage.toFixed(
          2,
        )}% (existing: ${existingTotal.toFixed(
          2,
        )}% + new: ${newPercentage.toFixed(2)}%)`,
      );
    }
  }
}
