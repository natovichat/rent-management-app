import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { OwnershipsService } from './ownerships.service';
import { PrismaService } from '../../database/prisma.service';
import { CreateOwnershipDto } from './dto/create-ownership.dto';
import { UpdateOwnershipDto } from './dto/update-ownership.dto';
import { OwnershipType } from '@prisma/client';

const mockPropertyId = '550e8400-e29b-41d4-a716-446655440001';
const mockOwnerId = '550e8400-e29b-41d4-a716-446655440002';
const mockOwnershipId = '550e8400-e29b-41d4-a716-446655440003';

const mockOwnership = {
  id: mockOwnershipId,
  propertyId: mockPropertyId,
  ownerId: mockOwnerId,
  ownershipPercentage: 50,
  ownershipType: OwnershipType.REAL,
  managementFee: 500,
  familyDivision: false,
  startDate: new Date('2025-01-01'),
  endDate: null,
  notes: 'Test notes',
  createdAt: new Date(),
  updatedAt: new Date(),
  owner: { id: mockOwnerId, name: 'John Doe', type: 'INDIVIDUAL' },
  property: { id: mockPropertyId, address: '123 Main St' },
};

describe('OwnershipsService', () => {
  let service: OwnershipsService;
  let prisma: PrismaService;

  const mockPrisma = {
    ownership: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    property: {
      findUnique: jest.fn(),
    },
    owner: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OwnershipsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<OwnershipsService>(OwnershipsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();

    mockPrisma.property.findUnique.mockResolvedValue({ id: mockPropertyId });
    mockPrisma.owner.findUnique.mockResolvedValue({ id: mockOwnerId });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateOwnershipDto = {
      ownerId: mockOwnerId,
      ownershipPercentage: 50,
      ownershipType: OwnershipType.REAL,
      startDate: '2025-01-01',
      familyDivision: false,
    };

    it('should create an ownership', async () => {
      mockPrisma.ownership.create.mockResolvedValue(mockOwnership);

      const result = await service.create(mockPropertyId, createDto);

      expect(mockPrisma.property.findUnique).toHaveBeenCalledWith({
        where: { id: mockPropertyId },
      });
      expect(mockPrisma.owner.findUnique).toHaveBeenCalledWith({
        where: { id: mockOwnerId },
      });
      expect(mockPrisma.ownership.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          propertyId: mockPropertyId,
          ownerId: mockOwnerId,
          ownershipPercentage: 50,
          ownershipType: OwnershipType.REAL,
          familyDivision: false,
        }),
        include: expect.any(Object),
      });
      expect(result).toEqual(mockOwnership);
    });

    it('should throw NotFoundException when property does not exist', async () => {
      mockPrisma.property.findUnique.mockResolvedValue(null);

      await expect(
        service.create(mockPropertyId, createDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.create(mockPropertyId, createDto),
      ).rejects.toThrow(/Property.*not found/);
      expect(mockPrisma.ownership.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when owner does not exist', async () => {
      mockPrisma.owner.findUnique.mockResolvedValue(null);

      await expect(
        service.create(mockPropertyId, createDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.create(mockPropertyId, createDto),
      ).rejects.toThrow(/Owner.*not found/);
      expect(mockPrisma.ownership.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when percentage is negative', async () => {
      const invalidDto = { ...createDto, ownershipPercentage: -1 };

      await expect(
        service.create(mockPropertyId, invalidDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.create(mockPropertyId, invalidDto),
      ).rejects.toThrow(/0 and 100/);
      expect(mockPrisma.ownership.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when percentage exceeds 100', async () => {
      const invalidDto = { ...createDto, ownershipPercentage: 101 };

      await expect(
        service.create(mockPropertyId, invalidDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.create(mockPropertyId, invalidDto),
      ).rejects.toThrow(/0 and 100/);
      expect(mockPrisma.ownership.create).not.toHaveBeenCalled();
    });

    it('should create ownership with optional fields', async () => {
      const fullDto: CreateOwnershipDto = {
        ...createDto,
        endDate: '2030-12-31',
        managementFee: 500,
        notes: 'Full ownership',
      };
      mockPrisma.ownership.create.mockResolvedValue(mockOwnership);

      await service.create(mockPropertyId, fullDto);

      expect(mockPrisma.ownership.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          endDate: new Date('2030-12-31'),
          managementFee: 500,
          notes: 'Full ownership',
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('findByProperty', () => {
    it('should return ownerships for property', async () => {
      mockPrisma.ownership.findMany.mockResolvedValue([mockOwnership]);

      const result = await service.findByProperty(mockPropertyId);

      expect(mockPrisma.property.findUnique).toHaveBeenCalledWith({
        where: { id: mockPropertyId },
      });
      expect(mockPrisma.ownership.findMany).toHaveBeenCalledWith({
        where: { propertyId: mockPropertyId },
        include: expect.any(Object),
        orderBy: { startDate: 'desc' },
      });
      expect(result).toEqual([mockOwnership]);
    });

    it('should throw NotFoundException when property does not exist', async () => {
      mockPrisma.property.findUnique.mockResolvedValue(null);

      await expect(
        service.findByProperty(mockPropertyId),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrisma.ownership.findMany).not.toHaveBeenCalled();
    });
  });

  describe('findByOwner', () => {
    it('should return ownerships for owner', async () => {
      mockPrisma.ownership.findMany.mockResolvedValue([mockOwnership]);

      const result = await service.findByOwner(mockOwnerId);

      expect(mockPrisma.owner.findUnique).toHaveBeenCalledWith({
        where: { id: mockOwnerId },
      });
      expect(mockPrisma.ownership.findMany).toHaveBeenCalledWith({
        where: { ownerId: mockOwnerId },
        include: expect.any(Object),
        orderBy: { startDate: 'desc' },
      });
      expect(result).toEqual([mockOwnership]);
    });

    it('should throw NotFoundException when owner does not exist', async () => {
      mockPrisma.owner.findUnique.mockResolvedValue(null);

      await expect(service.findByOwner(mockOwnerId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.ownership.findMany).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return ownership when found', async () => {
      mockPrisma.ownership.findUnique.mockResolvedValue(mockOwnership);

      const result = await service.findOne(mockOwnershipId);

      expect(result).toEqual(mockOwnership);
      expect(mockPrisma.ownership.findUnique).toHaveBeenCalledWith({
        where: { id: mockOwnershipId },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when ownership not found', async () => {
      mockPrisma.ownership.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        /Ownership with id non-existent-id not found/,
      );
    });
  });

  describe('validateTotalOwnership', () => {
    it('should return isValid true when total is 100', async () => {
      mockPrisma.ownership.findMany.mockResolvedValue([
        { ownershipPercentage: 60 },
        { ownershipPercentage: 40 },
      ]);

      const result = await service.validateTotalOwnership(mockPropertyId);

      expect(result).toEqual({
        isValid: true,
        totalPercentage: 100,
        message: expect.stringContaining('100'),
      });
    });

    it('should return isValid false when total is not 100', async () => {
      mockPrisma.ownership.findMany.mockResolvedValue([
        { ownershipPercentage: 60 },
        { ownershipPercentage: 50 },
      ]);

      const result = await service.validateTotalOwnership(mockPropertyId);

      expect(result.isValid).toBe(false);
      expect(result.totalPercentage).toBe(110);
      expect(result.message).toContain('expected 100%');
    });

    it('should only include active ownerships (endDate null or future)', async () => {
      const now = new Date();
      mockPrisma.ownership.findMany.mockResolvedValue([]);

      await service.validateTotalOwnership(mockPropertyId);

      expect(mockPrisma.ownership.findMany).toHaveBeenCalledWith({
        where: {
          propertyId: mockPropertyId,
          OR: [{ endDate: null }, { endDate: { gt: now } }],
        },
        select: { ownershipPercentage: true },
      });
    });

    it('should throw NotFoundException when property does not exist', async () => {
      mockPrisma.property.findUnique.mockResolvedValue(null);

      await expect(
        service.validateTotalOwnership(mockPropertyId),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrisma.ownership.findMany).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateDto: UpdateOwnershipDto = {
      ownershipPercentage: 75,
      notes: 'Updated notes',
    };

    it('should update ownership', async () => {
      const updated = { ...mockOwnership, ...updateDto };
      mockPrisma.ownership.findUnique.mockResolvedValue(mockOwnership);
      mockPrisma.ownership.update.mockResolvedValue(updated);

      const result = await service.update(mockOwnershipId, updateDto);

      expect(mockPrisma.ownership.update).toHaveBeenCalledWith({
        where: { id: mockOwnershipId },
        data: expect.objectContaining({
          ownershipPercentage: 75,
          notes: 'Updated notes',
        }),
        include: expect.any(Object),
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when ownership not found', async () => {
      mockPrisma.ownership.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', updateDto),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrisma.ownership.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when percentage is invalid', async () => {
      mockPrisma.ownership.findUnique.mockResolvedValue(mockOwnership);

      await expect(
        service.update(mockOwnershipId, { ownershipPercentage: 150 }),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrisma.ownership.update).not.toHaveBeenCalled();
    });

    it('should verify owner exists when updating ownerId', async () => {
      mockPrisma.ownership.findUnique.mockResolvedValue(mockOwnership);
      mockPrisma.owner.findUnique.mockResolvedValue({ id: 'new-owner-id' });
      mockPrisma.ownership.update.mockResolvedValue(mockOwnership);

      await service.update(mockOwnershipId, { ownerId: 'new-owner-id' });

      expect(mockPrisma.owner.findUnique).toHaveBeenCalledWith({
        where: { id: 'new-owner-id' },
      });
    });
  });

  describe('remove', () => {
    it('should delete ownership', async () => {
      mockPrisma.ownership.findUnique.mockResolvedValue(mockOwnership);
      mockPrisma.ownership.delete.mockResolvedValue(mockOwnership);

      await service.remove(mockOwnershipId);

      expect(mockPrisma.ownership.delete).toHaveBeenCalledWith({
        where: { id: mockOwnershipId },
      });
    });

    it('should throw NotFoundException when ownership not found', async () => {
      mockPrisma.ownership.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.ownership.delete).not.toHaveBeenCalled();
    });
  });
});
