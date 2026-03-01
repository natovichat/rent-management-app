import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PropertyEventType } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { CreatePlanningProcessEventDto } from './dto/create-planning-process-event.dto';
import { CreatePropertyDamageEventDto } from './dto/create-property-damage-event.dto';
import { CreateExpenseEventDto } from './dto/create-expense-event.dto';
import { CreateRentalPaymentRequestEventDto } from './dto/create-rental-payment-request-event.dto';
import { UpdatePropertyEventDto } from './dto/update-property-event.dto';
import { QueryPropertyEventDto } from './dto/query-property-event.dto';

const propertyEventInclude = {
  property: true,
  rentalAgreement: true,
  paidToAccount: true,
  linkedExpense: true,
} as const;

/**
 * Service for managing property events (STI with 4 subtypes).
 * Sets eventType discriminator in service methods, not in DTOs.
 */
@Injectable()
export class PropertyEventsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a PlanningProcessEvent.
   */
  async createPlanningProcess(
    propertyId: string,
    dto: CreatePlanningProcessEventDto,
  ) {
    await this.ensurePropertyExists(propertyId);

    const data: Prisma.PropertyEventCreateInput = {
      property: { connect: { id: propertyId } },
      eventType: PropertyEventType.PlanningProcessEvent,
      eventDate: new Date(dto.eventDate),
      planningStage: dto.planningStage,
      developerName: dto.developerName,
      projectedSizeAfter: dto.projectedSizeAfter,
      description: dto.description,
    };

    return this.prisma.propertyEvent.create({
      data,
      include: propertyEventInclude,
    });
  }

  /**
   * Create a PropertyDamageEvent.
   */
  async createPropertyDamage(
    propertyId: string,
    dto: CreatePropertyDamageEventDto,
  ) {
    await this.ensurePropertyExists(propertyId);

    const data: Prisma.PropertyEventCreateInput = {
      property: { connect: { id: propertyId } },
      eventType: PropertyEventType.PropertyDamageEvent,
      eventDate: new Date(dto.eventDate),
      damageType: dto.damageType,
      estimatedDamageCost: dto.estimatedDamageCost,
      description: dto.description,
    };

    if (dto.expenseId) {
      await this.ensureExpenseEventExists(dto.expenseId, propertyId);
      data.linkedExpense = { connect: { id: dto.expenseId } };
    }

    return this.prisma.propertyEvent.create({
      data,
      include: propertyEventInclude,
    });
  }

  /**
   * Create an ExpenseEvent.
   */
  async createExpense(propertyId: string, dto: CreateExpenseEventDto) {
    await this.ensurePropertyExists(propertyId);

    const data: Prisma.PropertyEventCreateInput = {
      property: { connect: { id: propertyId } },
      eventType: PropertyEventType.ExpenseEvent,
      eventDate: new Date(dto.eventDate),
      expenseType: dto.expenseType,
      amount: dto.amount,
      affectsPropertyValue: dto.affectsPropertyValue ?? false,
      description: dto.description,
    };

    if (dto.paidToAccountId) {
      await this.ensureBankAccountExists(dto.paidToAccountId);
      data.paidToAccount = { connect: { id: dto.paidToAccountId } };
    }

    return this.prisma.propertyEvent.create({
      data,
      include: propertyEventInclude,
    });
  }

  /**
   * Create a RentalPaymentRequestEvent.
   */
  async createRentalPaymentRequest(
    propertyId: string,
    dto: CreateRentalPaymentRequestEventDto,
  ) {
    await this.ensurePropertyExists(propertyId);
    await this.ensureRentalAgreementExists(dto.rentalAgreementId, propertyId);

    const data: Prisma.PropertyEventCreateInput = {
      property: { connect: { id: propertyId } },
      eventType: PropertyEventType.RentalPaymentRequestEvent,
      eventDate: new Date(dto.eventDate),
      rentalAgreement: { connect: { id: dto.rentalAgreementId } },
      month: dto.month,
      year: dto.year,
      amountDue: dto.amountDue,
      paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : undefined,
      paymentStatus: dto.paymentStatus ?? 'PENDING',
      description: dto.description,
    };

    return this.prisma.propertyEvent.create({
      data,
      include: propertyEventInclude,
    });
  }

  /**
   * Find events by property with pagination and eventType filter.
   */
  async findByProperty(propertyId: string, query: QueryPropertyEventDto) {
    await this.ensurePropertyExists(propertyId);

    const { page = 1, limit = 10, eventType, includeDeleted } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PropertyEventWhereInput = { propertyId };

    if (!includeDeleted) {
      where.deletedAt = null;
    }

    if (eventType) {
      where.eventType = eventType;
    }

    const [data, total] = await Promise.all([
      this.prisma.propertyEvent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { eventDate: 'desc' },
        include: propertyEventInclude,
      }),
      this.prisma.propertyEvent.count({ where }),
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
   * Find one event by property and event ID.
   */
  async findOne(propertyId: string, eventId: string, includeDeleted = false) {
    const event = await this.prisma.propertyEvent.findFirst({
      where: {
        id: eventId,
        propertyId,
        ...(!includeDeleted && { deletedAt: null }),
      },
      include: propertyEventInclude,
    });

    if (!event) {
      throw new NotFoundException(
        `Property event with ID ${eventId} not found for property ${propertyId}`,
      );
    }

    return event;
  }

  /**
   * Partial update. Preserves eventType.
   */
  async update(
    propertyId: string,
    eventId: string,
    dto: UpdatePropertyEventDto,
  ) {
    const existing = await this.findOne(propertyId, eventId);

    const data: Prisma.PropertyEventUpdateInput = {};

    if (dto.eventDate !== undefined) {
      data.eventDate = new Date(dto.eventDate);
    }
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.estimatedValue !== undefined)
      data.estimatedValue = dto.estimatedValue;
    if (dto.estimatedRent !== undefined) data.estimatedRent = dto.estimatedRent;

    // PlanningProcessEvent
    if (dto.planningStage !== undefined)
      data.planningStage = dto.planningStage;
    if (dto.developerName !== undefined)
      data.developerName = dto.developerName;
    if (dto.projectedSizeAfter !== undefined)
      data.projectedSizeAfter = dto.projectedSizeAfter;

    // PropertyDamageEvent
    if (dto.damageType !== undefined) data.damageType = dto.damageType;
    if (dto.estimatedDamageCost !== undefined)
      data.estimatedDamageCost = dto.estimatedDamageCost;
    if (dto.expenseId !== undefined) {
      if (dto.expenseId === null || dto.expenseId === '') {
        data.linkedExpense = { disconnect: true };
      } else {
        await this.ensureExpenseEventExists(dto.expenseId, propertyId);
        data.linkedExpense = { connect: { id: dto.expenseId } };
      }
    }

    // ExpenseEvent
    if (dto.expenseType !== undefined) data.expenseType = dto.expenseType;
    if (dto.amount !== undefined) data.amount = dto.amount;
    if (dto.paidToAccountId !== undefined) {
      if (dto.paidToAccountId === null || dto.paidToAccountId === '') {
        data.paidToAccount = { disconnect: true };
      } else {
        await this.ensureBankAccountExists(dto.paidToAccountId);
        data.paidToAccount = { connect: { id: dto.paidToAccountId } };
      }
    }
    if (dto.affectsPropertyValue !== undefined)
      data.affectsPropertyValue = dto.affectsPropertyValue;

    // RentalPaymentRequestEvent
    if (dto.rentalAgreementId !== undefined) {
      if (dto.rentalAgreementId === null || dto.rentalAgreementId === '') {
        data.rentalAgreement = { disconnect: true };
      } else {
        await this.ensureRentalAgreementExists(
          dto.rentalAgreementId,
          propertyId,
        );
        data.rentalAgreement = { connect: { id: dto.rentalAgreementId } };
      }
    }
    if (dto.month !== undefined) data.month = dto.month;
    if (dto.year !== undefined) data.year = dto.year;
    if (dto.amountDue !== undefined) data.amountDue = dto.amountDue;
    if (dto.paymentDate !== undefined) {
      data.paymentDate = dto.paymentDate
        ? new Date(dto.paymentDate)
        : null;
    }
    if (dto.paymentStatus !== undefined)
      data.paymentStatus = dto.paymentStatus;

    return this.prisma.propertyEvent.update({
      where: { id: eventId },
      data,
      include: propertyEventInclude,
    });
  }

  /**
   * Soft-delete a property event.
   */
  async remove(propertyId: string, eventId: string) {
    await this.findOne(propertyId, eventId);

    return this.prisma.propertyEvent.update({
      where: { id: eventId },
      data: { deletedAt: new Date() },
      include: propertyEventInclude,
    });
  }

  /**
   * Restore a soft-deleted property event.
   */
  async restore(propertyId: string, eventId: string) {
    const event = await this.prisma.propertyEvent.findFirst({
      where: { id: eventId, propertyId, deletedAt: { not: null } },
      include: propertyEventInclude,
    });

    if (!event) {
      throw new NotFoundException(
        `Deleted property event with ID ${eventId} not found for property ${propertyId}`,
      );
    }

    return this.prisma.propertyEvent.update({
      where: { id: eventId },
      data: { deletedAt: null },
      include: propertyEventInclude,
    });
  }

  private async ensurePropertyExists(propertyId: string) {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, deletedAt: null },
    });
    if (!property) {
      throw new NotFoundException(
        `Property with ID ${propertyId} not found`,
      );
    }
  }

  private async ensureExpenseEventExists(
    expenseId: string,
    propertyId: string,
  ) {
    const expense = await this.prisma.propertyEvent.findFirst({
      where: {
        id: expenseId,
        propertyId,
        eventType: PropertyEventType.ExpenseEvent,
        deletedAt: null,
      },
    });
    if (!expense) {
      throw new BadRequestException(
        `ExpenseEvent with ID ${expenseId} not found for this property`,
      );
    }
  }

  private async ensureBankAccountExists(accountId: string) {
    const account = await this.prisma.bankAccount.findFirst({
      where: { id: accountId, deletedAt: null },
    });
    if (!account) {
      throw new BadRequestException(
        `Bank account with ID ${accountId} not found`,
      );
    }
  }

  private async ensureRentalAgreementExists(
    rentalAgreementId: string,
    propertyId: string,
  ) {
    const agreement = await this.prisma.rentalAgreement.findFirst({
      where: { id: rentalAgreementId, propertyId, deletedAt: null },
    });
    if (!agreement) {
      throw new BadRequestException(
        `Rental agreement with ID ${rentalAgreementId} not found for this property`,
      );
    }
  }
}
