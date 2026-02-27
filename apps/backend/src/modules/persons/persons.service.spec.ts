import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { PersonsService } from './persons.service';
import { PrismaService } from '../../database/prisma.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { QueryPersonDto } from './dto/query-person.dto';

describe('PersonsService', () => {
  let service: PersonsService;
  let prisma: PrismaService;

  const mockPerson = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'יוסי כהן',
    idNumber: '123456789',
    email: 'yossi@example.com',
    phone: '050-1234567',
    notes: 'Test notes',
    createdAt: new Date('2025-02-27T10:00:00.000Z'),
    updatedAt: new Date('2025-02-27T10:00:00.000Z'),
  };

  const mockPrismaService = {
    person: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PersonsService>(PersonsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a person with required fields', async () => {
      const dto: CreatePersonDto = {
        name: 'יוסי כהן',
      };
      mockPrismaService.person.create.mockResolvedValue(mockPerson);

      const result = await service.create(dto);

      expect(prisma.person.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          idNumber: undefined,
          email: undefined,
          phone: undefined,
          notes: undefined,
        },
      });
      expect(result).toEqual(mockPerson);
    });

    it('should create a person with all optional fields', async () => {
      const dto: CreatePersonDto = {
        name: 'יוסי כהן',
        idNumber: '123456789',
        email: 'yossi@example.com',
        phone: '050-1234567',
        notes: 'Test notes',
      };
      mockPrismaService.person.create.mockResolvedValue(mockPerson);

      const result = await service.create(dto);

      expect(prisma.person.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          idNumber: dto.idNumber,
          email: dto.email,
          phone: dto.phone,
          notes: dto.notes,
        },
      });
      expect(result).toEqual(mockPerson);
    });
  });

  describe('findAll', () => {
    it('should return paginated list with default params', async () => {
      mockPrismaService.person.findMany.mockResolvedValue([mockPerson]);
      mockPrismaService.person.count.mockResolvedValue(1);

      const result = await service.findAll({});

      expect(prisma.person.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { name: 'asc' },
      });
      expect(prisma.person.count).toHaveBeenCalledWith({ where: {} });
      expect(result).toEqual({
        data: [mockPerson],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });
    });

    it('should apply pagination correctly', async () => {
      mockPrismaService.person.findMany.mockResolvedValue([]);
      mockPrismaService.person.count.mockResolvedValue(25);

      const result = await service.findAll({
        page: 2,
        limit: 10,
      });

      expect(prisma.person.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 10,
        take: 10,
        orderBy: { name: 'asc' },
      });
      expect(result.meta).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
      });
    });

    it('should apply search filter for name, email, phone', async () => {
      mockPrismaService.person.findMany.mockResolvedValue([mockPerson]);
      mockPrismaService.person.count.mockResolvedValue(1);

      await service.findAll({ search: 'יוסי' });

      expect(prisma.person.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { name: { contains: 'יוסי', mode: 'insensitive' } },
              { email: { contains: 'יוסי', mode: 'insensitive' } },
              { phone: { contains: 'יוסי', mode: 'insensitive' } },
            ],
          },
        }),
      );
    });

    it('should ignore empty search string', async () => {
      mockPrismaService.person.findMany.mockResolvedValue([]);
      mockPrismaService.person.count.mockResolvedValue(0);

      await service.findAll({ search: '   ' });

      expect(prisma.person.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return person when found', async () => {
      mockPrismaService.person.findUnique.mockResolvedValue(mockPerson);

      const result = await service.findOne(mockPerson.id);

      expect(prisma.person.findUnique).toHaveBeenCalledWith({
        where: { id: mockPerson.id },
      });
      expect(result).toEqual(mockPerson);
    });

    it('should throw NotFoundException when person not found', async () => {
      mockPrismaService.person.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        'Person with id non-existent-id not found',
      );
    });
  });

  describe('update', () => {
    it('should update person when found', async () => {
      const dto: UpdatePersonDto = { name: 'Updated Name' };
      const updatedPerson = { ...mockPerson, name: 'Updated Name' };
      mockPrismaService.person.findUnique.mockResolvedValue(mockPerson);
      mockPrismaService.person.update.mockResolvedValue(updatedPerson);

      const result = await service.update(mockPerson.id, dto);

      expect(prisma.person.update).toHaveBeenCalledWith({
        where: { id: mockPerson.id },
        data: { name: 'Updated Name' },
      });
      expect(result).toEqual(updatedPerson);
    });

    it('should throw NotFoundException when person not found', async () => {
      mockPrismaService.person.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.person.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete person when no relations exist', async () => {
      mockPrismaService.person.findUnique.mockResolvedValue({
        ...mockPerson,
        mortgageOwnerOf: [],
        mortgagePayerOf: [],
        tenantsOf: [],
        ownershipsOf: [],
      });
      mockPrismaService.person.delete.mockResolvedValue(mockPerson);

      const result = await service.remove(mockPerson.id);

      expect(prisma.person.delete).toHaveBeenCalledWith({
        where: { id: mockPerson.id },
      });
      expect(result).toEqual(mockPerson);
    });

    it('should throw NotFoundException when person not found', async () => {
      mockPrismaService.person.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.person.delete).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when person has mortgage as owner', async () => {
      mockPrismaService.person.findUnique.mockResolvedValue({
        ...mockPerson,
        mortgageOwnerOf: [{ id: 'mortgage-1' }],
        mortgagePayerOf: [],
        tenantsOf: [],
        ownershipsOf: [],
      });

      await expect(service.remove(mockPerson.id)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.remove(mockPerson.id)).rejects.toThrow(
        /mortgages \(as owner\)/,
      );
      expect(prisma.person.delete).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when person has mortgage as payer', async () => {
      mockPrismaService.person.findUnique.mockResolvedValue({
        ...mockPerson,
        mortgageOwnerOf: [],
        mortgagePayerOf: [{ id: 'mortgage-1' }],
        tenantsOf: [],
        ownershipsOf: [],
      });

      await expect(service.remove(mockPerson.id)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.remove(mockPerson.id)).rejects.toThrow(
        /mortgages \(as payer\)/,
      );
      expect(prisma.person.delete).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when person has rental agreements', async () => {
      mockPrismaService.person.findUnique.mockResolvedValue({
        ...mockPerson,
        mortgageOwnerOf: [],
        mortgagePayerOf: [],
        tenantsOf: [{ id: 'agreement-1' }],
        ownershipsOf: [],
      });

      await expect(service.remove(mockPerson.id)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.remove(mockPerson.id)).rejects.toThrow(
        /rental agreements/,
      );
      expect(prisma.person.delete).not.toHaveBeenCalled();
    });
  });
});
