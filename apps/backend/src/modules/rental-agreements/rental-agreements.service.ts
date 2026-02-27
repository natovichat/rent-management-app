import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateRentalAgreementDto } from './dto/create-rental-agreement.dto';
import { UpdateRentalAgreementDto } from './dto/update-rental-agreement.dto';
import { QueryRentalAgreementDto } from './dto/query-rental-agreement.dto';
import { Prisma } from '@prisma/client';

const rentalAgreementInclude = {
  property: true,
  tenant: true,
} as const;

/**
 * Service for managing rental agreements.
 * Handles CRUD operations with validation of related entities.
 */
@Injectable()
export class RentalAgreementsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new rental agreement.
   * Validates that property and tenant (Person) exist, endDate after startDate, monthlyRent > 0.
   */
  async create(dto: CreateRentalAgreementDto) {
    await this.validateCreateDto(dto);

    const data: Prisma.RentalAgreementCreateInput = {
      property: { connect: { id: dto.propertyId } },
      tenant: { connect: { id: dto.tenantId } },
      monthlyRent: dto.monthlyRent,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      status: dto.status ?? 'FUTURE',
      hasExtensionOption: dto.hasExtensionOption ?? false,
    };

    if (dto.extensionUntilDate) {
      data.extensionUntilDate = new Date(dto.extensionUntilDate);
    }
    if (dto.extensionMonthlyRent != null) {
      data.extensionMonthlyRent = dto.extensionMonthlyRent;
    }
    if (dto.notes !== undefined) {
      data.notes = dto.notes;
    }

    return this.prisma.rentalAgreement.create({
      data,
      include: rentalAgreementInclude,
    });
  }

  /**
   * Find all rental agreements with pagination and filters.
   */
  async findAll(query: QueryRentalAgreementDto) {
    const { page = 1, limit = 20, status, propertyId, tenantId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.RentalAgreementWhereInput = {};

    if (status) {
      where.status = status;
    }
    if (propertyId) {
      where.propertyId = propertyId;
    }
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const [data, total] = await Promise.all([
      this.prisma.rentalAgreement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: rentalAgreementInclude,
      }),
      this.prisma.rentalAgreement.count({ where }),
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
   * Find a rental agreement by ID with property and tenant.
   */
  async findOne(id: string) {
    const agreement = await this.prisma.rentalAgreement.findUnique({
      where: { id },
      include: rentalAgreementInclude,
    });

    if (!agreement) {
      throw new NotFoundException(
        `Rental agreement with ID ${id} not found`,
      );
    }

    return agreement;
  }

  /**
   * Find rental agreements by property ID.
   */
  async findByProperty(propertyId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException(
        `Property with ID ${propertyId} not found`,
      );
    }

    return this.prisma.rentalAgreement.findMany({
      where: { propertyId },
      orderBy: { createdAt: 'desc' },
      include: rentalAgreementInclude,
    });
  }

  /**
   * Find rental agreements by tenant (Person) ID.
   */
  async findByTenant(tenantId: string) {
    const person = await this.prisma.person.findUnique({
      where: { id: tenantId },
    });

    if (!person) {
      throw new NotFoundException(
        `Person (tenant) with ID ${tenantId} not found`,
      );
    }

    return this.prisma.rentalAgreement.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: rentalAgreementInclude,
    });
  }

  /**
   * Update a rental agreement.
   */
  async update(id: string, dto: UpdateRentalAgreementDto) {
    await this.findOne(id);
    await this.validateUpdateDto(dto);

    const data: Prisma.RentalAgreementUpdateInput = {};

    if (dto.propertyId !== undefined) {
      data.property = { connect: { id: dto.propertyId } };
    }
    if (dto.tenantId !== undefined) {
      data.tenant = { connect: { id: dto.tenantId } };
    }
    if (dto.monthlyRent !== undefined) data.monthlyRent = dto.monthlyRent;
    if (dto.startDate !== undefined) {
      data.startDate = new Date(dto.startDate);
    }
    if (dto.endDate !== undefined) {
      data.endDate = new Date(dto.endDate);
    }
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.hasExtensionOption !== undefined) {
      data.hasExtensionOption = dto.hasExtensionOption;
    }
    if (dto.extensionUntilDate !== undefined) {
      data.extensionUntilDate = dto.extensionUntilDate
        ? new Date(dto.extensionUntilDate)
        : null;
    }
    if (dto.extensionMonthlyRent !== undefined) {
      data.extensionMonthlyRent = dto.extensionMonthlyRent;
    }
    if (dto.notes !== undefined) data.notes = dto.notes;

    return this.prisma.rentalAgreement.update({
      where: { id },
      data,
      include: rentalAgreementInclude,
    });
  }

  /**
   * Delete a rental agreement.
   */
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.rentalAgreement.delete({
      where: { id },
    });
  }

  /**
   * Validate create DTO: property and tenant exist, endDate after startDate, monthlyRent > 0.
   */
  private async validateCreateDto(dto: CreateRentalAgreementDto) {
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
    });
    if (!property) {
      throw new BadRequestException(
        `Property with ID ${dto.propertyId} not found`,
      );
    }

    const person = await this.prisma.person.findUnique({
      where: { id: dto.tenantId },
    });
    if (!person) {
      throw new BadRequestException(
        `Person (tenant) with ID ${dto.tenantId} not found`,
      );
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    if (endDate <= startDate) {
      throw new BadRequestException(
        'endDate must be after startDate',
      );
    }

    if (dto.monthlyRent <= 0) {
      throw new BadRequestException(
        'monthlyRent must be greater than 0',
      );
    }
  }

  /**
   * Validate update DTO: related entities exist, date consistency when both provided.
   */
  private async validateUpdateDto(dto: UpdateRentalAgreementDto) {
    if (dto.propertyId) {
      const property = await this.prisma.property.findUnique({
        where: { id: dto.propertyId },
      });
      if (!property) {
        throw new BadRequestException(
          `Property with ID ${dto.propertyId} not found`,
        );
      }
    }

    if (dto.tenantId) {
      const person = await this.prisma.person.findUnique({
        where: { id: dto.tenantId },
      });
      if (!person) {
        throw new BadRequestException(
          `Person (tenant) with ID ${dto.tenantId} not found`,
        );
      }
    }

    if (dto.startDate != null && dto.endDate != null) {
      const startDate = new Date(dto.startDate);
      const endDate = new Date(dto.endDate);
      if (endDate <= startDate) {
        throw new BadRequestException(
          'endDate must be after startDate',
        );
      }
    }

    if (dto.monthlyRent != null && dto.monthlyRent <= 0) {
      throw new BadRequestException(
        'monthlyRent must be greater than 0',
      );
    }
  }
}
