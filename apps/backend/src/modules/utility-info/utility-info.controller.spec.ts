import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { UtilityInfoController } from './utility-info.controller';
import { UtilityInfoService } from './utility-info.service';
import { CreateUtilityInfoDto } from './dto/create-utility-info.dto';
import { UpdateUtilityInfoDto } from './dto/update-utility-info.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('UtilityInfoController', () => {
  let app: INestApplication;
  let utilityInfoService: UtilityInfoService;

  const propertyId = '550e8400-e29b-41d4-a716-446655440001';
  const mockUtilityInfo = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    propertyId,
    arnonaAccountNumber: '12345678',
    electricityAccountNumber: '987654321',
    waterAccountNumber: '55555555',
    vaadBayitName: 'ועד בית גן',
    waterMeterNumber: 'WM-001',
    electricityMeterNumber: 'EM-002',
    notes: 'Meter readings monthly',
    createdAt: new Date('2025-02-27T10:00:00.000Z'),
    updatedAt: new Date('2025-02-27T10:00:00.000Z'),
  };

  const mockUtilityInfoService = {
    create: jest.fn(),
    findByProperty: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const basePath = `/properties/${propertyId}/utility-info`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UtilityInfoController],
      providers: [
        {
          provide: UtilityInfoService,
          useValue: mockUtilityInfoService,
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
    utilityInfoService =
      moduleFixture.get<UtilityInfoService>(UtilityInfoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe(`POST ${basePath}`, () => {
    it('should create utility info and return 201', async () => {
      const dto: CreateUtilityInfoDto = {
        arnonaAccountNumber: '12345678',
        electricityAccountNumber: '987654321',
      };
      mockUtilityInfoService.create.mockResolvedValue(mockUtilityInfo);

      const response = await request(app.getHttpServer())
        .post(basePath)
        .send(dto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: mockUtilityInfo.id,
        propertyId: mockUtilityInfo.propertyId,
        arnonaAccountNumber: mockUtilityInfo.arnonaAccountNumber,
        electricityAccountNumber: mockUtilityInfo.electricityAccountNumber,
      });
      expect(utilityInfoService.create).toHaveBeenCalledWith(propertyId, dto);
    });

    it('should accept empty body (all fields optional)', async () => {
      mockUtilityInfoService.create.mockResolvedValue(mockUtilityInfo);

      await request(app.getHttpServer())
        .post(basePath)
        .send({})
        .expect(201);

      expect(utilityInfoService.create).toHaveBeenCalledWith(propertyId, {});
    });

    it('should return 404 when property not found', async () => {
      mockUtilityInfoService.create.mockRejectedValue(
        new NotFoundException(`Property with ID ${propertyId} not found`),
      );

      await request(app.getHttpServer())
        .post(basePath)
        .send({})
        .expect(404);
    });

    it('should return 409 when utility info already exists', async () => {
      mockUtilityInfoService.create.mockRejectedValue(
        new ConflictException(
          `Utility info already exists for property ${propertyId}. Use PATCH to update.`,
        ),
      );

      await request(app.getHttpServer())
        .post(basePath)
        .send({ arnonaAccountNumber: '123' })
        .expect(409);
    });
  });

  describe(`GET ${basePath}`, () => {
    it('should return utility info when found', async () => {
      mockUtilityInfoService.findByProperty.mockResolvedValue(mockUtilityInfo);

      const response = await request(app.getHttpServer())
        .get(basePath)
        .expect(200);

      expect(response.body).toMatchObject({
        id: mockUtilityInfo.id,
        propertyId: mockUtilityInfo.propertyId,
        arnonaAccountNumber: mockUtilityInfo.arnonaAccountNumber,
      });
      expect(utilityInfoService.findByProperty).toHaveBeenCalledWith(
        propertyId,
      );
    });

    it('should return 404 when utility info not found', async () => {
      mockUtilityInfoService.findByProperty.mockRejectedValue(
        new NotFoundException(
          `Utility info for property ${propertyId} not found`,
        ),
      );

      await request(app.getHttpServer()).get(basePath).expect(404);

      expect(utilityInfoService.findByProperty).toHaveBeenCalledWith(
        propertyId,
      );
    });
  });

  describe(`PATCH ${basePath}`, () => {
    it('should update utility info and return 200', async () => {
      const dto: UpdateUtilityInfoDto = { notes: 'Updated notes' };
      const updated = { ...mockUtilityInfo, notes: 'Updated notes' };
      mockUtilityInfoService.update.mockResolvedValue(updated);

      const response = await request(app.getHttpServer())
        .patch(basePath)
        .send(dto)
        .expect(200);

      expect(response.body.notes).toBe('Updated notes');
      expect(utilityInfoService.update).toHaveBeenCalledWith(propertyId, dto);
    });

    it('should return 404 when utility info not found', async () => {
      mockUtilityInfoService.update.mockRejectedValue(
        new NotFoundException(
          `Utility info for property ${propertyId} not found`,
        ),
      );

      await request(app.getHttpServer())
        .patch(basePath)
        .send({ notes: 'Test' })
        .expect(404);
    });
  });

  describe(`DELETE ${basePath}`, () => {
    it('should delete utility info and return 204', async () => {
      mockUtilityInfoService.remove.mockResolvedValue(undefined);

      await request(app.getHttpServer()).delete(basePath).expect(204);

      expect(utilityInfoService.remove).toHaveBeenCalledWith(propertyId);
    });

    it('should return 404 when utility info not found', async () => {
      mockUtilityInfoService.remove.mockRejectedValue(
        new NotFoundException(
          `Utility info for property ${propertyId} not found`,
        ),
      );

      await request(app.getHttpServer()).delete(basePath).expect(404);
    });
  });
});
