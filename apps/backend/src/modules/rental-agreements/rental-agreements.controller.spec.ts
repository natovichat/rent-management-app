import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { RentalAgreementsController } from './rental-agreements.controller';
import { RentalAgreementsService } from './rental-agreements.service';
import { CreateRentalAgreementDto } from './dto/create-rental-agreement.dto';
import { UpdateRentalAgreementDto } from './dto/update-rental-agreement.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { RentalAgreementStatus } from '@prisma/client';

describe('RentalAgreementsController', () => {
  let app: INestApplication;
  let rentalAgreementsService: RentalAgreementsService;

  const mockRentalAgreement = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    propertyId: '550e8400-e29b-41d4-a716-446655440001',
    tenantId: '550e8400-e29b-41d4-a716-446655440002',
    monthlyRent: 5000,
    startDate: new Date('2025-01-01T00:00:00.000Z'),
    endDate: new Date('2026-12-31T00:00:00.000Z'),
    status: RentalAgreementStatus.ACTIVE,
    hasExtensionOption: false,
    extensionUntilDate: null,
    extensionMonthlyRent: null,
    notes: 'Test agreement',
    createdAt: new Date('2025-02-27T10:00:00.000Z'),
    updatedAt: new Date('2025-02-27T10:00:00.000Z'),
    property: { id: '550e8400-e29b-41d4-a716-446655440001', address: 'Test St' },
    tenant: { id: '550e8400-e29b-41d4-a716-446655440002', name: 'John' },
  };

  const mockRentalAgreementsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByProperty: jest.fn(),
    findByTenant: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [RentalAgreementsController],
      providers: [
        {
          provide: RentalAgreementsService,
          useValue: mockRentalAgreementsService,
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
    rentalAgreementsService =
      moduleFixture.get<RentalAgreementsService>(RentalAgreementsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/rental-agreements', () => {
    it('should create a rental agreement and return 201', async () => {
      const dto: CreateRentalAgreementDto = {
        propertyId: '550e8400-e29b-41d4-a716-446655440001',
        tenantId: '550e8400-e29b-41d4-a716-446655440002',
        monthlyRent: 5000,
        startDate: '2025-01-01',
        endDate: '2026-12-31',
      };
      mockRentalAgreementsService.create.mockResolvedValue(mockRentalAgreement);

      const response = await request(app.getHttpServer())
        .post('/api/rental-agreements')
        .send(dto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: mockRentalAgreement.id,
        propertyId: mockRentalAgreement.propertyId,
        tenantId: mockRentalAgreement.tenantId,
        monthlyRent: Number(mockRentalAgreement.monthlyRent),
      });
      expect(rentalAgreementsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          propertyId: dto.propertyId,
          tenantId: dto.tenantId,
          monthlyRent: dto.monthlyRent,
          startDate: dto.startDate,
          endDate: dto.endDate,
        }),
      );
    });

    it('should return 400 when propertyId is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/rental-agreements')
        .send({
          tenantId: '550e8400-e29b-41d4-a716-446655440002',
          monthlyRent: 5000,
          startDate: '2025-01-01',
          endDate: '2026-12-31',
        })
        .expect(400);

      expect(rentalAgreementsService.create).not.toHaveBeenCalled();
    });

    it('should return 400 when tenantId is invalid UUID', async () => {
      await request(app.getHttpServer())
        .post('/api/rental-agreements')
        .send({
          propertyId: '550e8400-e29b-41d4-a716-446655440001',
          tenantId: 'invalid-uuid',
          monthlyRent: 5000,
          startDate: '2025-01-01',
          endDate: '2026-12-31',
        })
        .expect(400);

      expect(rentalAgreementsService.create).not.toHaveBeenCalled();
    });

    it('should return 400 when monthlyRent is zero', async () => {
      await request(app.getHttpServer())
        .post('/api/rental-agreements')
        .send({
          propertyId: '550e8400-e29b-41d4-a716-446655440001',
          tenantId: '550e8400-e29b-41d4-a716-446655440002',
          monthlyRent: 0,
          startDate: '2025-01-01',
          endDate: '2026-12-31',
        })
        .expect(400);

      expect(rentalAgreementsService.create).not.toHaveBeenCalled();
    });

    it('should return 400 when related entity not found', async () => {
      mockRentalAgreementsService.create.mockRejectedValue(
        new BadRequestException(
          'Person (tenant) with ID xyz not found',
        ),
      );

      await request(app.getHttpServer())
        .post('/api/rental-agreements')
        .send({
          propertyId: '550e8400-e29b-41d4-a716-446655440001',
          tenantId: '550e8400-e29b-41d4-a716-446655440002',
          monthlyRent: 5000,
          startDate: '2025-01-01',
          endDate: '2026-12-31',
        })
        .expect(400);
    });
  });

  describe('GET /api/rental-agreements', () => {
    it('should return paginated list', async () => {
      mockRentalAgreementsService.findAll.mockResolvedValue({
        data: [mockRentalAgreement],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });

      const response = await request(app.getHttpServer())
        .get('/api/rental-agreements')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      });
      expect(rentalAgreementsService.findAll).toHaveBeenCalled();
    });

    it('should pass query params to service', async () => {
      mockRentalAgreementsService.findAll.mockResolvedValue({
        data: [],
        meta: { page: 2, limit: 10, total: 0, totalPages: 0 },
      });

      await request(app.getHttpServer())
        .get('/api/rental-agreements')
        .query({
          page: 2,
          limit: 10,
          status: 'ACTIVE',
          propertyId: '550e8400-e29b-41d4-a716-446655440001',
          tenantId: '550e8400-e29b-41d4-a716-446655440002',
        })
        .expect(200);

      expect(rentalAgreementsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 10,
          status: 'ACTIVE',
          propertyId: '550e8400-e29b-41d4-a716-446655440001',
          tenantId: '550e8400-e29b-41d4-a716-446655440002',
        }),
      );
    });
  });

  describe('GET /api/rental-agreements/:id', () => {
    it('should return rental agreement when found', async () => {
      mockRentalAgreementsService.findOne.mockResolvedValue(
        mockRentalAgreement,
      );

      const response = await request(app.getHttpServer())
        .get(`/api/rental-agreements/${mockRentalAgreement.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: mockRentalAgreement.id,
        propertyId: mockRentalAgreement.propertyId,
        tenantId: mockRentalAgreement.tenantId,
      });
      expect(rentalAgreementsService.findOne).toHaveBeenCalledWith(
        mockRentalAgreement.id,
      );
    });

    it('should return 404 when rental agreement not found', async () => {
      mockRentalAgreementsService.findOne.mockRejectedValue(
        new NotFoundException(
          'Rental agreement with ID non-existent not found',
        ),
      );

      await request(app.getHttpServer())
        .get('/api/rental-agreements/non-existent')
        .expect(404);

      expect(rentalAgreementsService.findOne).toHaveBeenCalledWith(
        'non-existent',
      );
    });
  });

  describe('PATCH /api/rental-agreements/:id', () => {
    it('should update rental agreement and return 200', async () => {
      const dto: UpdateRentalAgreementDto = { notes: 'Updated notes' };
      const updatedAgreement = {
        ...mockRentalAgreement,
        notes: 'Updated notes',
      };
      mockRentalAgreementsService.update.mockResolvedValue(updatedAgreement);

      const response = await request(app.getHttpServer())
        .patch(`/api/rental-agreements/${mockRentalAgreement.id}`)
        .send(dto)
        .expect(200);

      expect(response.body.notes).toBe('Updated notes');
      expect(rentalAgreementsService.update).toHaveBeenCalledWith(
        mockRentalAgreement.id,
        expect.objectContaining({ notes: 'Updated notes' }),
      );
    });

    it('should return 404 when rental agreement not found', async () => {
      mockRentalAgreementsService.update.mockRejectedValue(
        new NotFoundException(
          'Rental agreement with ID non-existent not found',
        ),
      );

      await request(app.getHttpServer())
        .patch('/api/rental-agreements/non-existent')
        .send({ notes: 'Test' })
        .expect(404);
    });
  });

  describe('DELETE /api/rental-agreements/:id', () => {
    it('should delete rental agreement and return 204', async () => {
      mockRentalAgreementsService.remove.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete(`/api/rental-agreements/${mockRentalAgreement.id}`)
        .expect(204);

      expect(rentalAgreementsService.remove).toHaveBeenCalledWith(
        mockRentalAgreement.id,
      );
    });

    it('should return 404 when rental agreement not found', async () => {
      mockRentalAgreementsService.remove.mockRejectedValue(
        new NotFoundException(
          'Rental agreement with ID non-existent not found',
        ),
      );

      await request(app.getHttpServer())
        .delete('/api/rental-agreements/non-existent')
        .expect(404);
    });
  });
});
