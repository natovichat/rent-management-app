import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OwnershipsService } from './ownerships.service';
import { PrismaService } from '../../database/prisma.service';
import { CreateOwnershipDto } from './dto/create-ownership.dto';
import { UpdateOwnershipDto } from './dto/update-ownership.dto';
import { OwnershipType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

describe('OwnershipsService', () => {
  let service: OwnershipsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    property: {
      findFirst: jest.fn(),
    },
    owner: {
      findFirst: jest.fn(),
    },
    propertyOwnership: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockAccountId = 'account-1';
  const mockPropertyId = 'property-1';
  const mockOwnerId = 'owner-1';
  const mockOwnershipId = 'ownership-1';

  const mockProperty = {
    id: mockPropertyId,
    accountId: mockAccountId,
    address: 'Test Address',
    fileNumber: 'PROP-001',
  };

  const mockOwner = {
    id: mockOwnerId,
    accountId: mockAccountId,
    name: 'יוסי כהן',
    type: 'INDIVIDUAL',
  };

  const mockOwnership = {
    id: mockOwnershipId,
    propertyId: mockPropertyId,
    ownerId: mockOwnerId,
    accountId: mockAccountId,
    ownershipPercentage: new Decimal(100),
    ownershipType: OwnershipType.FULL,
    startDate: new Date('2024-01-01'),
    endDate: null,
    notes: 'Test ownership',
    owner: mockOwner,
    property: mockProperty,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OwnershipsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<OwnershipsService>(OwnershipsService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('findAllByProperty', () => {
    it('should return all ownerships for a property', async () => {
      const mockOwnerships = [mockOwnership];
      mockPrismaService.property.findFirst.mockResolvedValue(mockProperty);
      mockPrismaService.propertyOwnership.findMany.mockResolvedValue(mockOwnerships);

      const result = await service.findAllByProperty(mockPropertyId, mockAccountId);

      expect(result).toEqual(mockOwnerships);
      expect(prismaService.property.findFirst).toHaveBeenCalledWith({
        where: { id: mockPropertyId, accountId: mockAccountId },
      });
      expect(prismaService.propertyOwnership.findMany).toHaveBeenCalledWith({
        where: {
          propertyId: mockPropertyId,
          accountId: mockAccountId,
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          property: {
            select: {
              id: true,
              address: true,
              fileNumber: true,
            },
          },
        },
        orderBy: { startDate: 'desc' },
      });
    });

    it('should throw NotFoundException when property not found', async () => {
      mockPrismaService.property.findFirst.mockResolvedValue(null);

      await expect(
        service.findAllByProperty(mockPropertyId, mockAccountId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should enforce account isolation', async () => {
      const otherAccountId = 'account-2';
      mockPrismaService.property.findFirst.mockResolvedValue(null);

      await expect(
        service.findAllByProperty(mockPropertyId, otherAccountId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto: CreateOwnershipDto = {
      propertyId: mockPropertyId,
      ownerId: mockOwnerId,
      ownershipPercentage: 100,
      ownershipType: OwnershipType.FULL,
      startDate: '2024-01-01T00:00:00Z',
      notes: 'Test ownership',
    };

    it('should create ownership with 100% validation', async () => {
      mockPrismaService.property.findFirst.mockResolvedValue(mockProperty);
      mockPrismaService.owner.findFirst.mockResolvedValue(mockOwner);
      mockPrismaService.propertyOwnership.findMany.mockResolvedValue([]); // No existing ownerships
      mockPrismaService.propertyOwnership.create.mockResolvedValue(mockOwnership);

      const result = await service.create(createDto, mockAccountId);

      expect(result).toEqual(mockOwnership);
      expect(prismaService.propertyOwnership.create).toHaveBeenCalled();
    });

    it('should validate total percentage equals 100%', async () => {
      mockPrismaService.property.findFirst.mockResolvedValue(mockProperty);
      mockPrismaService.owner.findFirst.mockResolvedValue(mockOwner);
      mockPrismaService.propertyOwnership.findMany.mockResolvedValue([]);

      await service.create(createDto, mockAccountId);

      expect(prismaService.propertyOwnership.findMany).toHaveBeenCalledWith({
        where: {
          propertyId: mockPropertyId,
          accountId: mockAccountId,
          endDate: null,
        },
        select: {
          id: true,
          ownershipPercentage: true,
        },
      });
    });

    it('should throw BadRequestException when total exceeds 100%', async () => {
      const existingOwnership = {
        id: 'existing-1',
        ownershipPercentage: new Decimal(50),
      };
      mockPrismaService.property.findFirst.mockResolvedValue(mockProperty);
      mockPrismaService.owner.findFirst.mockResolvedValue(mockOwner);
      mockPrismaService.propertyOwnership.findMany.mockResolvedValue([
        existingOwnership,
      ]);

      await expect(
        service.create({ ...createDto, ownershipPercentage: 60 }, mockAccountId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when total under 100%', async () => {
      mockPrismaService.property.findFirst.mockResolvedValue(mockProperty);
      mockPrismaService.owner.findFirst.mockResolvedValue(mockOwner);
      mockPrismaService.propertyOwnership.findMany.mockResolvedValue([]);

      await expect(
        service.create({ ...createDto, ownershipPercentage: 50 }, mockAccountId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow small floating point differences (0.01)', async () => {
      mockPrismaService.property.findFirst.mockResolvedValue(mockProperty);
      mockPrismaService.owner.findFirst.mockResolvedValue(mockOwner);
      mockPrismaService.propertyOwnership.findMany.mockResolvedValue([]);
      mockPrismaService.propertyOwnership.create.mockResolvedValue(mockOwnership);

      // 100.00 should be allowed (exactly 100%)
      await service.create(
        { ...createDto, ownershipPercentage: 100.0 },
        mockAccountId,
      );

      expect(prismaService.propertyOwnership.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when property not found', async () => {
      mockPrismaService.property.findFirst.mockResolvedValue(null);

      await expect(
        service.create(createDto, mockAccountId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when owner not found', async () => {
      mockPrismaService.property.findFirst.mockResolvedValue(mockProperty);
      mockPrismaService.owner.findFirst.mockResolvedValue(null);

      await expect(
        service.create(createDto, mockAccountId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateOwnershipDto = {
      ownershipPercentage: 50,
    };

    it('should update ownership with 100% validation', async () => {
      const existingOwnership = {
        ...mockOwnership,
        ownershipPercentage: new Decimal(100),
      };
      const otherOwnership = {
        id: 'other-1',
        ownershipPercentage: new Decimal(50),
      };

      mockPrismaService.propertyOwnership.findFirst.mockResolvedValue(
        existingOwnership,
      );
      mockPrismaService.propertyOwnership.findMany.mockResolvedValue([
        otherOwnership,
      ]);
      mockPrismaService.propertyOwnership.update.mockResolvedValue({
        ...existingOwnership,
        ownershipPercentage: new Decimal(50),
      });

      const result = await service.update(
        mockOwnershipId,
        updateDto,
        mockAccountId,
      );

      expect(result.ownershipPercentage.toNumber()).toBe(50);
      expect(prismaService.propertyOwnership.update).toHaveBeenCalled();
    });

    it('should validate total percentage equals 100% on update', async () => {
      const existingOwnership = {
        ...mockOwnership,
        ownershipPercentage: new Decimal(100),
      };
      mockPrismaService.propertyOwnership.findFirst.mockResolvedValue(
        existingOwnership,
      );
      mockPrismaService.propertyOwnership.findMany.mockResolvedValue([]);

      await service.update(
        mockOwnershipId,
        { ownershipPercentage: 100 },
        mockAccountId,
      );

      // Should exclude current ownership from calculation
      expect(prismaService.propertyOwnership.findMany).toHaveBeenCalledWith({
        where: {
          propertyId: mockPropertyId,
          accountId: mockAccountId,
          endDate: null,
          NOT: { id: mockOwnershipId },
        },
        select: {
          id: true,
          ownershipPercentage: true,
        },
      });
    });

    it('should throw BadRequestException when update exceeds 100%', async () => {
      const existingOwnership = {
        ...mockOwnership,
        ownershipPercentage: new Decimal(50),
      };
      const otherOwnership = {
        id: 'other-1',
        ownershipPercentage: new Decimal(60),
      };

      mockPrismaService.propertyOwnership.findFirst.mockResolvedValue(
        existingOwnership,
      );
      mockPrismaService.propertyOwnership.findMany.mockResolvedValue([
        otherOwnership,
      ]);

      await expect(
        service.update(
          mockOwnershipId,
          { ownershipPercentage: 50 },
          mockAccountId,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should verify property belongs to account when updating propertyId', async () => {
      const existingOwnership = {
        ...mockOwnership,
        ownershipPercentage: new Decimal(100),
      };
      const newPropertyId = 'property-2';
      const newProperty = { ...mockProperty, id: newPropertyId };

      mockPrismaService.propertyOwnership.findFirst.mockResolvedValue(
        existingOwnership,
      );
      mockPrismaService.property.findFirst.mockResolvedValue(newProperty);
      mockPrismaService.propertyOwnership.findMany.mockResolvedValue([]);
      mockPrismaService.propertyOwnership.update.mockResolvedValue({
        ...existingOwnership,
        propertyId: newPropertyId,
      });

      await service.update(
        mockOwnershipId,
        { propertyId: newPropertyId },
        mockAccountId,
      );

      expect(prismaService.property.findFirst).toHaveBeenCalledWith({
        where: { id: newPropertyId, accountId: mockAccountId },
      });
    });

    it('should verify owner belongs to account when updating ownerId', async () => {
      const existingOwnership = {
        ...mockOwnership,
        ownershipPercentage: new Decimal(100),
      };
      const newOwnerId = 'owner-2';

      mockPrismaService.propertyOwnership.findFirst.mockResolvedValue(
        existingOwnership,
      );
      mockPrismaService.owner.findFirst.mockResolvedValue({
        ...mockOwner,
        id: newOwnerId,
      });
      mockPrismaService.propertyOwnership.findMany.mockResolvedValue([]);
      mockPrismaService.propertyOwnership.update.mockResolvedValue({
        ...existingOwnership,
        ownerId: newOwnerId,
      });

      await service.update(
        mockOwnershipId,
        { ownerId: newOwnerId },
        mockAccountId,
      );

      expect(prismaService.owner.findFirst).toHaveBeenCalledWith({
        where: { id: newOwnerId, accountId: mockAccountId },
      });
    });
  });

  describe('validateTotalPercentage', () => {
    it('should pass validation when total equals 100%', async () => {
      const existingOwnerships = [
        { id: '1', ownershipPercentage: new Decimal(50) },
        { id: '2', ownershipPercentage: new Decimal(50) },
      ];
      mockPrismaService.propertyOwnership.findMany.mockResolvedValue(
        existingOwnerships,
      );

      await expect(
        service.validateTotalPercentage(
          mockPropertyId,
          mockAccountId,
          0,
          undefined,
        ),
      ).resolves.not.toThrow();
    });

    it('should throw BadRequestException when total exceeds 100%', async () => {
      const existingOwnerships = [
        { id: '1', ownershipPercentage: new Decimal(60) },
      ];
      mockPrismaService.propertyOwnership.findMany.mockResolvedValue(
        existingOwnerships,
      );

      await expect(
        service.validateTotalPercentage(
          mockPropertyId,
          mockAccountId,
          50,
          undefined,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when total under 100%', async () => {
      mockPrismaService.propertyOwnership.findMany.mockResolvedValue([]);

      await expect(
        service.validateTotalPercentage(
          mockPropertyId,
          mockAccountId,
          50,
          undefined,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should exclude ownership from calculation when excludeOwnershipId provided', async () => {
      const existingOwnerships = [
        { id: '1', ownershipPercentage: new Decimal(50) },
      ];
      mockPrismaService.propertyOwnership.findMany.mockResolvedValue(
        existingOwnerships,
      );

      await service.validateTotalPercentage(
        mockPropertyId,
        mockAccountId,
        50,
        'excluded-id',
      );

      expect(prismaService.propertyOwnership.findMany).toHaveBeenCalledWith({
        where: {
          propertyId: mockPropertyId,
          accountId: mockAccountId,
          endDate: null,
          NOT: { id: 'excluded-id' },
        },
        select: {
          id: true,
          ownershipPercentage: true,
        },
      });
    });

    it('should only consider active ownerships (endDate is null)', async () => {
      mockPrismaService.propertyOwnership.findMany.mockResolvedValue([]);

      await service.validateTotalPercentage(
        mockPropertyId,
        mockAccountId,
        100,
        undefined,
      );

      expect(prismaService.propertyOwnership.findMany).toHaveBeenCalledWith({
        where: {
          propertyId: mockPropertyId,
          accountId: mockAccountId,
          endDate: null,
        },
        select: {
          id: true,
          ownershipPercentage: true,
        },
      });
    });
  });
});
