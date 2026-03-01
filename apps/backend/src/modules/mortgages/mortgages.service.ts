import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateMortgageDto } from './dto/create-mortgage.dto';
import { UpdateMortgageDto } from './dto/update-mortgage.dto';
import { QueryMortgageDto } from './dto/query-mortgage.dto';
import { Prisma } from '@prisma/client';

const mortgageInclude = {
  property: true,
  bankAccount: true,
  mortgageOwner: true,
  payer: true,
} as const;

/**
 * Service for managing mortgages.
 * Handles CRUD operations with validation of related entities.
 */
@Injectable()
export class MortgagesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new mortgage.
   * Validates that property, bankAccount, mortgageOwner, and payer exist when provided.
   */
  async create(dto: CreateMortgageDto) {
    await this.validateRelatedEntities(dto);

    const data: Prisma.MortgageCreateInput = {
      bank: dto.bank,
      loanAmount: dto.loanAmount,
      startDate: new Date(dto.startDate),
      status: dto.status,
      payer: { connect: { id: dto.payerId } },
      linkedProperties: dto.linkedProperties ?? [],
    };

    if (dto.propertyId) {
      data.property = { connect: { id: dto.propertyId } };
    }
    if (dto.bankAccountId) {
      data.bankAccount = { connect: { id: dto.bankAccountId } };
    }
    if (dto.mortgageOwnerId) {
      data.mortgageOwner = { connect: { id: dto.mortgageOwnerId } };
    }
    if (dto.interestRate !== undefined) {
      data.interestRate = dto.interestRate;
    }
    if (dto.monthlyPayment !== undefined) {
      data.monthlyPayment = dto.monthlyPayment;
    }
    if (dto.earlyRepaymentPenalty !== undefined) {
      data.earlyRepaymentPenalty = dto.earlyRepaymentPenalty;
    }
    if (dto.endDate) {
      data.endDate = new Date(dto.endDate);
    }
    if (dto.notes !== undefined) {
      data.notes = dto.notes;
    }

    return this.prisma.mortgage.create({
      data,
      include: mortgageInclude,
    });
  }

  /**
   * Find all mortgages with pagination and filters.
   */
  async findAll(query: QueryMortgageDto) {
    const { page = 1, limit = 20, status, propertyId, includeDeleted } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.MortgageWhereInput = {};

    if (!includeDeleted) {
      where.deletedAt = null;
    }

    if (status) {
      where.status = status;
    }
    if (propertyId) {
      where.OR = [
        { propertyId },
        { linkedProperties: { has: propertyId } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.mortgage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: mortgageInclude,
      }),
      this.prisma.mortgage.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a mortgage by ID with relations.
   */
  async findOne(id: string, includeDeleted = false) {
    const mortgage = await this.prisma.mortgage.findFirst({
      where: {
        id,
        ...(!includeDeleted && { deletedAt: null }),
      },
      include: mortgageInclude,
    });

    if (!mortgage) {
      throw new NotFoundException(`Mortgage with ID ${id} not found`);
    }

    return mortgage;
  }

  /**
   * Find mortgages by property ID (direct or linked).
   */
  async findByProperty(propertyId: string, includeDeleted = false) {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, deletedAt: null },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }

    const where: Prisma.MortgageWhereInput = {
      OR: [
        { propertyId },
        { linkedProperties: { has: propertyId } },
      ],
    };
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    return this.prisma.mortgage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: mortgageInclude,
    });
  }

  /**
   * Update a mortgage.
   */
  async update(id: string, dto: UpdateMortgageDto) {
    await this.findOne(id);
    await this.validateRelatedEntities(dto);

    const data: Prisma.MortgageUpdateInput = {};

    if (dto.bank !== undefined) data.bank = dto.bank;
    if (dto.loanAmount !== undefined) data.loanAmount = dto.loanAmount;
    if (dto.payerId !== undefined) data.payer = { connect: { id: dto.payerId } };
    if (dto.startDate !== undefined) data.startDate = new Date(dto.startDate);
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.propertyId !== undefined) {
      data.property = dto.propertyId
        ? { connect: { id: dto.propertyId } }
        : { disconnect: true };
    }
    if (dto.bankAccountId !== undefined) {
      data.bankAccount = dto.bankAccountId
        ? { connect: { id: dto.bankAccountId } }
        : { disconnect: true };
    }
    if (dto.mortgageOwnerId !== undefined) {
      data.mortgageOwner = dto.mortgageOwnerId
        ? { connect: { id: dto.mortgageOwnerId } }
        : { disconnect: true };
    }
    if (dto.interestRate !== undefined) data.interestRate = dto.interestRate;
    if (dto.monthlyPayment !== undefined) data.monthlyPayment = dto.monthlyPayment;
    if (dto.earlyRepaymentPenalty !== undefined) {
      data.earlyRepaymentPenalty = dto.earlyRepaymentPenalty;
    }
    if (dto.endDate !== undefined) {
      data.endDate = dto.endDate ? new Date(dto.endDate) : null;
    }
    if (dto.linkedProperties !== undefined) {
      data.linkedProperties = dto.linkedProperties;
    }
    if (dto.notes !== undefined) data.notes = dto.notes;

    return this.prisma.mortgage.update({
      where: { id },
      data,
      include: mortgageInclude,
    });
  }

  /**
   * Soft-delete a mortgage.
   */
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.mortgage.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: mortgageInclude,
    });
  }

  /**
   * Restore a soft-deleted mortgage.
   */
  async restore(id: string) {
    const mortgage = await this.prisma.mortgage.findFirst({
      where: { id, deletedAt: { not: null } },
      include: mortgageInclude,
    });

    if (!mortgage) {
      throw new NotFoundException(`Deleted mortgage with ID ${id} not found`);
    }

    return this.prisma.mortgage.update({
      where: { id },
      data: { deletedAt: null },
      include: mortgageInclude,
    });
  }

  /**
   * Validate that related entities exist when provided.
   */
  private async validateRelatedEntities(
    dto: CreateMortgageDto | UpdateMortgageDto,
  ) {
    if (dto.propertyId) {
      const property = await this.prisma.property.findFirst({
        where: { id: dto.propertyId, deletedAt: null },
      });
      if (!property) {
        throw new BadRequestException(
          `Property with ID ${dto.propertyId} not found`,
        );
      }
    }

    if (dto.bankAccountId) {
      const bankAccount = await this.prisma.bankAccount.findFirst({
        where: { id: dto.bankAccountId, deletedAt: null },
      });
      if (!bankAccount) {
        throw new BadRequestException(
          `Bank account with ID ${dto.bankAccountId} not found`,
        );
      }
    }

    if (dto.mortgageOwnerId) {
      const person = await this.prisma.person.findFirst({
        where: { id: dto.mortgageOwnerId, deletedAt: null },
      });
      if (!person) {
        throw new BadRequestException(
          `Person (mortgage owner) with ID ${dto.mortgageOwnerId} not found`,
        );
      }
    }

    if (dto.payerId) {
      const person = await this.prisma.person.findFirst({
        where: { id: dto.payerId, deletedAt: null },
      });
      if (!person) {
        throw new BadRequestException(
          `Person (payer) with ID ${dto.payerId} not found`,
        );
      }
    }

    if (dto.linkedProperties?.length) {
      for (const propId of dto.linkedProperties) {
        const property = await this.prisma.property.findFirst({
          where: { id: propId, deletedAt: null },
        });
        if (!property) {
          throw new BadRequestException(
            `Linked property with ID ${propId} not found`,
          );
        }
      }
    }
  }
}
