import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PropertyEventsService } from './property-events.service';
import { PrismaService } from '../../database/prisma.service';
import { PropertyEventType } from '@prisma/client';
import { CreatePlanningProcessEventDto } from './dto/create-planning-process-event.dto';
import { CreatePropertyDamageEventDto } from './dto/create-property-damage-event.dto';
import { CreateExpenseEventDto } from './dto/create-expense-event.dto';
import { CreateRentalPaymentRequestEventDto } from './dto/create-rental-payment-request-event.dto';
import { UpdatePropertyEventDto } from './dto/update-property-event.dto';
import { QueryPropertyEventDto } from './dto/query-property-event.dto';
import { ExpenseEventType } from '@prisma/client';

const propertyId = '550e8400-e29b-41d4-a716-446655440001';
const eventId = '550e8400-e29b-41d4-a716-446655440010';

const mockPropertyEvent = {
  id: eventId,
  propertyId,
  eventType: PropertyEventType.PlanningProcessEvent,
  eventDate: new Date('2025-01-15'),
  description: 'Test event',
  estimatedValue: null,
  estimatedRent: null,
  planningStage: 'Stage 1',
  developerName: 'Dev Co',
  projectedSizeAfter: '120 sqm',
  damageType: null,
  estimatedDamageCost: null,
  expenseId: null,
  expenseType: null,
  amount: null,
  paidToAccountId: null,
  affectsPropertyValue: null,
  rentalAgreementId: null,
  month: null,
  year: null,
  amountDue: null,
  paymentDate: null,
  paymentStatus: null,
  createdAt: new Date(),
  property: { id: propertyId, address: 'Test St' },
  rentalAgreement: null,
  linkedExpense: null,
};

describe('PropertyEventsService', () => {
  let service: PropertyEventsService;
  let prisma: PrismaService;

  const mockPrisma = {
    property: { findUnique: jest.fn() },
    propertyEvent: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    bankAccount: { findUnique: jest.fn() },
    rentalAgreement: { findFirst: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertyEventsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PropertyEventsService>(PropertyEventsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPlanningProcess', () => {
    it('should create PlanningProcessEvent with eventType set in service', async () => {
      const dto: CreatePlanningProcessEventDto = {
        eventDate: '2025-01-15',
        planningStage: 'Stage 1',
        developerName: 'Dev Co',
      };

      mockPrisma.property.findUnique.mockResolvedValue({ id: propertyId });
      mockPrisma.propertyEvent.create.mockResolvedValue(mockPropertyEvent);

      const result = await service.createPlanningProcess(propertyId, dto);

      expect(mockPrisma.propertyEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventType: PropertyEventType.PlanningProcessEvent,
          eventDate: new Date(dto.eventDate),
          planningStage: dto.planningStage,
          developerName: dto.developerName,
        }),
        include: expect.any(Object),
      });
      expect(result).toEqual(mockPropertyEvent);
    });

    it('should throw NotFoundException when property not found', async () => {
      mockPrisma.property.findUnique.mockResolvedValue(null);

      await expect(
        service.createPlanningProcess(propertyId, {
          eventDate: '2025-01-15',
        }),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrisma.propertyEvent.create).not.toHaveBeenCalled();
    });
  });

  describe('createPropertyDamage', () => {
    it('should create PropertyDamageEvent with eventType set in service', async () => {
      const dto: CreatePropertyDamageEventDto = {
        eventDate: '2025-01-15',
        damageType: 'Water damage',
        estimatedDamageCost: 5000,
      };

      mockPrisma.property.findUnique.mockResolvedValue({ id: propertyId });
      mockPrisma.propertyEvent.create.mockResolvedValue({
        ...mockPropertyEvent,
        eventType: PropertyEventType.PropertyDamageEvent,
      });

      const result = await service.createPropertyDamage(propertyId, dto);

      expect(mockPrisma.propertyEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventType: PropertyEventType.PropertyDamageEvent,
          damageType: dto.damageType,
          estimatedDamageCost: dto.estimatedDamageCost,
        }),
        include: expect.any(Object),
      });
      expect(result.eventType).toBe(PropertyEventType.PropertyDamageEvent);
    });

    it('should link to expense when expenseId provided', async () => {
      const expenseId = '550e8400-e29b-41d4-a716-446655440099';
      const dto: CreatePropertyDamageEventDto = {
        eventDate: '2025-01-15',
        expenseId,
      };

      mockPrisma.property.findUnique.mockResolvedValue({ id: propertyId });
      mockPrisma.propertyEvent.findFirst.mockResolvedValue({
        id: expenseId,
        eventType: PropertyEventType.ExpenseEvent,
      });
      mockPrisma.propertyEvent.create.mockResolvedValue(mockPropertyEvent);

      await service.createPropertyDamage(propertyId, dto);

      expect(mockPrisma.propertyEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          linkedExpense: { connect: { id: expenseId } },
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('createExpense', () => {
    it('should create ExpenseEvent with eventType set in service', async () => {
      const dto: CreateExpenseEventDto = {
        eventDate: '2025-01-15',
        expenseType: ExpenseEventType.REPAIRS,
        amount: 1500,
      };

      mockPrisma.property.findUnique.mockResolvedValue({ id: propertyId });
      mockPrisma.propertyEvent.create.mockResolvedValue({
        ...mockPropertyEvent,
        eventType: PropertyEventType.ExpenseEvent,
      });

      const result = await service.createExpense(propertyId, dto);

      expect(mockPrisma.propertyEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventType: PropertyEventType.ExpenseEvent,
          expenseType: dto.expenseType,
          amount: dto.amount,
        }),
        include: expect.any(Object),
      });
      expect(result.eventType).toBe(PropertyEventType.ExpenseEvent);
    });
  });

  describe('createRentalPaymentRequest', () => {
    it('should create RentalPaymentRequestEvent with eventType set in service', async () => {
      const rentalAgreementId = '550e8400-e29b-41d4-a716-446655440002';
      const dto: CreateRentalPaymentRequestEventDto = {
        eventDate: '2025-01-15',
        rentalAgreementId,
        month: 1,
        year: 2025,
        amountDue: 5000,
      };

      mockPrisma.property.findUnique.mockResolvedValue({ id: propertyId });
      mockPrisma.rentalAgreement.findFirst.mockResolvedValue({
        id: rentalAgreementId,
        propertyId,
      });
      mockPrisma.propertyEvent.create.mockResolvedValue({
        ...mockPropertyEvent,
        eventType: PropertyEventType.RentalPaymentRequestEvent,
      });

      const result = await service.createRentalPaymentRequest(propertyId, dto);

      expect(mockPrisma.propertyEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventType: PropertyEventType.RentalPaymentRequestEvent,
          month: dto.month,
          year: dto.year,
          amountDue: dto.amountDue,
          paymentStatus: 'PENDING',
        }),
        include: expect.any(Object),
      });
      expect(result.eventType).toBe(PropertyEventType.RentalPaymentRequestEvent);
    });

    it('should throw BadRequestException when rental agreement not found', async () => {
      mockPrisma.property.findUnique.mockResolvedValue({ id: propertyId });
      mockPrisma.rentalAgreement.findFirst.mockResolvedValue(null);

      await expect(
        service.createRentalPaymentRequest(propertyId, {
          eventDate: '2025-01-15',
          rentalAgreementId: 'non-existent',
          month: 1,
          year: 2025,
          amountDue: 5000,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrisma.propertyEvent.create).not.toHaveBeenCalled();
    });
  });

  describe('findByProperty', () => {
    it('should return paginated events', async () => {
      mockPrisma.property.findUnique.mockResolvedValue({ id: propertyId });
      mockPrisma.propertyEvent.findMany.mockResolvedValue([mockPropertyEvent]);
      mockPrisma.propertyEvent.count.mockResolvedValue(1);

      const query: QueryPropertyEventDto = { page: 1, limit: 10 };
      const result = await service.findByProperty(propertyId, query);

      expect(result).toEqual({
        data: [mockPropertyEvent],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });
      expect(mockPrisma.propertyEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { propertyId },
          skip: 0,
          take: 10,
        }),
      );
    });

    it('should filter by eventType when provided', async () => {
      mockPrisma.property.findUnique.mockResolvedValue({ id: propertyId });
      mockPrisma.propertyEvent.findMany.mockResolvedValue([]);
      mockPrisma.propertyEvent.count.mockResolvedValue(0);

      await service.findByProperty(propertyId, {
        eventType: PropertyEventType.ExpenseEvent,
      });

      expect(mockPrisma.propertyEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            propertyId,
            eventType: PropertyEventType.ExpenseEvent,
          },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return event when found', async () => {
      mockPrisma.propertyEvent.findFirst.mockResolvedValue(mockPropertyEvent);

      const result = await service.findOne(propertyId, eventId);

      expect(result).toEqual(mockPropertyEvent);
      expect(mockPrisma.propertyEvent.findFirst).toHaveBeenCalledWith({
        where: { id: eventId, propertyId },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.propertyEvent.findFirst.mockResolvedValue(null);

      await expect(service.findOne(propertyId, 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(propertyId, 'non-existent')).rejects.toThrow(
        /not found/,
      );
    });
  });

  describe('update', () => {
    it('should update event and preserve eventType', async () => {
      const dto: UpdatePropertyEventDto = {
        description: 'Updated description',
      };
      const updated = { ...mockPropertyEvent, ...dto };

      mockPrisma.propertyEvent.findFirst.mockResolvedValue(mockPropertyEvent);
      mockPrisma.propertyEvent.update.mockResolvedValue(updated);

      const result = await service.update(propertyId, eventId, dto);

      expect(mockPrisma.propertyEvent.update).toHaveBeenCalledWith({
        where: { id: eventId },
        data: expect.objectContaining({ description: dto.description }),
        include: expect.any(Object),
      });
      expect(result.description).toBe(dto.description);
    });

    it('should throw NotFoundException when event not found', async () => {
      mockPrisma.propertyEvent.findFirst.mockResolvedValue(null);

      await expect(
        service.update(propertyId, 'non-existent', { description: 'Test' }),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrisma.propertyEvent.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete event', async () => {
      mockPrisma.propertyEvent.findFirst.mockResolvedValue(mockPropertyEvent);
      mockPrisma.propertyEvent.delete.mockResolvedValue(mockPropertyEvent);

      const result = await service.remove(propertyId, eventId);

      expect(mockPrisma.propertyEvent.delete).toHaveBeenCalledWith({
        where: { id: eventId },
      });
      expect(result).toEqual(mockPropertyEvent);
    });

    it('should throw NotFoundException when event not found', async () => {
      mockPrisma.propertyEvent.findFirst.mockResolvedValue(null);

      await expect(service.remove(propertyId, 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.propertyEvent.delete).not.toHaveBeenCalled();
    });
  });
});
