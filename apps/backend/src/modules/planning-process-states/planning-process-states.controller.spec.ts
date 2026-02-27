import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as request from 'supertest';
import { PlanningProcessStatesController } from './planning-process-states.controller';
import { PlanningProcessStatesService } from './planning-process-states.service';
import { CreatePlanningProcessStateDto } from './dto/create-planning-process-state.dto';
import { UpdatePlanningProcessStateDto } from './dto/update-planning-process-state.dto';

const propertyId = '660e8400-e29b-41d4-a716-446655440001';

const mockPlanningProcessState = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  propertyId,
  stateType: 'IN_PROGRESS',
  developerName: 'Acme Developers',
  projectedSizeAfter: '150 sqm',
  lastUpdateDate: new Date('2025-02-27'),
  notes: 'Awaiting approval',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('PlanningProcessStatesController', () => {
  let app: INestApplication;

  const mockPlanningProcessStatesService = {
    create: jest.fn(),
    findByProperty: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanningProcessStatesController],
      providers: [
        {
          provide: PlanningProcessStatesService,
          useValue: mockPlanningProcessStatesService,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    jest.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  const basePath = `/properties/${propertyId}/planning-process-state`;

  describe('POST /api/properties/:propertyId/planning-process-state', () => {
    it('should create planning process state', async () => {
      const dto: CreatePlanningProcessStateDto = {
        stateType: 'IN_PROGRESS',
        lastUpdateDate: '2025-02-27T10:00:00.000Z',
        developerName: 'Acme Developers',
        projectedSizeAfter: '150 sqm',
        notes: 'Awaiting approval',
      };

      mockPlanningProcessStatesService.create.mockResolvedValue(
        mockPlanningProcessState,
      );

      const response = await request(app.getHttpServer())
        .post(basePath)
        .send(dto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: mockPlanningProcessState.id,
        propertyId,
        stateType: dto.stateType,
        developerName: dto.developerName,
        projectedSizeAfter: dto.projectedSizeAfter,
        notes: dto.notes,
      });
      expect(mockPlanningProcessStatesService.create).toHaveBeenCalledWith(
        propertyId,
        dto,
      );
    });

    it('should return 400 when stateType is missing', async () => {
      await request(app.getHttpServer())
        .post(basePath)
        .send({
          lastUpdateDate: '2025-02-27T10:00:00.000Z',
        })
        .expect(400);

      expect(mockPlanningProcessStatesService.create).not.toHaveBeenCalled();
    });

    it('should return 400 when lastUpdateDate is missing', async () => {
      await request(app.getHttpServer())
        .post(basePath)
        .send({
          stateType: 'IN_PROGRESS',
        })
        .expect(400);

      expect(mockPlanningProcessStatesService.create).not.toHaveBeenCalled();
    });

    it('should return 404 when property not found', async () => {
      mockPlanningProcessStatesService.create.mockRejectedValue(
        new NotFoundException(`Property with id ${propertyId} not found`),
      );

      await request(app.getHttpServer())
        .post(basePath)
        .send({
          stateType: 'IN_PROGRESS',
          lastUpdateDate: '2025-02-27T10:00:00.000Z',
        })
        .expect(404);
    });

    it('should return 409 when property already has state', async () => {
      mockPlanningProcessStatesService.create.mockRejectedValue(
        new ConflictException(
          'Property already has a planning process state. Use PATCH to update.',
        ),
      );

      await request(app.getHttpServer())
        .post(basePath)
        .send({
          stateType: 'IN_PROGRESS',
          lastUpdateDate: '2025-02-27T10:00:00.000Z',
        })
        .expect(409);
    });
  });

  describe('GET /api/properties/:propertyId/planning-process-state', () => {
    it('should return planning process state', async () => {
      mockPlanningProcessStatesService.findByProperty.mockResolvedValue(
        mockPlanningProcessState,
      );

      const response = await request(app.getHttpServer())
        .get(basePath)
        .expect(200);

      expect(response.body).toMatchObject({
        id: mockPlanningProcessState.id,
        propertyId,
        stateType: mockPlanningProcessState.stateType,
      });
      expect(mockPlanningProcessStatesService.findByProperty).toHaveBeenCalledWith(
        propertyId,
      );
    });

    it('should return 404 when state not found', async () => {
      mockPlanningProcessStatesService.findByProperty.mockRejectedValue(
        new NotFoundException(
          `Planning process state for property ${propertyId} not found`,
        ),
      );

      await request(app.getHttpServer()).get(basePath).expect(404);
    });
  });

  describe('PATCH /api/properties/:propertyId/planning-process-state', () => {
    it('should update planning process state', async () => {
      const updateDto: UpdatePlanningProcessStateDto = {
        stateType: 'APPROVED',
        lastUpdateDate: '2025-03-01T10:00:00.000Z',
        notes: 'Approved by municipality',
      };
      const updated = { ...mockPlanningProcessState, ...updateDto };

      mockPlanningProcessStatesService.update.mockResolvedValue(updated);

      const response = await request(app.getHttpServer())
        .patch(basePath)
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject(updateDto);
      expect(mockPlanningProcessStatesService.update).toHaveBeenCalledWith(
        propertyId,
        updateDto,
      );
    });

    it('should return 404 when updating non-existent state', async () => {
      mockPlanningProcessStatesService.update.mockRejectedValue(
        new NotFoundException(
          `Planning process state for property ${propertyId} not found`,
        ),
      );

      await request(app.getHttpServer())
        .patch(basePath)
        .send({ stateType: 'APPROVED' })
        .expect(404);
    });
  });

  describe('DELETE /api/properties/:propertyId/planning-process-state', () => {
    it('should delete planning process state and return 204', async () => {
      mockPlanningProcessStatesService.remove.mockResolvedValue(undefined);

      await request(app.getHttpServer()).delete(basePath).expect(204);

      expect(mockPlanningProcessStatesService.remove).toHaveBeenCalledWith(
        propertyId,
      );
    });

    it('should return 404 when deleting non-existent state', async () => {
      mockPlanningProcessStatesService.remove.mockRejectedValue(
        new NotFoundException(
          `Planning process state for property ${propertyId} not found`,
        ),
      );

      await request(app.getHttpServer()).delete(basePath).expect(404);
    });
  });
});
