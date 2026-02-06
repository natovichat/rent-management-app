import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ValuationsService } from './valuations.service';
import { PrismaService } from '../../database/prisma.service';
import { CreateValuationDto } from './dto/create-valuation.dto';
import { UpdateValuationDto } from './dto/update-valuation.dto';
import { ValuationType } from '@prisma/client';

describe('ValuationsService', () => {
  let service: ValuationsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    property: {
      findFirst: jest.fn(),
    },
    propertyValuation: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockAccountId = 'account-1';
  const mockPropertyId = 'property-1';
  const mockValuationId = 'valuation-1';

  const mockProperty = {
    id: mockPropertyId,
    accountId: mockAccountId,
    address: 'Test Address',
  };

  const mockValuation = {
    id: mockValuationId,
    propertyId: mockPropertyId,
    accountId: mockAccountId,
    valuationDate: new Date('2024-01-01'),
    estimatedValue: 2500000,
    valuationType: ValuationType.APPRAISAL,
    notes: 'Test valuation',
    property: mockProperty,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValuationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ValuationsService>(ValuationsService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('findAllByProperty', () => {
    it('should return all valuations for a property', async () => {
      const mockValuations = [mockValuation];
      mockPrismaService.property.findFirst.mockResolvedValue(mockProperty);
      mockPrismaService.propertyValuation.findMany.mockResolvedValue(
        mockValuations,
      );

      const result = await service.findAllByProperty(
        mockPropertyId,
        mockAccountId,
      );

      expect(result).toEqual(mockValuations);
      expect(prismaService.property.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockPropertyId,
          accountId: mockAccountId,
        },
      });
      expect(prismaService.propertyValuation.findMany).toHaveBeenCalledWith({
        where: {
          propertyId: mockPropertyId,
          accountId: mockAccountId,
        },
        include: {
          property: true,
        },
        orderBy: {
          valuationDate: 'desc',
        },
      });
    });

    it('should throw NotFoundException when property not found', async () => {
      mockPrismaService.property.findFirst.mockResolvedValue(null);

      await expect(
        service.findAllByProperty(mockPropertyId, mockAccountId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return empty array when no valuations exist', async () => {
      mockPrismaService.property.findFirst.mockResolvedValue(mockProperty);
      mockPrismaService.propertyValuation.findMany.mockResolvedValue([]);

      const result = await service.findAllByProperty(
        mockPropertyId,
        mockAccountId,
      );

      expect(result).toEqual([]);
    });

    it('should enforce account isolation', async () => {
      const otherAccountId = 'account-2';
      mockPrismaService.property.findFirst.mockResolvedValue(null);

      await expect(
        service.findAllByProperty(mockPropertyId, otherAccountId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getLatest', () => {
    it('should return the most recent valuation', async () => {
      const latestValuation = {
        ...mockValuation,
        valuationDate: new Date('2024-12-01'),
      };
      mockPrismaService.property.findFirst.mockResolvedValue(mockProperty);
      mockPrismaService.propertyValuation.findFirst.mockResolvedValue(
        latestValuation,
      );

      const result = await service.getLatest(mockPropertyId, mockAccountId);

      expect(result).toEqual(latestValuation);
      expect(prismaService.propertyValuation.findFirst).toHaveBeenCalledWith({
        where: {
          propertyId: mockPropertyId,
          accountId: mockAccountId,
        },
        include: {
          property: true,
        },
        orderBy: {
          valuationDate: 'desc',
        },
      });
    });

    it('should throw NotFoundException when property not found', async () => {
      mockPrismaService.property.findFirst.mockResolvedValue(null);

      await expect(
        service.getLatest(mockPropertyId, mockAccountId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when no valuations exist', async () => {
      mockPrismaService.property.findFirst.mockResolvedValue(mockProperty);
      mockPrismaService.propertyValuation.findFirst.mockResolvedValue(null);

      await expect(
        service.getLatest(mockPropertyId, mockAccountId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should order by valuationDate descending', async () => {
      mockPrismaService.property.findFirst.mockResolvedValue(mockProperty);
      mockPrismaService.propertyValuation.findFirst.mockResolvedValue(
        mockValuation,
      );

      await service.getLatest(mockPropertyId, mockAccountId);

      expect(prismaService.propertyValuation.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            valuationDate: 'desc',
          },
        }),
      );
    });
  });

  describe('create', () => {
    const createDto: CreateValuationDto = {
      propertyId: mockPropertyId,
      valuationDate: '2024-01-01T00:00:00Z',
      estimatedValue: 2500000,
      valuationType: ValuationType.APPRAISAL,
      notes: 'Test valuation',
    };

    it('should create a valuation successfully', async () => {
      mockPrismaService.property.findFirst.mockResolvedValue(mockProperty);
      mockPrismaService.propertyValuation.create.mockResolvedValue(
        mockValuation,
      );

      const result = await service.create(createDto, mockAccountId);

      expect(result).toEqual(mockValuation);
      expect(prismaService.property.findFirst).toHaveBeenCalledWith({
        where: {
          id: createDto.propertyId,
          accountId: mockAccountId,
        },
      });
      expect(prismaService.propertyValuation.create).toHaveBeenCalledWith({
        data: {
          propertyId: createDto.propertyId,
          accountId: mockAccountId,
          valuationDate: new Date(createDto.valuationDate),
          estimatedValue: createDto.estimatedValue,
          valuationType: createDto.valuationType,
          notes: createDto.notes,
        },
        include: {
          property: true,
        },
      });
    });

    it('should throw NotFoundException when property not found', async () => {
      mockPrismaService.property.findFirst.mockResolvedValue(null);

      await expect(
        service.create(createDto, mockAccountId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should enforce account isolation', async () => {
      const otherAccountId = 'account-2';
      mockPrismaService.property.findFirst.mockResolvedValue(null);

      await expect(
        service.create(createDto, otherAccountId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle optional notes field', async () => {
      const dtoWithoutNotes = { ...createDto };
      delete dtoWithoutNotes.notes;

      mockPrismaService.property.findFirst.mockResolvedValue(mockProperty);
      mockPrismaService.propertyValuation.create.mockResolvedValue({
        ...mockValuation,
        notes: null,
      });

      await service.create(dtoWithoutNotes, mockAccountId);

      expect(prismaService.propertyValuation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          notes: undefined,
        }),
        include: {
          property: true,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a valuation by ID', async () => {
      mockPrismaService.propertyValuation.findFirst.mockResolvedValue(
        mockValuation,
      );

      const result = await service.findOne(mockValuationId, mockAccountId);

      expect(result).toEqual(mockValuation);
      expect(prismaService.propertyValuation.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockValuationId,
          accountId: mockAccountId,
        },
        include: {
          property: true,
        },
      });
    });

    it('should throw NotFoundException when valuation not found', async () => {
      mockPrismaService.propertyValuation.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne(mockValuationId, mockAccountId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should enforce account isolation', async () => {
      const otherAccountId = 'account-2';
      mockPrismaService.propertyValuation.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne(mockValuationId, otherAccountId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateValuationDto = {
      estimatedValue: 3000000,
      notes: 'Updated notes',
    };

    it('should update a valuation successfully', async () => {
      mockPrismaService.propertyValuation.findFirst.mockResolvedValue(
        mockValuation,
      );
      mockPrismaService.propertyValuation.update.mockResolvedValue({
        ...mockValuation,
        ...updateDto,
      });

      const result = await service.update(
        mockValuationId,
        updateDto,
        mockAccountId,
      );

      expect(result).toMatchObject(updateDto);
      expect(prismaService.propertyValuation.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when valuation not found', async () => {
      mockPrismaService.propertyValuation.findFirst.mockResolvedValue(null);

      await expect(
        service.update(mockValuationId, updateDto, mockAccountId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should verify property belongs to account when updating propertyId', async () => {
      const newPropertyId = 'property-2';
      const newProperty = { ...mockProperty, id: newPropertyId };
      const updateDtoWithProperty = {
        ...updateDto,
        propertyId: newPropertyId,
      };

      mockPrismaService.propertyValuation.findFirst.mockResolvedValue(
        mockValuation,
      );
      mockPrismaService.property.findFirst.mockResolvedValue(newProperty);
      mockPrismaService.propertyValuation.update.mockResolvedValue({
        ...mockValuation,
        propertyId: newPropertyId,
      });

      await service.update(mockValuationId, updateDtoWithProperty, mockAccountId);

      expect(prismaService.property.findFirst).toHaveBeenCalledWith({
        where: {
          id: newPropertyId,
          accountId: mockAccountId,
        },
      });
    });

    it('should convert valuationDate string to Date', async () => {
      const updateDtoWithDate = {
        ...updateDto,
        valuationDate: '2024-12-01T00:00:00Z',
      };

      mockPrismaService.propertyValuation.findFirst.mockResolvedValue(
        mockValuation,
      );
      mockPrismaService.propertyValuation.update.mockResolvedValue(mockValuation);

      await service.update(mockValuationId, updateDtoWithDate, mockAccountId);

      expect(prismaService.propertyValuation.update).toHaveBeenCalledWith({
        where: { id: mockValuationId },
        data: expect.objectContaining({
          valuationDate: new Date('2024-12-01T00:00:00Z'),
        }),
        include: {
          property: true,
        },
      });
    });
  });

  describe('remove', () => {
    it('should delete a valuation successfully', async () => {
      mockPrismaService.propertyValuation.findFirst.mockResolvedValue(
        mockValuation,
      );
      mockPrismaService.propertyValuation.delete.mockResolvedValue(mockValuation);

      const result = await service.remove(mockValuationId, mockAccountId);

      expect(result).toEqual({ message: 'Valuation deleted successfully' });
      expect(prismaService.propertyValuation.delete).toHaveBeenCalledWith({
        where: { id: mockValuationId },
      });
    });

    it('should throw NotFoundException when valuation not found', async () => {
      mockPrismaService.propertyValuation.findFirst.mockResolvedValue(null);

      await expect(
        service.remove(mockValuationId, mockAccountId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
