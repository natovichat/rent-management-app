import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PlanningProcessStatesService } from './planning-process-states.service';
import { PrismaService } from '../../database/prisma.service';
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

describe('PlanningProcessStatesService', () => {
  let service: PlanningProcessStatesService;
  let prisma: PrismaService;

  const mockPrisma = {
    property: {
      findUnique: jest.fn(),
    },
    planningProcessState: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanningProcessStatesService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<PlanningProcessStatesService>(
      PlanningProcessStatesService,
    );
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create planning process state when property exists and has no state', async () => {
      const dto: CreatePlanningProcessStateDto = {
        stateType: 'IN_PROGRESS',
        lastUpdateDate: '2025-02-27T10:00:00.000Z',
        developerName: 'Acme Developers',
        projectedSizeAfter: '150 sqm',
        notes: 'Awaiting approval',
      };

      mockPrisma.property.findUnique.mockResolvedValue({
        id: propertyId,
        planningProcessState: null,
      });
      mockPrisma.planningProcessState.create.mockResolvedValue(
        mockPlanningProcessState,
      );

      const result = await service.create(propertyId, dto);

      expect(mockPrisma.property.findUnique).toHaveBeenCalledWith({
        where: { id: propertyId },
        include: { planningProcessState: true },
      });
      expect(mockPrisma.planningProcessState.create).toHaveBeenCalledWith({
        data: {
          propertyId,
          stateType: dto.stateType,
          lastUpdateDate: new Date(dto.lastUpdateDate),
          developerName: dto.developerName,
          projectedSizeAfter: dto.projectedSizeAfter,
          notes: dto.notes,
        },
      });
      expect(result).toEqual(mockPlanningProcessState);
    });

    it('should throw NotFoundException when property does not exist', async () => {
      mockPrisma.property.findUnique.mockResolvedValue(null);

      await expect(
        service.create(propertyId, {
          stateType: 'IN_PROGRESS',
          lastUpdateDate: '2025-02-27T10:00:00.000Z',
        }),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.create(propertyId, {
          stateType: 'IN_PROGRESS',
          lastUpdateDate: '2025-02-27T10:00:00.000Z',
        }),
      ).rejects.toThrow(`Property with id ${propertyId} not found`);
      expect(mockPrisma.planningProcessState.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when property already has state', async () => {
      mockPrisma.property.findUnique.mockResolvedValue({
        id: propertyId,
        planningProcessState: mockPlanningProcessState,
      });

      await expect(
        service.create(propertyId, {
          stateType: 'IN_PROGRESS',
          lastUpdateDate: '2025-02-27T10:00:00.000Z',
        }),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.create(propertyId, {
          stateType: 'IN_PROGRESS',
          lastUpdateDate: '2025-02-27T10:00:00.000Z',
        }),
      ).rejects.toThrow(/already has a planning process state/);
      expect(mockPrisma.planningProcessState.create).not.toHaveBeenCalled();
    });
  });

  describe('findByProperty', () => {
    it('should return state when found', async () => {
      mockPrisma.planningProcessState.findUnique.mockResolvedValue(
        mockPlanningProcessState,
      );

      const result = await service.findByProperty(propertyId);

      expect(result).toEqual(mockPlanningProcessState);
      expect(mockPrisma.planningProcessState.findUnique).toHaveBeenCalledWith({
        where: { propertyId },
      });
    });

    it('should throw NotFoundException when state not found', async () => {
      mockPrisma.planningProcessState.findUnique.mockResolvedValue(null);

      await expect(service.findByProperty(propertyId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByProperty(propertyId)).rejects.toThrow(
        `Planning process state for property ${propertyId} not found`,
      );
    });
  });

  describe('update', () => {
    it('should update state', async () => {
      const updateDto: UpdatePlanningProcessStateDto = {
        stateType: 'APPROVED',
        lastUpdateDate: '2025-03-01T10:00:00.000Z',
        notes: 'Approved by municipality',
      };
      const updated = { ...mockPlanningProcessState, ...updateDto };

      mockPrisma.planningProcessState.findUnique.mockResolvedValue(
        mockPlanningProcessState,
      );
      mockPrisma.planningProcessState.update.mockResolvedValue(updated);

      const result = await service.update(propertyId, updateDto);

      expect(mockPrisma.planningProcessState.update).toHaveBeenCalledWith({
        where: { propertyId },
        data: expect.objectContaining({
          stateType: updateDto.stateType,
          lastUpdateDate: new Date(updateDto.lastUpdateDate!),
          notes: updateDto.notes,
        }),
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when updating non-existent state', async () => {
      mockPrisma.planningProcessState.findUnique.mockResolvedValue(null);

      await expect(
        service.update(propertyId, { stateType: 'APPROVED' }),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrisma.planningProcessState.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete state', async () => {
      mockPrisma.planningProcessState.findUnique.mockResolvedValue(
        mockPlanningProcessState,
      );
      mockPrisma.planningProcessState.delete.mockResolvedValue(
        mockPlanningProcessState,
      );

      await service.remove(propertyId);

      expect(mockPrisma.planningProcessState.delete).toHaveBeenCalledWith({
        where: { propertyId },
      });
    });

    it('should throw NotFoundException when removing non-existent state', async () => {
      mockPrisma.planningProcessState.findUnique.mockResolvedValue(null);

      await expect(service.remove(propertyId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.planningProcessState.delete).not.toHaveBeenCalled();
    });
  });
});
