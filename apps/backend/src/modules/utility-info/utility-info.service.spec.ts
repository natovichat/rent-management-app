import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UtilityInfoService } from './utility-info.service';
import { PrismaService } from '../../database/prisma.service';
import { CreateUtilityInfoDto } from './dto/create-utility-info.dto';
import { UpdateUtilityInfoDto } from './dto/update-utility-info.dto';

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
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UtilityInfoService', () => {
  let service: UtilityInfoService;
  let prisma: PrismaService;

  const mockPrisma = {
    property: {
      findUnique: jest.fn(),
    },
    utilityInfo: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UtilityInfoService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<UtilityInfoService>(UtilityInfoService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create utility info for a property', async () => {
      const dto: CreateUtilityInfoDto = {
        arnonaAccountNumber: '12345678',
        electricityAccountNumber: '987654321',
      };

      mockPrisma.property.findUnique.mockResolvedValue({ id: propertyId });
      mockPrisma.utilityInfo.findUnique.mockResolvedValue(null);
      mockPrisma.utilityInfo.create.mockResolvedValue(mockUtilityInfo);

      const result = await service.create(propertyId, dto);

      expect(mockPrisma.property.findUnique).toHaveBeenCalledWith({
        where: { id: propertyId },
      });
      expect(mockPrisma.utilityInfo.findUnique).toHaveBeenCalledWith({
        where: { propertyId },
      });
      expect(mockPrisma.utilityInfo.create).toHaveBeenCalledWith({
        data: {
          propertyId,
          arnonaAccountNumber: dto.arnonaAccountNumber,
          electricityAccountNumber: dto.electricityAccountNumber,
          waterAccountNumber: undefined,
          vaadBayitName: undefined,
          waterMeterNumber: undefined,
          electricityMeterNumber: undefined,
          notes: undefined,
        },
      });
      expect(result).toEqual(mockUtilityInfo);
    });

    it('should create utility info with empty dto (all optional)', async () => {
      mockPrisma.property.findUnique.mockResolvedValue({ id: propertyId });
      mockPrisma.utilityInfo.findUnique.mockResolvedValue(null);
      mockPrisma.utilityInfo.create.mockResolvedValue({
        ...mockUtilityInfo,
        arnonaAccountNumber: null,
        electricityAccountNumber: null,
      });

      const result = await service.create(propertyId, {});

      expect(mockPrisma.utilityInfo.create).toHaveBeenCalledWith({
        data: {
          propertyId,
          arnonaAccountNumber: undefined,
          electricityAccountNumber: undefined,
          waterAccountNumber: undefined,
          vaadBayitName: undefined,
          waterMeterNumber: undefined,
          electricityMeterNumber: undefined,
          notes: undefined,
        },
      });
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when property does not exist', async () => {
      mockPrisma.property.findUnique.mockResolvedValue(null);

      await expect(service.create(propertyId, {})).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(propertyId, {})).rejects.toThrow(
        `Property with ID ${propertyId} not found`,
      );
      expect(mockPrisma.utilityInfo.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when utility info already exists', async () => {
      mockPrisma.property.findUnique.mockResolvedValue({ id: propertyId });
      mockPrisma.utilityInfo.findUnique.mockResolvedValue(mockUtilityInfo);

      await expect(service.create(propertyId, {})).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(propertyId, {})).rejects.toThrow(
        /already exists/,
      );
      expect(mockPrisma.utilityInfo.create).not.toHaveBeenCalled();
    });
  });

  describe('findByProperty', () => {
    it('should return utility info when found', async () => {
      mockPrisma.utilityInfo.findUnique.mockResolvedValue(mockUtilityInfo);

      const result = await service.findByProperty(propertyId);

      expect(result).toEqual(mockUtilityInfo);
      expect(mockPrisma.utilityInfo.findUnique).toHaveBeenCalledWith({
        where: { propertyId },
      });
    });

    it('should throw NotFoundException when utility info not found', async () => {
      mockPrisma.utilityInfo.findUnique.mockResolvedValue(null);

      await expect(service.findByProperty(propertyId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByProperty(propertyId)).rejects.toThrow(
        `Utility info for property ${propertyId} not found`,
      );
    });
  });

  describe('update', () => {
    it('should update utility info', async () => {
      const updateDto: UpdateUtilityInfoDto = {
        arnonaAccountNumber: '99999999',
        notes: 'Updated notes',
      };
      const updated = { ...mockUtilityInfo, ...updateDto };

      mockPrisma.utilityInfo.findUnique.mockResolvedValue(mockUtilityInfo);
      mockPrisma.utilityInfo.update.mockResolvedValue(updated);

      const result = await service.update(propertyId, updateDto);

      expect(mockPrisma.utilityInfo.update).toHaveBeenCalledWith({
        where: { propertyId },
        data: expect.objectContaining({
          arnonaAccountNumber: updateDto.arnonaAccountNumber,
          notes: updateDto.notes,
        }),
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when utility info not found', async () => {
      mockPrisma.utilityInfo.findUnique.mockResolvedValue(null);

      await expect(
        service.update(propertyId, { notes: 'Test' }),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrisma.utilityInfo.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete utility info', async () => {
      mockPrisma.utilityInfo.findUnique.mockResolvedValue(mockUtilityInfo);
      mockPrisma.utilityInfo.delete.mockResolvedValue(mockUtilityInfo);

      const result = await service.remove(propertyId);

      expect(mockPrisma.utilityInfo.delete).toHaveBeenCalledWith({
        where: { propertyId },
      });
      expect(result).toEqual(mockUtilityInfo);
    });

    it('should throw NotFoundException when utility info not found', async () => {
      mockPrisma.utilityInfo.findUnique.mockResolvedValue(null);

      await expect(service.remove(propertyId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.utilityInfo.delete).not.toHaveBeenCalled();
    });
  });
});
