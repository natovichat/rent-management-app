import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { MortgagesService } from './mortgages.service';
import { PrismaService } from '../../database/prisma.service';
import { CreateMortgageDto } from './dto/create-mortgage.dto';
import { UpdateMortgageDto } from './dto/update-mortgage.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { MortgageStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

describe('MortgagesService', () => {
  let service: MortgagesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    property: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    mortgage: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    mortgagePayment: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockAccountId = 'account-1';
  const mockPropertyId = 'property-1';
  const mockMortgageId = 'mortgage-1';

  const mockProperty = {
    id: mockPropertyId,
    accountId: mockAccountId,
    address: 'Test Address',
  };

  const mockMortgage = {
    id: mockMortgageId,
    propertyId: mockPropertyId,
    accountId: mockAccountId,
    bank: 'Bank Hapoalim',
    loanAmount: new Prisma.Decimal(1000000),
    interestRate: new Prisma.Decimal(3.5),
    monthlyPayment: new Prisma.Decimal(5000),
    startDate: new Date('2024-01-01'),
    endDate: null,
    status: MortgageStatus.ACTIVE,
    linkedProperties: [],
    notes: 'Test mortgage',
    property: mockProperty,
    payments: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MortgagesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MortgagesService>(MortgagesService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all mortgages for an account', async () => {
      const mockMortgages = [mockMortgage];
      mockPrismaService.mortgage.findMany.mockResolvedValue(mockMortgages);

      const result = await service.findAll(mockAccountId);

      expect(result).toEqual(mockMortgages);
      expect(prismaService.mortgage.findMany).toHaveBeenCalledWith({
        where: { accountId: mockAccountId },
        include: {
          property: true,
          payments: {
            orderBy: {
              paymentDate: 'desc',
            },
          },
        },
        orderBy: {
          startDate: 'desc',
        },
      });
    });

    it('should return empty array when no mortgages exist', async () => {
      mockPrismaService.mortgage.findMany.mockResolvedValue([]);

      const result = await service.findAll(mockAccountId);

      expect(result).toEqual([]);
    });

    it('should enforce account isolation', async () => {
      const otherAccountId = 'account-2';
      mockPrismaService.mortgage.findMany.mockResolvedValue([]);

      await service.findAll(otherAccountId);

      expect(prismaService.mortgage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { accountId: otherAccountId },
        }),
      );
    });
  });

  describe('findAllByProperty', () => {
    it('should return all mortgages for a property', async () => {
      const mockMortgages = [mockMortgage];
      mockPrismaService.property.findFirst.mockResolvedValue(mockProperty);
      mockPrismaService.mortgage.findMany.mockResolvedValue(mockMortgages);

      const result = await service.findAllByProperty(
        mockPropertyId,
        mockAccountId,
      );

      expect(result).toEqual(mockMortgages);
      expect(prismaService.property.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockPropertyId,
          accountId: mockAccountId,
        },
      });
      expect(prismaService.mortgage.findMany).toHaveBeenCalledWith({
        where: {
          propertyId: mockPropertyId,
          accountId: mockAccountId,
        },
        include: {
          property: true,
          payments: {
            orderBy: {
              paymentDate: 'desc',
            },
          },
        },
        orderBy: {
          startDate: 'desc',
        },
      });
    });

    it('should throw NotFoundException when property not found', async () => {
      mockPrismaService.property.findFirst.mockResolvedValue(null);

      await expect(
        service.findAllByProperty(mockPropertyId, mockAccountId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto: CreateMortgageDto = {
      propertyId: mockPropertyId,
      bank: 'Bank Hapoalim',
      loanAmount: 1000000,
      interestRate: 3.5,
      monthlyPayment: 5000,
      startDate: '2024-01-01T00:00:00Z',
      status: MortgageStatus.ACTIVE,
      notes: 'Test mortgage',
    };

    it('should create a mortgage with property validation', async () => {
      mockPrismaService.property.findFirst.mockResolvedValue(mockProperty);
      mockPrismaService.mortgage.create.mockResolvedValue(mockMortgage);

      const result = await service.create(createDto, mockAccountId);

      expect(result).toEqual(mockMortgage);
      expect(prismaService.property.findFirst).toHaveBeenCalledWith({
        where: {
          id: createDto.propertyId,
          accountId: mockAccountId,
        },
      });
      expect(prismaService.mortgage.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when property not found', async () => {
      mockPrismaService.property.findFirst.mockResolvedValue(null);

      await expect(
        service.create(createDto, mockAccountId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should validate linked properties if provided', async () => {
      const linkedPropertyId = 'property-2';
      const linkedProperty = {
        id: linkedPropertyId,
        accountId: mockAccountId,
        address: 'Linked Property',
      };
      const dtoWithLinked = {
        ...createDto,
        linkedProperties: [linkedPropertyId],
      };

      mockPrismaService.property.findFirst.mockResolvedValue(mockProperty);
      mockPrismaService.property.findMany.mockResolvedValue([linkedProperty]);
      mockPrismaService.mortgage.create.mockResolvedValue({
        ...mockMortgage,
        linkedProperties: [linkedPropertyId],
      });

      const result = await service.create(dtoWithLinked, mockAccountId);

      expect(prismaService.property.findMany).toHaveBeenCalledWith({
        where: {
          id: { in: [linkedPropertyId] },
          accountId: mockAccountId,
        },
      });
      expect(result.linkedProperties).toEqual([linkedPropertyId]);
    });

    it('should throw BadRequestException when linked property not found', async () => {
      const dtoWithLinked = {
        ...createDto,
        linkedProperties: ['non-existent-property'],
      };

      mockPrismaService.property.findFirst.mockResolvedValue(mockProperty);
      mockPrismaService.property.findMany.mockResolvedValue([]);

      await expect(
        service.create(dtoWithLinked, mockAccountId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle optional fields', async () => {
      const dtoMinimal = {
        propertyId: mockPropertyId,
        bank: 'Bank Hapoalim',
        loanAmount: 1000000,
        startDate: '2024-01-01T00:00:00Z',
        status: MortgageStatus.ACTIVE,
      };

      mockPrismaService.property.findFirst.mockResolvedValue(mockProperty);
      mockPrismaService.mortgage.create.mockResolvedValue(mockMortgage);

      await service.create(dtoMinimal, mockAccountId);

      expect(prismaService.mortgage.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          interestRate: null,
          monthlyPayment: null,
          linkedProperties: [],
        }),
        include: {
          property: true,
          payments: true,
        },
      });
    });
  });

  describe('addPayment', () => {
    const createPaymentDto: CreatePaymentDto = {
      paymentDate: '2024-02-01T00:00:00Z',
      amount: 5000,
      principal: 3000,
      interest: 2000,
      notes: 'Monthly payment',
    };

    it('should add a payment to a mortgage', async () => {
      const mockPayment = {
        id: 'payment-1',
        mortgageId: mockMortgageId,
        accountId: mockAccountId,
        paymentDate: new Date(createPaymentDto.paymentDate),
        amount: new Prisma.Decimal(createPaymentDto.amount),
        principal: new Prisma.Decimal(createPaymentDto.principal!),
        interest: new Prisma.Decimal(createPaymentDto.interest!),
        notes: createPaymentDto.notes,
        mortgage: mockMortgage,
      };

      mockPrismaService.mortgage.findFirst.mockResolvedValue(mockMortgage);
      mockPrismaService.mortgagePayment.create.mockResolvedValue(mockPayment);

      const result = await service.addPayment(
        mockMortgageId,
        createPaymentDto,
        mockAccountId,
      );

      expect(result).toEqual(mockPayment);
      expect(prismaService.mortgage.findFirst).toHaveBeenCalledWith({
        where: { id: mockMortgageId, accountId: mockAccountId },
        include: {
          property: true,
          payments: {
            orderBy: {
              paymentDate: 'desc',
            },
          },
        },
      });
      expect(prismaService.mortgagePayment.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when mortgage not found', async () => {
      mockPrismaService.mortgage.findFirst.mockResolvedValue(null);

      await expect(
        service.addPayment(mockMortgageId, createPaymentDto, mockAccountId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle payment without principal and interest', async () => {
      const paymentDtoWithoutBreakdown = {
        paymentDate: '2024-02-01T00:00:00Z',
        amount: 5000,
        notes: 'Payment without breakdown',
      };

      mockPrismaService.mortgage.findFirst.mockResolvedValue(mockMortgage);
      mockPrismaService.mortgagePayment.create.mockResolvedValue({
        id: 'payment-1',
        principal: null,
        interest: null,
      });

      await service.addPayment(
        mockMortgageId,
        paymentDtoWithoutBreakdown,
        mockAccountId,
      );

      expect(prismaService.mortgagePayment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          principal: null,
          interest: null,
        }),
        include: {
          mortgage: {
            include: {
              property: true,
            },
          },
        },
      });
    });
  });

  describe('calculateRemainingBalance', () => {
    it('should calculate remaining balance correctly', async () => {
      const mockPayments = [
        {
          principal: new Prisma.Decimal(100000),
        },
        {
          principal: new Prisma.Decimal(50000),
        },
      ];

      mockPrismaService.mortgage.findFirst.mockResolvedValue(mockMortgage);
      mockPrismaService.mortgagePayment.findMany.mockResolvedValue(mockPayments);

      const result = await service.calculateRemainingBalance(
        mockMortgageId,
        mockAccountId,
      );

      expect(result).toMatchObject({
        mortgageId: mockMortgageId,
        loanAmount: 1000000,
        totalPrincipalPaid: 150000,
        remainingBalance: 850000,
        totalPayments: 2,
      });
    });

    it('should return loan amount when no payments exist', async () => {
      mockPrismaService.mortgage.findFirst.mockResolvedValue(mockMortgage);
      mockPrismaService.mortgagePayment.findMany.mockResolvedValue([]);

      const result = await service.calculateRemainingBalance(
        mockMortgageId,
        mockAccountId,
      );

      expect(result).toMatchObject({
        loanAmount: 1000000,
        totalPrincipalPaid: 0,
        remainingBalance: 1000000,
        totalPayments: 0,
      });
    });

    it('should only consider payments with principal', async () => {
      const mockPayments = [
        {
          principal: new Prisma.Decimal(100000),
        },
        {
          principal: null, // Should be ignored
        },
        {
          principal: new Prisma.Decimal(50000),
        },
      ];

      mockPrismaService.mortgage.findFirst.mockResolvedValue(mockMortgage);
      mockPrismaService.mortgagePayment.findMany.mockResolvedValue(mockPayments);

      const result = await service.calculateRemainingBalance(
        mockMortgageId,
        mockAccountId,
      );

      expect(result.totalPrincipalPaid).toBe(150000);
      expect(result.totalPayments).toBe(3); // All payments counted, but only principal ones summed
    });

    it('should throw NotFoundException when mortgage not found', async () => {
      mockPrismaService.mortgage.findFirst.mockResolvedValue(null);

      await expect(
        service.calculateRemainingBalance(mockMortgageId, mockAccountId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should filter payments by mortgageId and accountId', async () => {
      mockPrismaService.mortgage.findFirst.mockResolvedValue(mockMortgage);
      mockPrismaService.mortgagePayment.findMany.mockResolvedValue([]);

      await service.calculateRemainingBalance(mockMortgageId, mockAccountId);

      expect(prismaService.mortgagePayment.findMany).toHaveBeenCalledWith({
        where: {
          mortgageId: mockMortgageId,
          accountId: mockAccountId,
          principal: { not: null },
        },
        select: {
          principal: true,
        },
      });
    });
  });
});
