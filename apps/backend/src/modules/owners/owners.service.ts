import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { QueryOwnerDto } from './dto/query-owner.dto';
import { OwnerType, Prisma } from '@prisma/client';

/**
 * Service for managing owners (property ownership entities)
 */
@Injectable()
export class OwnersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new owner
   */
  async create(dto: CreateOwnerDto) {
    return this.prisma.owner.create({
      data: {
        name: dto.name,
        type: dto.type,
        idNumber: dto.idNumber,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        notes: dto.notes,
      },
    });
  }

  /**
   * Find all owners with pagination, search and type filter
   */
  async findAll(query: QueryOwnerDto) {
    const { page = 1, limit = 10, search, type } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.OwnerWhereInput = {};

    if (type) {
      where.type = type as OwnerType;
    }

    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { email: { contains: search.trim(), mode: 'insensitive' } },
        { phone: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.owner.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.owner.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Find one owner by ID
   */
  async findOne(id: string) {
    const owner = await this.prisma.owner.findUnique({
      where: { id },
    });

    if (!owner) {
      throw new NotFoundException(`Owner with id ${id} not found`);
    }

    return owner;
  }

  /**
   * Update an owner
   */
  async update(id: string, dto: UpdateOwnerDto) {
    await this.findOne(id);

    return this.prisma.owner.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.idNumber !== undefined && { idNumber: dto.idNumber }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
  }

  /**
   * Remove an owner. Fails if owner has ownerships.
   */
  async remove(id: string) {
    const owner = await this.prisma.owner.findUnique({
      where: { id },
      include: { ownerships: true },
    });

    if (!owner) {
      throw new NotFoundException(`Owner with id ${id} not found`);
    }

    if (owner.ownerships.length > 0) {
      throw new ConflictException(
        `Cannot delete owner: has ${owner.ownerships.length} ownership(s). Remove ownerships first.`,
      );
    }

    await this.prisma.owner.delete({
      where: { id },
    });
  }
}
