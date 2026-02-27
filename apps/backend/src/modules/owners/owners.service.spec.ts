import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { OwnersService } from './owners.service';
import { PrismaService } from '../../database/prisma.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { QueryOwnerDto } from './dto/query-owner.dto';
import { OwnerType } from '@prisma/client';

const mockOwner = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'John Doe',
  type: OwnerType.INDIVIDUAL,
  idNumber: '123456789',
  email: 'john@example.com',
  phone: '050-1234567',
  address: '123 Main St',
  notes: 'Test notes',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('OwnersService', () => {
  let service: OwnersService;
  let prisma: PrismaService;

  const mockPrisma = {
    owner: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OwnersService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<OwnersService>(OwnersService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an owner', async () => {
      const dto: CreateOwnerDto = {
        name: 'John Doe',
        type: OwnerType.INDIVIDUAL,
        email: 'john@example.com',
      };

      mockPrisma.owner.create.mockResolvedValue(mockOwner);

      const result = await service.create(dto);

      expect(mockPrisma.owner.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          type: dto.type,
          idNumber: dto.idNumber,
          email: dto.email,
          phone: dto.phone,
          address: dto.address,
          notes: dto.notes,
        },
      });
      expect(result).toEqual(mockOwner);
    });

    it('should create owner with all optional fields', async () => {
      const dto: CreateOwnerDto = {
        name: 'Acme Corp',
        type: OwnerType.COMPANY,
        idNumber: '123456789',
        email: 'acme@example.com',
        phone: '03-1234567',
        address: '456 Business Ave',
        notes: 'Corporate owner',
      };

      const created = { ...mockOwner, ...dto };
      mockPrisma.owner.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(mockPrisma.owner.create).toHaveBeenCalledWith({
        data: dto,
      });
      expect(result.type).toBe(OwnerType.COMPANY);
    });
  });

  describe('findAll', () => {
    it('should return paginated owners', async () => {
      mockPrisma.owner.findMany.mockResolvedValue([mockOwner]);
      mockPrisma.owner.count.mockResolvedValue(1);

      const query: QueryOwnerDto = { page: 1, limit: 10 };
      const result = await service.findAll(query);

      expect(result).toEqual({
        data: [mockOwner],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });
      expect(mockPrisma.owner.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
          orderBy: { name: 'asc' },
        }),
      );
    });

    it('should filter by type when type is provided', async () => {
      mockPrisma.owner.findMany.mockResolvedValue([]);
      mockPrisma.owner.count.mockResolvedValue(0);

      await service.findAll({ type: OwnerType.COMPANY });

      expect(mockPrisma.owner.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { type: OwnerType.COMPANY },
        }),
      );
    });

    it('should search by name, email, phone when search is provided', async () => {
      mockPrisma.owner.findMany.mockResolvedValue([]);
      mockPrisma.owner.count.mockResolvedValue(0);

      await service.findAll({ search: 'john' });

      expect(mockPrisma.owner.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { name: { contains: 'john', mode: 'insensitive' } },
              { email: { contains: 'john', mode: 'insensitive' } },
              { phone: { contains: 'john', mode: 'insensitive' } },
            ],
          },
        }),
      );
    });

    it('should combine type filter and search', async () => {
      mockPrisma.owner.findMany.mockResolvedValue([]);
      mockPrisma.owner.count.mockResolvedValue(0);

      await service.findAll({
        type: OwnerType.PARTNERSHIP,
        search: 'smith',
      });

      expect(mockPrisma.owner.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            type: OwnerType.PARTNERSHIP,
            OR: [
              { name: { contains: 'smith', mode: 'insensitive' } },
              { email: { contains: 'smith', mode: 'insensitive' } },
              { phone: { contains: 'smith', mode: 'insensitive' } },
            ],
          },
        }),
      );
    });

    it('should calculate correct skip for pagination', async () => {
      mockPrisma.owner.findMany.mockResolvedValue([]);
      mockPrisma.owner.count.mockResolvedValue(50);

      await service.findAll({ page: 3, limit: 10 });

      expect(mockPrisma.owner.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return owner when found', async () => {
      mockPrisma.owner.findUnique.mockResolvedValue(mockOwner);

      const result = await service.findOne(mockOwner.id);

      expect(result).toEqual(mockOwner);
      expect(mockPrisma.owner.findUnique).toHaveBeenCalledWith({
        where: { id: mockOwner.id },
      });
    });

    it('should throw NotFoundException when owner not found', async () => {
      mockPrisma.owner.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        'Owner with id non-existent-id not found',
      );
    });
  });

  describe('update', () => {
    it('should update owner', async () => {
      const updateDto: UpdateOwnerDto = {
        name: 'John Updated',
        email: 'updated@example.com',
      };
      const updated = { ...mockOwner, ...updateDto };

      mockPrisma.owner.findUnique.mockResolvedValue(mockOwner);
      mockPrisma.owner.update.mockResolvedValue(updated);

      const result = await service.update(mockOwner.id, updateDto);

      expect(mockPrisma.owner.update).toHaveBeenCalledWith({
        where: { id: mockOwner.id },
        data: expect.objectContaining({
          name: updateDto.name,
          email: updateDto.email,
        }),
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when updating non-existent owner', async () => {
      mockPrisma.owner.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrisma.owner.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete owner when no ownerships', async () => {
      mockPrisma.owner.findUnique.mockResolvedValue({
        ...mockOwner,
        ownerships: [],
      });
      mockPrisma.owner.delete.mockResolvedValue(mockOwner);

      await service.remove(mockOwner.id);

      expect(mockPrisma.owner.delete).toHaveBeenCalledWith({
        where: { id: mockOwner.id },
      });
    });

    it('should throw ConflictException when owner has ownerships', async () => {
      mockPrisma.owner.findUnique.mockResolvedValue({
        ...mockOwner,
        ownerships: [{ id: 'owner-1' }],
      });

      await expect(service.remove(mockOwner.id)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.remove(mockOwner.id)).rejects.toThrow(
        /has 1 ownership\(s\)/,
      );
      expect(mockPrisma.owner.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when owner not found', async () => {
      mockPrisma.owner.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.owner.delete).not.toHaveBeenCalled();
    });
  });
});
