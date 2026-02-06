import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { OwnersService } from './owners.service';
import { PrismaService } from '../../database/prisma.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { OwnerType } from '@prisma/client';

describe('OwnersService', () => {
  let service: OwnersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    owner: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    propertyOwnership: {
      count: jest.fn(),
    },
  };

  const mockAccountId = 'account-1';
  const mockOwnerId = 'owner-1';
  const mockOwner = {
    id: mockOwnerId,
    accountId: mockAccountId,
    name: 'יוסי כהן',
    type: OwnerType.INDIVIDUAL,
    email: 'owner@example.com',
    phone: '050-1234567',
    idNumber: '123456789',
    notes: 'Test owner',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: {
      ownerships: 0,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OwnersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<OwnersService>(OwnersService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all owners for an account', async () => {
      const mockOwners = [mockOwner];
      mockPrismaService.owner.findMany.mockResolvedValue(mockOwners);

      const result = await service.findAll(mockAccountId);

      expect(result).toEqual(mockOwners);
      expect(prismaService.owner.findMany).toHaveBeenCalledWith({
        where: { accountId: mockAccountId },
        include: {
          _count: {
            select: { ownerships: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no owners exist', async () => {
      mockPrismaService.owner.findMany.mockResolvedValue([]);

      const result = await service.findAll(mockAccountId);

      expect(result).toEqual([]);
      expect(prismaService.owner.findMany).toHaveBeenCalled();
    });

    it('should enforce account isolation', async () => {
      const otherAccountId = 'account-2';
      mockPrismaService.owner.findMany.mockResolvedValue([]);

      await service.findAll(otherAccountId);

      expect(prismaService.owner.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { accountId: otherAccountId },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return an owner by ID', async () => {
      mockPrismaService.owner.findFirst.mockResolvedValue(mockOwner);

      const result = await service.findOne(mockOwnerId, mockAccountId);

      expect(result).toEqual(mockOwner);
      expect(prismaService.owner.findFirst).toHaveBeenCalledWith({
        where: { id: mockOwnerId, accountId: mockAccountId },
        include: {
          _count: {
            select: { ownerships: true },
          },
        },
      });
    });

    it('should throw NotFoundException when owner not found', async () => {
      mockPrismaService.owner.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne(mockOwnerId, mockAccountId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should enforce account validation', async () => {
      const otherAccountId = 'account-2';
      mockPrismaService.owner.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne(mockOwnerId, otherAccountId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto: CreateOwnerDto = {
      name: 'יוסי כהן',
      type: OwnerType.INDIVIDUAL,
      email: 'owner@example.com',
      phone: '050-1234567',
      idNumber: '123456789',
      notes: 'Test owner',
    };

    it('should create an owner successfully', async () => {
      mockPrismaService.owner.findFirst.mockResolvedValue(null); // No existing owner
      mockPrismaService.owner.create.mockResolvedValue({
        ...mockOwner,
        ownershipCount: 0,
      });

      const result = await service.create(createDto, mockAccountId);

      expect(result).toMatchObject({
        name: createDto.name,
        type: createDto.type,
        email: createDto.email,
        ownershipCount: 0,
      });
      expect(prismaService.owner.create).toHaveBeenCalled();
    });

    it('should throw ConflictException when email already exists', async () => {
      mockPrismaService.owner.findFirst.mockResolvedValue(mockOwner);

      await expect(
        service.create(createDto, mockAccountId),
      ).rejects.toThrow(ConflictException);
      expect(prismaService.owner.create).not.toHaveBeenCalled();
    });

    it('should check email uniqueness per account', async () => {
      const otherAccountId = 'account-2';
      mockPrismaService.owner.findFirst.mockResolvedValue(null); // No owner in other account
      mockPrismaService.owner.create.mockResolvedValue(mockOwner);

      await service.create(createDto, otherAccountId);

      expect(prismaService.owner.findFirst).toHaveBeenCalledWith({
        where: {
          accountId: otherAccountId,
          email: createDto.email,
        },
      });
    });

    it('should handle owner without email', async () => {
      const dtoWithoutEmail = { ...createDto };
      delete dtoWithoutEmail.email;
      mockPrismaService.owner.findFirst.mockResolvedValue(null);
      mockPrismaService.owner.create.mockResolvedValue(mockOwner);

      await service.create(dtoWithoutEmail, mockAccountId);

      expect(prismaService.owner.findFirst).not.toHaveBeenCalled();
      expect(prismaService.owner.create).toHaveBeenCalled();
    });

    it('should use idNumber if provided, otherwise taxId', async () => {
      const dtoWithTaxId = { ...createDto };
      delete dtoWithTaxId.idNumber;
      dtoWithTaxId.taxId = '987654321';
      mockPrismaService.owner.findFirst.mockResolvedValue(null);
      mockPrismaService.owner.create.mockResolvedValue(mockOwner);

      await service.create(dtoWithTaxId, mockAccountId);

      expect(prismaService.owner.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          idNumber: '987654321',
        }),
        include: {
          _count: {
            select: { ownerships: true },
          },
        },
      });
    });
  });

  describe('update', () => {
    const updateDto: UpdateOwnerDto = {
      name: 'Updated Name',
      email: 'updated@example.com',
    };

    it('should update an owner successfully', async () => {
      mockPrismaService.owner.findFirst
        .mockResolvedValueOnce(mockOwner) // verifyOwnership
        .mockResolvedValueOnce(null); // email uniqueness check
      mockPrismaService.owner.update.mockResolvedValue({
        ...mockOwner,
        ...updateDto,
      });

      const result = await service.update(mockOwnerId, mockAccountId, updateDto);

      expect(result).toMatchObject(updateDto);
      expect(prismaService.owner.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when owner not found', async () => {
      mockPrismaService.owner.findFirst.mockResolvedValue(null);

      await expect(
        service.update(mockOwnerId, mockAccountId, updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when email already exists', async () => {
      const existingOwner = { ...mockOwner, id: 'other-owner-id' };
      mockPrismaService.owner.findFirst
        .mockResolvedValueOnce(mockOwner) // verifyOwnership
        .mockResolvedValueOnce(existingOwner); // email check

      await expect(
        service.update(mockOwnerId, mockAccountId, updateDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should handle taxId to idNumber mapping', async () => {
      const updateDtoWithTaxId: UpdateOwnerDto = {
        taxId: '987654321',
      };
      mockPrismaService.owner.findFirst.mockResolvedValue(mockOwner);
      mockPrismaService.owner.update.mockResolvedValue(mockOwner);

      await service.update(mockOwnerId, mockAccountId, updateDtoWithTaxId);

      expect(prismaService.owner.update).toHaveBeenCalledWith({
        where: { id: mockOwnerId },
        data: expect.objectContaining({
          idNumber: '987654321',
        }),
      });
    });
  });

  describe('remove', () => {
    it('should delete an owner successfully', async () => {
      mockPrismaService.owner.findFirst.mockResolvedValue(mockOwner);
      mockPrismaService.propertyOwnership.count.mockResolvedValue(0);
      mockPrismaService.owner.delete.mockResolvedValue(mockOwner);

      const result = await service.remove(mockOwnerId, mockAccountId);

      expect(result).toEqual({ message: 'Owner deleted successfully' });
      expect(prismaService.owner.delete).toHaveBeenCalledWith({
        where: { id: mockOwnerId },
      });
    });

    it('should throw NotFoundException when owner not found', async () => {
      mockPrismaService.owner.findFirst.mockResolvedValue(null);

      await expect(
        service.remove(mockOwnerId, mockAccountId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when owner has ownerships', async () => {
      mockPrismaService.owner.findFirst.mockResolvedValue(mockOwner);
      mockPrismaService.propertyOwnership.count.mockResolvedValue(2);

      await expect(
        service.remove(mockOwnerId, mockAccountId),
      ).rejects.toThrow(ForbiddenException);
      expect(prismaService.owner.delete).not.toHaveBeenCalled();
    });

    it('should check ownership count before deletion', async () => {
      mockPrismaService.owner.findFirst.mockResolvedValue(mockOwner);
      mockPrismaService.propertyOwnership.count.mockResolvedValue(0);

      await service.remove(mockOwnerId, mockAccountId);

      expect(prismaService.propertyOwnership.count).toHaveBeenCalledWith({
        where: {
          ownerId: mockOwnerId,
        },
      });
    });
  });
});
