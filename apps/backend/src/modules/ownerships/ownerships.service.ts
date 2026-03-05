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
  person: true,
  property: true,
} as const;

/**
 * Service for managing ownerships (M:N junction between Person and Property)
 */
@Injectable()
export class OwnershipsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new ownership for a property
   */
  async create(propertyId: string, dto: CreateOwnershipDto) {
    await this.ensurePropertyExists(propertyId);
    await this.ensurePersonExists(dto.personId);

    if (dto.ownershipPercentage < 0 || dto.ownershipPercentage > 100) {
      throw new BadRequestException(
        'ownershipPercentage must be between 0 and 100',
      );
    }

    return this.prisma.ownership.create({
      data: {
        propertyId,
        personId: dto.personId,
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
   * Find all ownerships with pagination (includes property and person)
   */
  async findAll(
    page: number = 1,
    limit: number = 20,
    includeDeleted = false,
    personId?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.OwnershipWhereInput = {};
    if (!includeDeleted) {
      where.deletedAt = null;
    }
    if (personId?.trim()) {
      where.personId = personId.trim();
    }

    const [ownerships, total] = await Promise.all([
      this.prisma.ownership.findMany({
        where,
        skip,
        take: limit,
        include: OWNERSHIP_INCLUDE,
        orderBy: { startDate: 'desc' },
      }),
      this.prisma.ownership.count({ where }),
    ]);

    return {
      data: ownerships,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find all ownerships for a property (includes person details)
   */
  async findByProperty(propertyId: string, includeDeleted = false) {
    await this.ensurePropertyExists(propertyId);

    const where: Prisma.OwnershipWhereInput = { propertyId };
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    return this.prisma.ownership.findMany({
      where,
      include: OWNERSHIP_INCLUDE,
      orderBy: { startDate: 'desc' },
    });
  }

  /**
   * Find all ownerships for a person (includes property details)
   */
  async findByPerson(personId: string, includeDeleted = false) {
    await this.ensurePersonExists(personId);

    const where: Prisma.OwnershipWhereInput = { personId };
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    return this.prisma.ownership.findMany({
      where,
      include: OWNERSHIP_INCLUDE,
      orderBy: { startDate: 'desc' },
    });
  }

  /**
   * Find one ownership by ID
   */
  async findOne(id: string, includeDeleted = false) {
    const ownership = await this.prisma.ownership.findFirst({
      where: {
        id,
        ...(!includeDeleted && { deletedAt: null }),
      },
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
        deletedAt: null,
        OR: [{ endDate: null }, { endDate: { gt: now } }],
      },
      select: { ownershipPercentage: true },
    });

    const totalPercentage = activeOwnerships.reduce(
      (sum, o) => sum + Number(o.ownershipPercentage),
      0,
    );

    const isValid = Math.abs(totalPercentage - 100) < 0.01;
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

    if (dto.personId !== undefined) {
      await this.ensurePersonExists(dto.personId);
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
    if (dto.personId !== undefined) data.person = { connect: { id: dto.personId } };
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
   * Soft-delete an ownership
   */
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.ownership.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Restore a soft-deleted ownership
   */
  async restore(id: string) {
    const ownership = await this.prisma.ownership.findFirst({
      where: { id, deletedAt: { not: null } },
      include: OWNERSHIP_INCLUDE,
    });

    if (!ownership) {
      throw new NotFoundException(`Deleted ownership with id ${id} not found`);
    }

    return this.prisma.ownership.update({
      where: { id },
      data: { deletedAt: null },
      include: OWNERSHIP_INCLUDE,
    });
  }

  private async ensurePropertyExists(propertyId: string, message?: string) {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, deletedAt: null },
    });
    if (!property) {
      throw new NotFoundException(
        message ?? `Property with id ${propertyId} not found`,
      );
    }
  }

  private async ensurePersonExists(personId: string, message?: string) {
    const person = await this.prisma.person.findFirst({
      where: { id: personId, deletedAt: null },
    });
    if (!person) {
      throw new NotFoundException(
        message ?? `Person with id ${personId} not found`,
      );
    }
  }
}
