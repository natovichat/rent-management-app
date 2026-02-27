import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { MortgagesService } from './mortgages.service';
import { PrismaService } from '../../database/prisma.service';
import { CreateMortgageDto } from './dto/create-mortgage.dto';
import { UpdateMortgageDto } from './dto/update-mortgage.dto';
import { QueryMortgageDto } from './dto/query-mortgage.dto';
import { MortgageStatus } from '@prisma/client';

const mockMortgage = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  propertyId: '550e8400-e29b-41d4-a716-446655440001',
  bank: 'בנק לאומי',
  loanAmount: 1000000,
  interestRate: 3.5,
  monthlyPayment: 5000,
  earlyRepaymentPenalty: 10000,
  bankAccountId: '550e8400-e29b-41d4-a716-446655440002',
  mortgageOwnerId: '550e8400-e29b-41d4-a716-446655440003',
  payerId: '550e8400-e29b-41d4-a716-446655440004',
  startDate: new Date('2025-01-01'),
  endDate: new Date('2040-12-31'),
  status: MortgageStatus.ACTIVE,
  linkedProperties: [],
  notes: 'Test mortgage',
  createdAt: new Date(),
  updatedAt: new Date(),
  property: null,
  bankAccount: null,
  mortgageOwner: null,
  payer: { id: '550e8400-e29b-41d4-a716-446655440004', name: 'John' },
};

describe('MortgagesService', () => {
  let service: MortgagesService;
  let prisma: PrismaService;

  const mockPrisma = {
    mortgage: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    property: {
      findUnique: jest.fn(),
    },
    bankAccount: {
      findUnique: jest.fn(),
    },
    person: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MortgagesService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<MortgagesService>(MortgagesService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a mortgage', async () => {
      const dto: CreateMortgageDto = {
        bank: 'בנק לאומי',
        loanAmount: 1000000,
        payerId: '550e8400-e29b-41d4-a716-446655440004',
        startDate: '2025-01-01',
        status: MortgageStatus.ACTIVE,
      };

      mockPrisma.person.findUnique.mockResolvedValue({ id: dto.payerId });
      mockPrisma.mortgage.create.mockResolvedValue(mockMortgage);

      const result = await service.create(dto);

      expect(mockPrisma.person.findUnique).toHaveBeenCalledWith({
        where: { id: dto.payerId },
      });
      expect(mockPrisma.mortgage.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          bank: dto.bank,
          loanAmount: dto.loanAmount,
          startDate: new Date(dto.startDate),
          status: dto.status,
          linkedProperties: [],
        }),
        include: expect.any(Object),
      });
      expect(result).toEqual(mockMortgage);
    });

    it('should validate payer exists', async () => {
      const dto: CreateMortgageDto = {
        bank: 'בנק לאומי',
        loanAmount: 1000000,
        payerId: 'non-existent-payer',
        startDate: '2025-01-01',
        status: MortgageStatus.ACTIVE,
      };

      mockPrisma.person.findUnique.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(/payer.*not found/);
      expect(mockPrisma.mortgage.create).not.toHaveBeenCalled();
    });

    it('should validate property exists when provided', async () => {
      const dto: CreateMortgageDto = {
        bank: 'בנק לאומי',
        loanAmount: 1000000,
        payerId: '550e8400-e29b-41d4-a716-446655440004',
        propertyId: 'non-existent-property',
        startDate: '2025-01-01',
        status: MortgageStatus.ACTIVE,
      };

      mockPrisma.person.findUnique.mockResolvedValue({ id: dto.payerId });
      mockPrisma.property.findUnique.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(/Property.*not found/);
      expect(mockPrisma.mortgage.create).not.toHaveBeenCalled();
    });

    it('should create mortgage with all optional fields', async () => {
      const dto: CreateMortgageDto = {
        bank: 'בנק הפועלים',
        loanAmount: 500000,
        payerId: '550e8400-e29b-41d4-a716-446655440004',
        propertyId: '550e8400-e29b-41d4-a716-446655440001',
        bankAccountId: '550e8400-e29b-41d4-a716-446655440002',
        mortgageOwnerId: '550e8400-e29b-41d4-a716-446655440003',
        startDate: '2025-01-01',
        endDate: '2040-12-31',
        status: MortgageStatus.ACTIVE,
        interestRate: 3.5,
        monthlyPayment: 2500,
        earlyRepaymentPenalty: 5000,
        linkedProperties: ['550e8400-e29b-41d4-a716-446655440001'],
        notes: 'Full mortgage',
      };

      mockPrisma.person.findUnique.mockResolvedValue({ id: dto.payerId });
      mockPrisma.property.findUnique.mockResolvedValue({ id: dto.propertyId });
      mockPrisma.bankAccount.findUnique.mockResolvedValue({
        id: dto.bankAccountId,
      });
      mockPrisma.person.findUnique
        .mockResolvedValueOnce({ id: dto.payerId })
        .mockResolvedValueOnce({ id: dto.mortgageOwnerId });
      mockPrisma.mortgage.create.mockResolvedValue(mockMortgage);

      await service.create(dto);

      expect(mockPrisma.mortgage.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          bank: dto.bank,
          loanAmount: dto.loanAmount,
          interestRate: dto.interestRate,
          monthlyPayment: dto.monthlyPayment,
          earlyRepaymentPenalty: dto.earlyRepaymentPenalty,
          linkedProperties: dto.linkedProperties,
          notes: dto.notes,
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated mortgages', async () => {
      mockPrisma.mortgage.findMany.mockResolvedValue([mockMortgage]);
      mockPrisma.mortgage.count.mockResolvedValue(1);

      const query: QueryMortgageDto = { page: 1, limit: 20 };
      const result = await service.findAll(query);

      expect(result).toEqual({
        data: [mockMortgage],
        meta: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      });
      expect(mockPrisma.mortgage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('should filter by status when provided', async () => {
      mockPrisma.mortgage.findMany.mockResolvedValue([]);
      mockPrisma.mortgage.count.mockResolvedValue(0);

      await service.findAll({ status: MortgageStatus.ACTIVE });

      expect(mockPrisma.mortgage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: MortgageStatus.ACTIVE },
        }),
      );
    });

    it('should filter by propertyId when provided', async () => {
      mockPrisma.mortgage.findMany.mockResolvedValue([]);
      mockPrisma.mortgage.count.mockResolvedValue(0);

      await service.findAll({
        propertyId: '550e8400-e29b-41d4-a716-446655440001',
      });

      expect(mockPrisma.mortgage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { propertyId: '550e8400-e29b-41d4-a716-446655440001' },
              { linkedProperties: { has: '550e8400-e29b-41d4-a716-446655440001' } },
            ],
          },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return mortgage when found', async () => {
      mockPrisma.mortgage.findUnique.mockResolvedValue(mockMortgage);

      const result = await service.findOne(mockMortgage.id);

      expect(result).toEqual(mockMortgage);
      expect(mockPrisma.mortgage.findUnique).toHaveBeenCalledWith({
        where: { id: mockMortgage.id },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when mortgage not found', async () => {
      mockPrisma.mortgage.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        'Mortgage with ID non-existent-id not found',
      );
    });
  });

  describe('findByProperty', () => {
    it('should return mortgages for property', async () => {
      mockPrisma.property.findUnique.mockResolvedValue({ id: 'prop-1' });
      mockPrisma.mortgage.findMany.mockResolvedValue([mockMortgage]);

      const result = await service.findByProperty('prop-1');

      expect(result).toEqual([mockMortgage]);
      expect(mockPrisma.property.findUnique).toHaveBeenCalledWith({
        where: { id: 'prop-1' },
      });
      expect(mockPrisma.mortgage.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { propertyId: 'prop-1' },
            { linkedProperties: { has: 'prop-1' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when property not found', async () => {
      mockPrisma.property.findUnique.mockResolvedValue(null);

      await expect(service.findByProperty('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByProperty('non-existent')).rejects.toThrow(
        'Property with ID non-existent not found',
      );
      expect(mockPrisma.mortgage.findMany).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update mortgage', async () => {
      const updateDto: UpdateMortgageDto = {
        bank: 'בנק מזרחי',
        notes: 'Updated',
      };
      const updated = { ...mockMortgage, ...updateDto };

      mockPrisma.mortgage.findUnique.mockResolvedValue(mockMortgage);
      mockPrisma.mortgage.update.mockResolvedValue(updated);

      const result = await service.update(mockMortgage.id, updateDto);

      expect(mockPrisma.mortgage.update).toHaveBeenCalledWith({
        where: { id: mockMortgage.id },
        data: expect.objectContaining({
          bank: updateDto.bank,
          notes: updateDto.notes,
        }),
        include: expect.any(Object),
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when updating non-existent mortgage', async () => {
      mockPrisma.mortgage.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { bank: 'Test' }),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrisma.mortgage.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete mortgage', async () => {
      mockPrisma.mortgage.findUnique.mockResolvedValue(mockMortgage);
      mockPrisma.mortgage.delete.mockResolvedValue(mockMortgage);

      const result = await service.remove(mockMortgage.id);

      expect(mockPrisma.mortgage.delete).toHaveBeenCalledWith({
        where: { id: mockMortgage.id },
      });
      expect(result).toEqual(mockMortgage);
    });

    it('should throw NotFoundException when mortgage not found', async () => {
      mockPrisma.mortgage.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.mortgage.delete).not.toHaveBeenCalled();
    });
  });
});
