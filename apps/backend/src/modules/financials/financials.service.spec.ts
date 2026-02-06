import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FinancialsService } from './financials.service';
import { PrismaService } from '../../database/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { ExpenseType, IncomeType } from '@prisma/client';
import { Prisma } from '@prisma/client';

describe('FinancialsService', () => {
  let service: FinancialsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    property: {
      findFirst: jest.fn(),
    },
    propertyExpense: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      aggregate: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    propertyIncome: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      aggregate: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockAccountId = 'account-1';
  const mockPropertyId = 'property-1';
  const mockExpenseId = 'expense-1';
  const mockIncomeId = 'income-1';

  const mockProperty = {
    id: mockPropertyId,
    accountId: mockAccountId,
    address: 'Test Address',
  };

  const mockExpense = {
    id: mockExpenseId,
    propertyId: mockPropertyId,
    accountId: mockAccountId,
    expenseDate: new Date('2024-01-01'),
    amount: 1000,
    type: ExpenseType.MAINTENANCE,
    category: ExpenseType.MAINTENANCE,
    description: 'Test expense',
    property: {
      id: mockPropertyId,
      address: mockProperty.address,
    },
  };

  const mockIncome = {
    id: mockIncomeId,
    propertyId: mockPropertyId,
    accountId: mockAccountId,
    incomeDate: new Date('2024-01-01'),
    amount: 5000,
    type: IncomeType.RENT,
    source: 'Rent payment',
    description: 'Monthly rent',
    property: {
      id: mockPropertyId,
      address: mockProperty.address,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinancialsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FinancialsService>(FinancialsService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('findAllExpenses', () => {
    it('should return all expenses for an account', async () => {
      const mockExpenses = [mockExpense];
      mockPrismaService.propertyExpense.findMany.mockResolvedValue(mockExpenses);

      const result = await service.findAllExpenses(mockAccountId);

      expect(result).toEqual(mockExpenses);
      expect(prismaService.propertyExpense.findMany).toHaveBeenCalledWith({
        where: {
          accountId: mockAccountId,
        },
        include: {
          property: {
            select: {
              id: true,
              address: true,
            },
          },
        },
        orderBy: {
          expenseDate: 'desc',
        },
      });
    });

    it('should filter expenses by propertyId', async () => {
      const filters = { propertyId: mockPropertyId };
      mockPrismaService.propertyExpense.findMany.mockResolvedValue([mockExpense]);

      await service.findAllExpenses(mockAccountId, filters);

      expect(prismaService.propertyExpense.findMany).toHaveBeenCalledWith({
        where: {
          accountId: mockAccountId,
          propertyId: mockPropertyId,
        },
        include: {
          property: {
            select: {
              id: true,
              address: true,
            },
          },
        },
        orderBy: {
          expenseDate: 'desc',
        },
      });
    });

    it('should filter expenses by date range', async () => {
      const filters = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };
      mockPrismaService.propertyExpense.findMany.mockResolvedValue([mockExpense]);

      await service.findAllExpenses(mockAccountId, filters);

      expect(prismaService.propertyExpense.findMany).toHaveBeenCalledWith({
        where: {
          accountId: mockAccountId,
          expenseDate: {
            gte: new Date(filters.startDate),
            lte: new Date(filters.endDate),
          },
        },
        include: {
          property: {
            select: {
              id: true,
              address: true,
            },
          },
        },
        orderBy: {
          expenseDate: 'desc',
        },
      });
    });

    it('should enforce account isolation', async () => {
      const otherAccountId = 'account-2';
      mockPrismaService.propertyExpense.findMany.mockResolvedValue([]);

      await service.findAllExpenses(otherAccountId);

      expect(prismaService.propertyExpense.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            accountId: otherAccountId,
          }),
        }),
      );
    });
  });

  describe('findExpensesByProperty', () => {
    it('should return all expenses for a property', async () => {
      const mockExpenses = [mockExpense];
      mockPrismaService.property.findFirst.mockResolvedValue(mockProperty);
      mockPrismaService.propertyExpense.findMany.mockResolvedValue(mockExpenses);

      const result = await service.findExpensesByProperty(
        mockPropertyId,
        mockAccountId,
      );

      expect(result).toEqual(mockExpenses);
      expect(prismaService.property.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockPropertyId,
          accountId: mockAccountId,
        },
      });
    });

    it('should throw NotFoundException when property not found', async () => {
      mockPrismaService.property.findFirst.mockResolvedValue(null);

      await expect(
        service.findExpensesByProperty(mockPropertyId, mockAccountId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createExpense', () => {
    const createDto: CreateExpenseDto = {
      propertyId: mockPropertyId,
      expenseDate: '2024-01-01T00:00:00Z',
      amount: 1000,
      expenseType: ExpenseType.MAINTENANCE,
      category: 'תחזוקה כללית',
      description: 'Test expense',
    };

    it('should create an expense successfully', async () => {
      mockPrismaService.property.findFirst.mockResolvedValue(mockProperty);
      mockPrismaService.propertyExpense.create.mockResolvedValue(mockExpense);

      const result = await service.createExpense(createDto, mockAccountId);

      expect(result).toEqual(mockExpense);
      expect(prismaService.propertyExpense.create).toHaveBeenCalledWith({
        data: {
          propertyId: createDto.propertyId,
          accountId: mockAccountId,
          expenseDate: new Date(createDto.expenseDate),
          amount: createDto.amount,
          type: createDto.expenseType,
          category: createDto.expenseType,
          description: createDto.description,
        },
        include: {
          property: {
            select: {
              id: true,
              address: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException when property not found', async () => {
      mockPrismaService.property.findFirst.mockResolvedValue(null);

      await expect(
        service.createExpense(createDto, mockAccountId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllIncome', () => {
    it('should return all income for an account', async () => {
      const mockIncomes = [mockIncome];
      mockPrismaService.propertyIncome.findMany.mockResolvedValue(mockIncomes);

      const result = await service.findAllIncome(mockAccountId);

      expect(result).toEqual(mockIncomes);
      expect(prismaService.propertyIncome.findMany).toHaveBeenCalledWith({
        where: {
          accountId: mockAccountId,
        },
        include: {
          property: {
            select: {
              id: true,
              address: true,
            },
          },
        },
        orderBy: {
          incomeDate: 'desc',
        },
      });
    });

    it('should filter income by propertyId', async () => {
      const filters = { propertyId: mockPropertyId };
      mockPrismaService.propertyIncome.findMany.mockResolvedValue([mockIncome]);

      await service.findAllIncome(mockAccountId, filters);

      expect(prismaService.propertyIncome.findMany).toHaveBeenCalledWith({
        where: {
          accountId: mockAccountId,
          propertyId: mockPropertyId,
        },
        include: {
          property: {
            select: {
              id: true,
              address: true,
            },
          },
        },
        orderBy: {
          incomeDate: 'desc',
        },
      });
    });

    it('should filter income by date range', async () => {
      const filters = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };
      mockPrismaService.propertyIncome.findMany.mockResolvedValue([mockIncome]);

      await service.findAllIncome(mockAccountId, filters);

      expect(prismaService.propertyIncome.findMany).toHaveBeenCalledWith({
        where: {
          accountId: mockAccountId,
          incomeDate: {
            gte: new Date(filters.startDate),
            lte: new Date(filters.endDate),
          },
        },
        include: {
          property: {
            select: {
              id: true,
              address: true,
            },
          },
        },
        orderBy: {
          incomeDate: 'desc',
        },
      });
    });
  });

  describe('findIncomeByProperty', () => {
    it('should return all income for a property', async () => {
      const mockIncomes = [mockIncome];
      mockPrismaService.property.findFirst.mockResolvedValue(mockProperty);
      mockPrismaService.propertyIncome.findMany.mockResolvedValue(mockIncomes);

      const result = await service.findIncomeByProperty(
        mockPropertyId,
        mockAccountId,
      );

      expect(result).toEqual(mockIncomes);
    });

    it('should throw NotFoundException when property not found', async () => {
      mockPrismaService.property.findFirst.mockResolvedValue(null);

      await expect(
        service.findIncomeByProperty(mockPropertyId, mockAccountId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createIncome', () => {
    const createDto: CreateIncomeDto = {
      propertyId: mockPropertyId,
      incomeDate: '2024-01-01T00:00:00Z',
      amount: 5000,
      incomeType: IncomeType.RENT,
      description: 'Monthly rent',
    };

    it('should create an income entry successfully', async () => {
      mockPrismaService.property.findFirst.mockResolvedValue(mockProperty);
      mockPrismaService.propertyIncome.create.mockResolvedValue(mockIncome);

      const result = await service.createIncome(createDto, mockAccountId);

      expect(result).toEqual(mockIncome);
      expect(prismaService.propertyIncome.create).toHaveBeenCalledWith({
        data: {
          propertyId: createDto.propertyId,
          accountId: mockAccountId,
          incomeDate: new Date(createDto.incomeDate),
          amount: createDto.amount,
          type: createDto.incomeType,
          source: createDto.description,
          description: createDto.description,
        },
        include: {
          property: {
            select: {
              id: true,
              address: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException when property not found', async () => {
      mockPrismaService.property.findFirst.mockResolvedValue(null);

      await expect(
        service.createIncome(createDto, mockAccountId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getFinancialSummary', () => {
    it('should return financial summary with totals', async () => {
      const mockExpenseAggregate = {
        _sum: {
          amount: 5000,
        },
      };
      const mockIncomeAggregate = {
        _sum: {
          amount: 15000,
        },
      };

      mockPrismaService.propertyExpense.aggregate.mockResolvedValue(
        mockExpenseAggregate,
      );
      mockPrismaService.propertyIncome.aggregate.mockResolvedValue(
        mockIncomeAggregate,
      );

      const result = await service.getFinancialSummary(mockAccountId);

      expect(result).toEqual({
        totalIncome: 15000,
        totalExpenses: 5000,
        net: 10000,
      });
    });

    it('should handle null aggregate sums', async () => {
      mockPrismaService.propertyExpense.aggregate.mockResolvedValue({
        _sum: { amount: null },
      });
      mockPrismaService.propertyIncome.aggregate.mockResolvedValue({
        _sum: { amount: null },
      });

      const result = await service.getFinancialSummary(mockAccountId);

      expect(result).toEqual({
        totalIncome: 0,
        totalExpenses: 0,
        net: 0,
      });
    });

    it('should filter by date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';

      mockPrismaService.propertyExpense.aggregate.mockResolvedValue({
        _sum: { amount: 5000 },
      });
      mockPrismaService.propertyIncome.aggregate.mockResolvedValue({
        _sum: { amount: 15000 },
      });

      const result = await service.getFinancialSummary(
        mockAccountId,
        startDate,
        endDate,
      );

      expect(result).toMatchObject({
        totalIncome: 15000,
        totalExpenses: 5000,
        net: 10000,
        startDate,
        endDate,
      });

      expect(prismaService.propertyExpense.aggregate).toHaveBeenCalledWith({
        where: {
          accountId: mockAccountId,
          expenseDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        _sum: {
          amount: true,
        },
      });
    });

    it('should calculate net correctly (negative when expenses exceed income)', async () => {
      mockPrismaService.propertyExpense.aggregate.mockResolvedValue({
        _sum: { amount: 20000 },
      });
      mockPrismaService.propertyIncome.aggregate.mockResolvedValue({
        _sum: { amount: 10000 },
      });

      const result = await service.getFinancialSummary(mockAccountId);

      expect(result.net).toBe(-10000);
    });
  });

  describe('getPropertyFinancials', () => {
    it('should return property financials with summary', async () => {
      const mockExpenses = [mockExpense];
      const mockIncomes = [mockIncome];
      const mockExpenseAggregate = {
        _sum: { amount: 1000 },
      };
      const mockIncomeAggregate = {
        _sum: { amount: 5000 },
      };

      mockPrismaService.property.findFirst.mockResolvedValue(mockProperty);
      mockPrismaService.propertyExpense.findMany.mockResolvedValue(mockExpenses);
      mockPrismaService.propertyIncome.findMany.mockResolvedValue(mockIncomes);
      mockPrismaService.propertyExpense.aggregate.mockResolvedValue(
        mockExpenseAggregate,
      );
      mockPrismaService.propertyIncome.aggregate.mockResolvedValue(
        mockIncomeAggregate,
      );

      const result = await service.getPropertyFinancials(
        mockPropertyId,
        mockAccountId,
      );

      expect(result).toMatchObject({
        property: {
          id: mockPropertyId,
          address: mockProperty.address,
        },
        expenses: mockExpenses,
        income: mockIncomes,
        summary: {
          totalIncome: 5000,
          totalExpenses: 1000,
          net: 4000,
        },
      });
    });

    it('should throw NotFoundException when property not found', async () => {
      mockPrismaService.property.findFirst.mockResolvedValue(null);

      await expect(
        service.getPropertyFinancials(mockPropertyId, mockAccountId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return empty arrays when no expenses or income', async () => {
      mockPrismaService.property.findFirst.mockResolvedValue(mockProperty);
      mockPrismaService.propertyExpense.findMany.mockResolvedValue([]);
      mockPrismaService.propertyIncome.findMany.mockResolvedValue([]);
      mockPrismaService.propertyExpense.aggregate.mockResolvedValue({
        _sum: { amount: null },
      });
      mockPrismaService.propertyIncome.aggregate.mockResolvedValue({
        _sum: { amount: null },
      });

      const result = await service.getPropertyFinancials(
        mockPropertyId,
        mockAccountId,
      );

      expect(result.expenses).toEqual([]);
      expect(result.income).toEqual([]);
      expect(result.summary.totalIncome).toBe(0);
      expect(result.summary.totalExpenses).toBe(0);
      expect(result.summary.net).toBe(0);
    });
  });

  describe('updateExpense', () => {
    const updateDto: UpdateExpenseDto = {
      amount: 1500,
      description: 'Updated expense',
    };

    it('should update an expense successfully', async () => {
      mockPrismaService.propertyExpense.findFirst.mockResolvedValue(mockExpense);
      mockPrismaService.propertyExpense.update.mockResolvedValue({
        ...mockExpense,
        ...updateDto,
      });

      const result = await service.updateExpense(
        mockExpenseId,
        updateDto,
        mockAccountId,
      );

      expect(result).toMatchObject(updateDto);
    });

    it('should throw NotFoundException when expense not found', async () => {
      mockPrismaService.propertyExpense.findFirst.mockResolvedValue(null);

      await expect(
        service.updateExpense(mockExpenseId, updateDto, mockAccountId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should verify property when updating propertyId', async () => {
      const newPropertyId = 'property-2';
      const updateDtoWithProperty = {
        ...updateDto,
        propertyId: newPropertyId,
      };

      mockPrismaService.propertyExpense.findFirst.mockResolvedValue(mockExpense);
      mockPrismaService.property.findFirst.mockResolvedValue({
        ...mockProperty,
        id: newPropertyId,
      });
      mockPrismaService.propertyExpense.update.mockResolvedValue({
        ...mockExpense,
        propertyId: newPropertyId,
      });

      await service.updateExpense(
        mockExpenseId,
        updateDtoWithProperty,
        mockAccountId,
      );

      expect(prismaService.property.findFirst).toHaveBeenCalledWith({
        where: {
          id: newPropertyId,
          accountId: mockAccountId,
        },
      });
    });
  });

  describe('updateIncome', () => {
    const updateDto: UpdateIncomeDto = {
      amount: 6000,
      description: 'Updated income',
    };

    it('should update an income entry successfully', async () => {
      mockPrismaService.propertyIncome.findFirst.mockResolvedValue(mockIncome);
      mockPrismaService.propertyIncome.update.mockResolvedValue({
        ...mockIncome,
        ...updateDto,
      });

      const result = await service.updateIncome(
        mockIncomeId,
        updateDto,
        mockAccountId,
      );

      expect(result).toMatchObject(updateDto);
    });

    it('should throw NotFoundException when income not found', async () => {
      mockPrismaService.propertyIncome.findFirst.mockResolvedValue(null);

      await expect(
        service.updateIncome(mockIncomeId, updateDto, mockAccountId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeExpense', () => {
    it('should delete an expense successfully', async () => {
      mockPrismaService.propertyExpense.findFirst.mockResolvedValue(mockExpense);
      mockPrismaService.propertyExpense.delete.mockResolvedValue(mockExpense);

      const result = await service.removeExpense(mockExpenseId, mockAccountId);

      expect(result).toEqual({ message: 'Expense deleted successfully' });
    });

    it('should throw NotFoundException when expense not found', async () => {
      mockPrismaService.propertyExpense.findFirst.mockResolvedValue(null);

      await expect(
        service.removeExpense(mockExpenseId, mockAccountId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeIncome', () => {
    it('should delete an income entry successfully', async () => {
      mockPrismaService.propertyIncome.findFirst.mockResolvedValue(mockIncome);
      mockPrismaService.propertyIncome.delete.mockResolvedValue(mockIncome);

      const result = await service.removeIncome(mockIncomeId, mockAccountId);

      expect(result).toEqual({ message: 'Income deleted successfully' });
    });

    it('should throw NotFoundException when income not found', async () => {
      mockPrismaService.propertyIncome.findFirst.mockResolvedValue(null);

      await expect(
        service.removeIncome(mockIncomeId, mockAccountId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
