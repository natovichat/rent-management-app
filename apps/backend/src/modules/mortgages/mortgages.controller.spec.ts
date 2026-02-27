import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { MortgagesController } from './mortgages.controller';
import { MortgagesService } from './mortgages.service';
import { CreateMortgageDto } from './dto/create-mortgage.dto';
import { UpdateMortgageDto } from './dto/update-mortgage.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { MortgageStatus } from '@prisma/client';

describe('MortgagesController', () => {
  let app: INestApplication;
  let mortgagesService: MortgagesService;

  const mockMortgage = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    propertyId: '550e8400-e29b-41d4-a716-446655440001',
    bank: 'בנק לאומי',
    loanAmount: 1000000,
    interestRate: 3.5,
    monthlyPayment: 5000,
    earlyRepaymentPenalty: 10000,
    bankAccountId: '550e8400-e29b-41d4-a716-446655440002',
    mortgageOwnerId: '550e8400-e29b-41d4-a716-446655440003',
    payerId: '550e8400-e29b-41d4-a716-446655440004',
    startDate: new Date('2025-01-01T00:00:00.000Z'),
    endDate: new Date('2040-12-31T00:00:00.000Z'),
    status: MortgageStatus.ACTIVE,
    linkedProperties: [],
    notes: 'Test mortgage',
    createdAt: new Date('2025-02-27T10:00:00.000Z'),
    updatedAt: new Date('2025-02-27T10:00:00.000Z'),
    property: null,
    bankAccount: null,
    mortgageOwner: null,
    payer: { id: '550e8400-e29b-41d4-a716-446655440004', name: 'John' },
  };

  const mockMortgagesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByProperty: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [MortgagesController],
      providers: [
        {
          provide: MortgagesService,
          useValue: mockMortgagesService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    mortgagesService =
      moduleFixture.get<MortgagesService>(MortgagesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /mortgages', () => {
    it('should create a mortgage and return 201', async () => {
      const dto: CreateMortgageDto = {
        bank: 'בנק לאומי',
        loanAmount: 1000000,
        payerId: '550e8400-e29b-41d4-a716-446655440004',
        startDate: '2025-01-01',
        status: MortgageStatus.ACTIVE,
      };
      mockMortgagesService.create.mockResolvedValue(mockMortgage);

      const response = await request(app.getHttpServer())
        .post('/mortgages')
        .send(dto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: mockMortgage.id,
        bank: mockMortgage.bank,
        loanAmount: Number(mockMortgage.loanAmount),
        payerId: mockMortgage.payerId,
      });
      expect(mortgagesService.create).toHaveBeenCalledWith(dto);
    });

    it('should return 400 when bank is missing', async () => {
      await request(app.getHttpServer())
        .post('/mortgages')
        .send({
          loanAmount: 1000000,
          payerId: '550e8400-e29b-41d4-a716-446655440004',
          startDate: '2025-01-01',
          status: MortgageStatus.ACTIVE,
        })
        .expect(400);

      expect(mortgagesService.create).not.toHaveBeenCalled();
    });

    it('should return 400 when loanAmount is invalid', async () => {
      await request(app.getHttpServer())
        .post('/mortgages')
        .send({
          bank: 'בנק לאומי',
          loanAmount: 0,
          payerId: '550e8400-e29b-41d4-a716-446655440004',
          startDate: '2025-01-01',
          status: MortgageStatus.ACTIVE,
        })
        .expect(400);

      expect(mortgagesService.create).not.toHaveBeenCalled();
    });

    it('should return 400 when payerId is invalid UUID', async () => {
      await request(app.getHttpServer())
        .post('/mortgages')
        .send({
          bank: 'בנק לאומי',
          loanAmount: 1000000,
          payerId: 'invalid-uuid',
          startDate: '2025-01-01',
          status: MortgageStatus.ACTIVE,
        })
        .expect(400);

      expect(mortgagesService.create).not.toHaveBeenCalled();
    });

    it('should return 400 when related entity not found', async () => {
      mockMortgagesService.create.mockRejectedValue(
        new BadRequestException('Person (payer) with ID xyz not found'),
      );

      await request(app.getHttpServer())
        .post('/mortgages')
        .send({
          bank: 'בנק לאומי',
          loanAmount: 1000000,
          payerId: '550e8400-e29b-41d4-a716-446655440004',
          startDate: '2025-01-01',
          status: MortgageStatus.ACTIVE,
        })
        .expect(400);
    });
  });

  describe('GET /mortgages', () => {
    it('should return paginated list', async () => {
      mockMortgagesService.findAll.mockResolvedValue({
        data: [mockMortgage],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });

      const response = await request(app.getHttpServer())
        .get('/mortgages')
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
      expect(mortgagesService.findAll).toHaveBeenCalled();
    });

    it('should pass query params to service', async () => {
      mockMortgagesService.findAll.mockResolvedValue({
        data: [],
        meta: { page: 2, limit: 10, total: 0, totalPages: 0 },
      });

      await request(app.getHttpServer())
        .get('/mortgages')
        .query({
          page: 2,
          limit: 10,
          status: 'ACTIVE',
          propertyId: '550e8400-e29b-41d4-a716-446655440001',
        })
        .expect(200);

      expect(mortgagesService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 10,
          status: 'ACTIVE',
          propertyId: '550e8400-e29b-41d4-a716-446655440001',
        }),
      );
    });
  });

  describe('GET /mortgages/:id', () => {
    it('should return mortgage when found', async () => {
      mockMortgagesService.findOne.mockResolvedValue(mockMortgage);

      const response = await request(app.getHttpServer())
        .get(`/mortgages/${mockMortgage.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: mockMortgage.id,
        bank: mockMortgage.bank,
        payerId: mockMortgage.payerId,
      });
      expect(mortgagesService.findOne).toHaveBeenCalledWith(mockMortgage.id);
    });

    it('should return 404 when mortgage not found', async () => {
      mockMortgagesService.findOne.mockRejectedValue(
        new NotFoundException('Mortgage with ID non-existent not found'),
      );

      await request(app.getHttpServer())
        .get('/mortgages/non-existent')
        .expect(404);

      expect(mortgagesService.findOne).toHaveBeenCalledWith('non-existent');
    });
  });

  describe('PATCH /mortgages/:id', () => {
    it('should update mortgage and return 200', async () => {
      const dto: UpdateMortgageDto = { notes: 'Updated notes' };
      const updatedMortgage = { ...mockMortgage, notes: 'Updated notes' };
      mockMortgagesService.update.mockResolvedValue(updatedMortgage);

      const response = await request(app.getHttpServer())
        .patch(`/mortgages/${mockMortgage.id}`)
        .send(dto)
        .expect(200);

      expect(response.body.notes).toBe('Updated notes');
      expect(mortgagesService.update).toHaveBeenCalledWith(
        mockMortgage.id,
        dto,
      );
    });

    it('should return 404 when mortgage not found', async () => {
      mockMortgagesService.update.mockRejectedValue(
        new NotFoundException('Mortgage with ID non-existent not found'),
      );

      await request(app.getHttpServer())
        .patch('/mortgages/non-existent')
        .send({ bank: 'Test' })
        .expect(404);
    });
  });

  describe('DELETE /mortgages/:id', () => {
    it('should delete mortgage and return 204', async () => {
      mockMortgagesService.remove.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete(`/mortgages/${mockMortgage.id}`)
        .expect(204);

      expect(mortgagesService.remove).toHaveBeenCalledWith(mockMortgage.id);
    });

    it('should return 404 when mortgage not found', async () => {
      mockMortgagesService.remove.mockRejectedValue(
        new NotFoundException('Mortgage with ID non-existent not found'),
      );

      await request(app.getHttpServer())
        .delete('/mortgages/non-existent')
        .expect(404);
    });
  });
});
