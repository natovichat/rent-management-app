import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateOwnershipDto } from './dto/create-ownership.dto';
import { UpdateOwnershipDto } from './dto/update-ownership.dto';
import { OwnershipType, Prisma } from '@prisma/client';

const OWNERSHIP_INCLUDE = {
  owner: true,
  property: true,
} as const;

/**
 * Service for managing ownerships (M:N junction between Owner and Property)
 */
@Injectable()
export class OwnershipsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new ownership for a property
   */
  async create(propertyId: string, dto: CreateOwnershipDto) {
    await this.ensurePropertyExists(propertyId);
    await this.ensureOwnerExists(dto.ownerId);

    if (dto.ownershipPercentage < 0 || dto.ownershipPercentage > 100) {
      throw new BadRequestException(
        'ownershipPercentage must be between 0 and 100',
      );
    }

    return this.prisma.ownership.create({
      data: {
        propertyId,
        ownerId: dto.ownerId,
        ownershipPercentage: dto.ownershipPercentage,
        ownershipType: dto.ownershipType as OwnershipType,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        managementFee: dto.managementFee ?? null,
        familyDivision: dto.familyDivision ?? false,
        notes: dto.notes ?? null,
      },
      include: OWNERSHIP_INCLUDE,
    });
  }

  /**
   * Find all ownerships for a property (includes owner details)
   */
  async findByProperty(propertyId: string) {
    await this.ensurePropertyExists(propertyId);

    return this.prisma.ownership.findMany({
      where: { propertyId },
      include: OWNERSHIP_INCLUDE,
      orderBy: { startDate: 'desc' },
    });
  }

  /**
   * Find all ownerships for an owner (includes property details)
   */
  async findByOwner(ownerId: string) {
    await this.ensureOwnerExists(ownerId);

    return this.prisma.ownership.findMany({
      where: { ownerId },
      include: OWNERSHIP_INCLUDE,
      orderBy: { startDate: 'desc' },
    });
  }

  /**
   * Find one ownership by ID
   */
  async findOne(id: string) {
    const ownership = await this.prisma.ownership.findUnique({
      where: { id },
      include: OWNERSHIP_INCLUDE,
    });

    if (!ownership) {
      throw new NotFoundException(`Ownership with id ${id} not found`);
    }

    return ownership;
  }

  /**
   * Validate total ownership percentage for a property (active ownerships only)
   * Active = endDate is null or in the future
   */
  async validateTotalOwnership(propertyId: string) {
    await this.ensurePropertyExists(propertyId);

    const now = new Date();
    const activeOwnerships = await this.prisma.ownership.findMany({
      where: {
        propertyId,
        OR: [{ endDate: null }, { endDate: { gt: now } }],
      },
      select: { ownershipPercentage: true },
    });

    const totalPercentage = activeOwnerships.reduce(
      (sum, o) => sum + Number(o.ownershipPercentage),
      0,
    );

    const isValid = Math.abs(totalPercentage - 100) < 0.01; // Allow floating point tolerance
    const message = isValid
      ? `Total ownership is ${totalPercentage.toFixed(2)}%`
      : `Total ownership is ${totalPercentage.toFixed(2)}% (expected 100%)`;

    return {
      isValid,
      totalPercentage: Math.round(totalPercentage * 100) / 100,
      message,
    };
  }

  /**
   * Update an ownership
   */
  async update(id: string, dto: UpdateOwnershipDto) {
    await this.findOne(id);

    if (dto.ownerId !== undefined) {
      await this.ensureOwnerExists(dto.ownerId);
    }

    if (
      dto.ownershipPercentage !== undefined &&
      (dto.ownershipPercentage < 0 || dto.ownershipPercentage > 100)
    ) {
      throw new BadRequestException(
        'ownershipPercentage must be between 0 and 100',
      );
    }

    const data: Prisma.OwnershipUpdateInput = {};
    if (dto.ownerId !== undefined) data.owner = { connect: { id: dto.ownerId } };
    if (dto.ownershipPercentage !== undefined)
      data.ownershipPercentage = dto.ownershipPercentage;
    if (dto.ownershipType !== undefined)
      data.ownershipType = dto.ownershipType as OwnershipType;
    if (dto.startDate !== undefined) data.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined)
      data.endDate = dto.endDate ? new Date(dto.endDate) : null;
    if (dto.managementFee !== undefined)
      data.managementFee = dto.managementFee ?? null;
    if (dto.familyDivision !== undefined)
      data.familyDivision = dto.familyDivision;
    if (dto.notes !== undefined) data.notes = dto.notes ?? null;

    return this.prisma.ownership.update({
      where: { id },
      data,
      include: OWNERSHIP_INCLUDE,
    });
  }

  /**
   * Remove an ownership
   */
  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.ownership.delete({
      where: { id },
    });
  }

  private async ensurePropertyExists(propertyId: string, message?: string) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });
    if (!property) {
      throw new NotFoundException(
        message ?? `Property with id ${propertyId} not found`,
      );
    }
  }

  private async ensureOwnerExists(ownerId: string, message?: string) {
    const owner = await this.prisma.owner.findUnique({
      where: { id: ownerId },
    });
    if (!owner) {
      throw new NotFoundException(
        message ?? `Owner with id ${ownerId} not found`,
      );
    }
  }
}
