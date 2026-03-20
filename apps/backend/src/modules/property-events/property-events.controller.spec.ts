import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PropertyEventsController } from './property-events.controller';
import { PropertyEventsService } from './property-events.service';
import { PropertyEventType } from '../../firebase/types';
import { CreatePlanningProcessEventDto } from './dto/create-planning-process-event.dto';
import { CreatePropertyDamageEventDto } from './dto/create-property-damage-event.dto';
import { CreateExpenseEventDto } from './dto/create-expense-event.dto';
import { CreateRentalPaymentRequestEventDto } from './dto/create-rental-payment-request-event.dto';
import { UpdatePropertyEventDto } from './dto/update-property-event.dto';
import { NotFoundException } from '@nestjs/common';
import { ExpenseEventType } from '../../firebase/types';

const propertyId = '550e8400-e29b-41d4-a716-446655440001';
const eventId = '550e8400-e29b-41d4-a716-446655440010';

const mockPropertyEvent = {
  id: eventId,
  propertyId,
  eventType: PropertyEventType.PlanningProcessEvent,
  eventDate: new Date('2025-01-15T00:00:00.000Z'),
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
  createdAt: new Date('2025-02-27T10:00:00.000Z'),
  property: { id: propertyId, address: 'Test St' },
  rentalAgreement: null,
  linkedExpense: null,
};

describe('PropertyEventsController', () => {
  let app: INestApplication;
  let propertyEventsService: PropertyEventsService;

  const mockPropertyEventsService = {
    createPlanningProcess: jest.fn(),
    createPropertyDamage: jest.fn(),
    createExpense: jest.fn(),
    createRentalPaymentRequest: jest.fn(),
    findByProperty: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [PropertyEventsController],
      providers: [
        {
          provide: PropertyEventsService,
          useValue: mockPropertyEventsService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    propertyEventsService =
      moduleFixture.get<PropertyEventsService>(PropertyEventsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/properties/:propertyId/events/planning-process', () => {
    it('should create PlanningProcessEvent and return 201', async () => {
      const dto: CreatePlanningProcessEventDto = {
        eventDate: '2025-01-15',
        planningStage: 'Stage 1',
      };
      mockPropertyEventsService.createPlanningProcess.mockResolvedValue(
        mockPropertyEvent,
      );

      const response = await request(app.getHttpServer())
        .post(`/api/properties/${propertyId}/events/planning-process`)
        .send(dto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: eventId,
        propertyId,
        eventType: PropertyEventType.PlanningProcessEvent,
        planningStage: 'Stage 1',
      });
      expect(propertyEventsService.createPlanningProcess).toHaveBeenCalledWith(
        propertyId,
        expect.objectContaining({ eventDate: dto.eventDate }),
      );
    });

    it('should return 400 when eventDate is missing', async () => {
      await request(app.getHttpServer())
        .post(`/api/properties/${propertyId}/events/planning-process`)
        .send({ planningStage: 'Stage 1' })
        .expect(400);

      expect(propertyEventsService.createPlanningProcess).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/properties/:propertyId/events/property-damage', () => {
    it('should create PropertyDamageEvent and return 201', async () => {
      const dto: CreatePropertyDamageEventDto = {
        eventDate: '2025-01-15',
        damageType: 'Water damage',
        estimatedDamageCost: 5000,
      };
      mockPropertyEventsService.createPropertyDamage.mockResolvedValue({
        ...mockPropertyEvent,
        eventType: PropertyEventType.PropertyDamageEvent,
      });

      const response = await request(app.getHttpServer())
        .post(`/api/properties/${propertyId}/events/property-damage`)
        .send(dto)
        .expect(201);

      expect(response.body.eventType).toBe(
        PropertyEventType.PropertyDamageEvent,
      );
      expect(propertyEventsService.createPropertyDamage).toHaveBeenCalledWith(
        propertyId,
        expect.objectContaining(dto),
      );
    });
  });

  describe('POST /api/properties/:propertyId/events/expense', () => {
    it('should create ExpenseEvent and return 201', async () => {
      const dto: CreateExpenseEventDto = {
        eventDate: '2025-01-15',
        expenseType: ExpenseEventType.REPAIR,
        amount: 1500,
      };
      mockPropertyEventsService.createExpense.mockResolvedValue({
        ...mockPropertyEvent,
        eventType: PropertyEventType.ExpenseEvent,
      });

      const response = await request(app.getHttpServer())
        .post(`/api/properties/${propertyId}/events/expense`)
        .send(dto)
        .expect(201);

      expect(response.body.eventType).toBe(PropertyEventType.ExpenseEvent);
      expect(propertyEventsService.createExpense).toHaveBeenCalledWith(
        propertyId,
        expect.objectContaining(dto),
      );
    });

    it('should return 400 when expenseType is missing', async () => {
      await request(app.getHttpServer())
        .post(`/api/properties/${propertyId}/events/expense`)
        .send({
          eventDate: '2025-01-15',
          amount: 1500,
        })
        .expect(400);

      expect(propertyEventsService.createExpense).not.toHaveBeenCalled();
    });

    it('should return 400 when amount is zero', async () => {
      await request(app.getHttpServer())
        .post(`/api/properties/${propertyId}/events/expense`)
        .send({
          eventDate: '2025-01-15',
          expenseType: 'REPAIRS',
          amount: 0,
        })
        .expect(400);

      expect(propertyEventsService.createExpense).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/properties/:propertyId/events/rental-payment-request', () => {
    it('should create RentalPaymentRequestEvent and return 201', async () => {
      const rentalAgreementId = '550e8400-e29b-41d4-a716-446655440002';
      const dto: CreateRentalPaymentRequestEventDto = {
        eventDate: '2025-01-15',
        rentalAgreementId,
        month: 1,
        year: 2025,
        amountDue: 5000,
      };
      mockPropertyEventsService.createRentalPaymentRequest.mockResolvedValue({
        ...mockPropertyEvent,
        eventType: PropertyEventType.RentalPaymentRequestEvent,
      });

      const response = await request(app.getHttpServer())
        .post(`/api/properties/${propertyId}/events/rental-payment-request`)
        .send(dto)
        .expect(201);

      expect(response.body.eventType).toBe(
        PropertyEventType.RentalPaymentRequestEvent,
      );
      expect(
        propertyEventsService.createRentalPaymentRequest,
      ).toHaveBeenCalledWith(propertyId, expect.objectContaining(dto));
    });

    it('should return 400 when month is out of range', async () => {
      await request(app.getHttpServer())
        .post(`/api/properties/${propertyId}/events/rental-payment-request`)
        .send({
          eventDate: '2025-01-15',
          rentalAgreementId: '550e8400-e29b-41d4-a716-446655440002',
          month: 13,
          year: 2025,
          amountDue: 5000,
        })
        .expect(400);

      expect(
        propertyEventsService.createRentalPaymentRequest,
      ).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/properties/:propertyId/events', () => {
    it('should return paginated list', async () => {
      mockPropertyEventsService.findByProperty.mockResolvedValue({
        data: [mockPropertyEvent],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      const response = await request(app.getHttpServer())
        .get(`/api/properties/${propertyId}/events`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.data).toHaveLength(1);
      expect(propertyEventsService.findByProperty).toHaveBeenCalledWith(
        propertyId,
        expect.any(Object),
      );
    });

    it('should pass eventType filter to service', async () => {
      mockPropertyEventsService.findByProperty.mockResolvedValue({
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });

      await request(app.getHttpServer())
        .get(`/api/properties/${propertyId}/events`)
        .query({ eventType: 'ExpenseEvent', page: 1, limit: 10 })
        .expect(200);

      expect(propertyEventsService.findByProperty).toHaveBeenCalledWith(
        propertyId,
        expect.objectContaining({
          eventType: 'ExpenseEvent',
          page: 1,
          limit: 10,
        }),
      );
    });
  });

  describe('GET /api/properties/:propertyId/events/:id', () => {
    it('should return event when found', async () => {
      mockPropertyEventsService.findOne.mockResolvedValue(mockPropertyEvent);

      const response = await request(app.getHttpServer())
        .get(`/api/properties/${propertyId}/events/${eventId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: eventId,
        propertyId,
        eventType: PropertyEventType.PlanningProcessEvent,
      });
      expect(propertyEventsService.findOne).toHaveBeenCalledWith(
        propertyId,
        eventId,
      );
    });

    it('should return 404 when event not found', async () => {
      mockPropertyEventsService.findOne.mockRejectedValue(
        new NotFoundException('Property event with ID xyz not found'),
      );

      await request(app.getHttpServer())
        .get(`/api/properties/${propertyId}/events/non-existent`)
        .expect(404);
    });
  });

  describe('PATCH /api/properties/:propertyId/events/:id', () => {
    it('should update event and return 200', async () => {
      const dto: UpdatePropertyEventDto = {
        description: 'Updated description',
      };
      const updated = { ...mockPropertyEvent, description: dto.description };
      mockPropertyEventsService.update.mockResolvedValue(updated);

      const response = await request(app.getHttpServer())
        .patch(`/api/properties/${propertyId}/events/${eventId}`)
        .send(dto)
        .expect(200);

      expect(response.body.description).toBe('Updated description');
      expect(propertyEventsService.update).toHaveBeenCalledWith(
        propertyId,
        eventId,
        expect.objectContaining(dto),
      );
    });
  });

  describe('DELETE /api/properties/:propertyId/events/:id', () => {
    it('should delete event and return 204', async () => {
      mockPropertyEventsService.remove.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete(`/api/properties/${propertyId}/events/${eventId}`)
        .expect(204);

      expect(propertyEventsService.remove).toHaveBeenCalledWith(
        propertyId,
        eventId,
      );
    });

    it('should return 404 when event not found', async () => {
      mockPropertyEventsService.remove.mockRejectedValue(
        new NotFoundException('Property event not found'),
      );

      await request(app.getHttpServer())
        .delete(`/api/properties/${propertyId}/events/non-existent`)
        .expect(404);
    });
  });
});
