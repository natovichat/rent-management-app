import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { Prisma } from '@prisma/client';

/**
 * Service for managing financials (expenses and income).
 * 
 * Handles CRUD operations for expenses and income with:
 * - Property validation
 * - Account isolation
 * - Financial summaries
 * - Date filtering
 */
@Injectable()
export class FinancialsService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================
  // EXPENSE METHODS
  // ============================================

  /**
   * Get all expenses for an account with optional filters.
   */
  async findAllExpenses(
    accountId: string,
    filters?: {
      propertyId?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const where: Prisma.PropertyExpenseWhereInput = {
      accountId,
      ...(filters?.propertyId && { propertyId: filters.propertyId }),
    };

    // Add date filtering
    if (filters?.startDate || filters?.endDate) {
      where.expenseDate = {};
      if (filters.startDate) {
        where.expenseDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.expenseDate.lte = new Date(filters.endDate);
      }
    }

    return this.prisma.propertyExpense.findMany({
      where,
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
  }

  /**
   * Get all expenses for a specific property.
   */
  async findExpensesByProperty(propertyId: string, accountId: string) {
    // Verify property belongs to account
    const property = await this.prisma.property.findFirst({
      where: {
        id: propertyId,
        accountId,
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return this.prisma.propertyExpense.findMany({
      where: {
        propertyId,
        accountId,
      },
      orderBy: {
        expenseDate: 'desc',
      },
    });
  }

  /**
   * Create a new expense.
   */
  async createExpense(dto: CreateExpenseDto, accountId: string) {
    // Verify property belongs to account
    const property = await this.prisma.property.findFirst({
      where: {
        id: dto.propertyId,
        accountId,
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return this.prisma.propertyExpense.create({
      data: {
        propertyId: dto.propertyId,
        accountId,
        expenseDate: new Date(dto.expenseDate),
        amount: dto.amount,
        type: dto.expenseType,
        category: dto.category,
        description: dto.description,
        paymentMethod: dto.paymentMethod,
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
  }

  /**
   * Update an expense.
   */
  async updateExpense(id: string, dto: UpdateExpenseDto, accountId: string) {
    // Verify expense exists and belongs to account
    const expense = await this.prisma.propertyExpense.findFirst({
      where: { id, accountId },
    });

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    // If propertyId is being updated, verify new property belongs to account
    if (dto.propertyId && dto.propertyId !== expense.propertyId) {
      const property = await this.prisma.property.findFirst({
        where: {
          id: dto.propertyId,
          accountId,
        },
      });

      if (!property) {
        throw new NotFoundException('Property not found');
      }
    }

    const updateData: Prisma.PropertyExpenseUpdateInput = {};

    if (dto.expenseDate !== undefined) {
      updateData.expenseDate = new Date(dto.expenseDate);
    }
    if (dto.amount !== undefined) {
      updateData.amount = dto.amount;
    }
    if (dto.expenseType !== undefined) {
      updateData.type = dto.expenseType;
    }
    if (dto.category !== undefined) {
      updateData.category = dto.category;
    }
    if (dto.description !== undefined) {
      updateData.description = dto.description;
    }
    if (dto.paymentMethod !== undefined) {
      updateData.paymentMethod = dto.paymentMethod;
    }
    if (dto.propertyId !== undefined) {
      updateData.property = {
        connect: { id: dto.propertyId },
      };
    }

    return this.prisma.propertyExpense.update({
      where: { id },
      data: updateData,
      include: {
        property: {
          select: {
            id: true,
            address: true,
          },
        },
      },
    });
  }

  /**
   * Delete an expense.
   */
  async removeExpense(id: string, accountId: string) {
    // Verify expense exists and belongs to account
    const expense = await this.prisma.propertyExpense.findFirst({
      where: { id, accountId },
    });

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    await this.prisma.propertyExpense.delete({
      where: { id },
    });

    return { message: 'Expense deleted successfully' };
  }

  // ============================================
  // INCOME METHODS
  // ============================================

  /**
   * Get all income for an account with optional filters.
   */
  async findAllIncome(
    accountId: string,
    filters?: {
      propertyId?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const where: Prisma.PropertyIncomeWhereInput = {
      accountId,
      ...(filters?.propertyId && { propertyId: filters.propertyId }),
    };

    // Add date filtering
    if (filters?.startDate || filters?.endDate) {
      where.incomeDate = {};
      if (filters.startDate) {
        where.incomeDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.incomeDate.lte = new Date(filters.endDate);
      }
    }

    return this.prisma.propertyIncome.findMany({
      where,
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
  }

  /**
   * Get all income for a specific property.
   */
  async findIncomeByProperty(propertyId: string, accountId: string) {
    // Verify property belongs to account
    const property = await this.prisma.property.findFirst({
      where: {
        id: propertyId,
        accountId,
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return this.prisma.propertyIncome.findMany({
      where: {
        propertyId,
        accountId,
      },
      orderBy: {
        incomeDate: 'desc',
      },
    });
  }

  /**
   * Create a new income entry.
   */
  async createIncome(dto: CreateIncomeDto, accountId: string) {
    // Verify property belongs to account
    const property = await this.prisma.property.findFirst({
      where: {
        id: dto.propertyId,
        accountId,
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return this.prisma.propertyIncome.create({
      data: {
        propertyId: dto.propertyId,
        accountId,
        incomeDate: new Date(dto.incomeDate),
        amount: dto.amount,
        type: dto.incomeType,
        source: dto.source,
        description: dto.description,
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
  }

  /**
   * Update an income entry.
   */
  async updateIncome(id: string, dto: UpdateIncomeDto, accountId: string) {
    // Verify income exists and belongs to account
    const income = await this.prisma.propertyIncome.findFirst({
      where: { id, accountId },
    });

    if (!income) {
      throw new NotFoundException(`Income with ID ${id} not found`);
    }

    // If propertyId is being updated, verify new property belongs to account
    if (dto.propertyId && dto.propertyId !== income.propertyId) {
      const property = await this.prisma.property.findFirst({
        where: {
          id: dto.propertyId,
          accountId,
        },
      });

      if (!property) {
        throw new NotFoundException('Property not found');
      }
    }

    const updateData: Prisma.PropertyIncomeUpdateInput = {};

    if (dto.incomeDate !== undefined) {
      updateData.incomeDate = new Date(dto.incomeDate);
    }
    if (dto.amount !== undefined) {
      updateData.amount = dto.amount;
    }
    if (dto.incomeType !== undefined) {
      updateData.type = dto.incomeType;
    }
    if (dto.source !== undefined) {
      updateData.source = dto.source;
    }
    if (dto.description !== undefined) {
      updateData.description = dto.description;
    }
    if (dto.propertyId !== undefined) {
      updateData.property = {
        connect: { id: dto.propertyId },
      };
    }

    return this.prisma.propertyIncome.update({
      where: { id },
      data: updateData,
      include: {
        property: {
          select: {
            id: true,
            address: true,
          },
        },
      },
    });
  }

  /**
   * Delete an income entry.
   */
  async removeIncome(id: string, accountId: string) {
    // Verify income exists and belongs to account
    const income = await this.prisma.propertyIncome.findFirst({
      where: { id, accountId },
    });

    if (!income) {
      throw new NotFoundException(`Income with ID ${id} not found`);
    }

    await this.prisma.propertyIncome.delete({
      where: { id },
    });

    return { message: 'Income deleted successfully' };
  }

  // ============================================
  // SUMMARY METHODS
  // ============================================

  /**
   * Get financial summary for an account.
   * Returns total income, total expenses, and net (income - expenses).
   */
  async getFinancialSummary(
    accountId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const expenseDateFilter: Prisma.DateTimeFilter = {};
    const incomeDateFilter: Prisma.DateTimeFilter = {};

    if (startDate) {
      expenseDateFilter.gte = new Date(startDate);
      incomeDateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      expenseDateFilter.lte = new Date(endDate);
      incomeDateFilter.lte = new Date(endDate);
    }

    const [totalExpenses, totalIncome] = await Promise.all([
      this.prisma.propertyExpense.aggregate({
        where: {
          accountId,
          ...(Object.keys(expenseDateFilter).length > 0 && {
            expenseDate: expenseDateFilter,
          }),
        },
        _sum: {
          amount: true,
        },
      }),
      this.prisma.propertyIncome.aggregate({
        where: {
          accountId,
          ...(Object.keys(incomeDateFilter).length > 0 && {
            incomeDate: incomeDateFilter,
          }),
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    const expenses = Number(totalExpenses._sum.amount || 0);
    const income = Number(totalIncome._sum.amount || 0);
    const net = income - expenses;

    return {
      totalIncome: income,
      totalExpenses: expenses,
      net: net,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    };
  }

  /**
   * Get expense breakdown by category/type.
   */
  async getExpenseBreakdown(
    accountId: string,
    filters?: {
      propertyId?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const where: Prisma.PropertyExpenseWhereInput = {
      accountId,
      ...(filters?.propertyId && { propertyId: filters.propertyId }),
    };

    if (filters?.startDate || filters?.endDate) {
      where.expenseDate = {};
      if (filters.startDate) {
        where.expenseDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.expenseDate.lte = new Date(filters.endDate);
      }
    }

    const expenses = await this.prisma.propertyExpense.findMany({
      where,
    });

    // Group by type and calculate totals
    const breakdown = expenses.reduce((acc, expense) => {
      const type = expense.type;
      if (!acc[type]) {
        acc[type] = {
          type,
          total: 0,
          count: 0,
        };
      }
      acc[type].total += Number(expense.amount);
      acc[type].count += 1;
      return acc;
    }, {} as Record<string, { type: string; total: number; count: number }>);

    return Object.values(breakdown).map((item) => ({
      ...item,
      percentage: expenses.length > 0
        ? (item.total / expenses.reduce((sum, e) => sum + Number(e.amount), 0)) * 100
        : 0,
    }));
  }

  /**
   * Get income breakdown by type.
   */
  async getIncomeBreakdown(
    accountId: string,
    filters?: {
      propertyId?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const where: Prisma.PropertyIncomeWhereInput = {
      accountId,
      ...(filters?.propertyId && { propertyId: filters.propertyId }),
    };

    if (filters?.startDate || filters?.endDate) {
      where.incomeDate = {};
      if (filters.startDate) {
        where.incomeDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.incomeDate.lte = new Date(filters.endDate);
      }
    }

    const income = await this.prisma.propertyIncome.findMany({
      where,
    });

    // Group by type and calculate totals
    const breakdown = income.reduce((acc, inc) => {
      const type = inc.type;
      if (!acc[type]) {
        acc[type] = {
          type,
          total: 0,
          count: 0,
        };
      }
      acc[type].total += Number(inc.amount);
      acc[type].count += 1;
      return acc;
    }, {} as Record<string, { type: string; total: number; count: number }>);

    return Object.values(breakdown).map((item) => ({
      ...item,
      percentage: income.length > 0
        ? (item.total / income.reduce((sum, i) => sum + Number(i.amount), 0)) * 100
        : 0,
    }));
  }

  /**
   * Get financial dashboard for a property.
   */
  async getPropertyDashboard(
    propertyId: string,
    accountId: string,
    startDate?: string,
    endDate?: string,
  ) {
    // Verify property belongs to account
    const property = await this.prisma.property.findFirst({
      where: {
        id: propertyId,
        accountId,
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    const expenseDateFilter: Prisma.DateTimeFilter = {};
    const incomeDateFilter: Prisma.DateTimeFilter = {};

    if (startDate) {
      expenseDateFilter.gte = new Date(startDate);
      incomeDateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      expenseDateFilter.lte = new Date(endDate);
      incomeDateFilter.lte = new Date(endDate);
    }

    const [expenses, income, expenseTotal, incomeTotal, latestValuation] = await Promise.all([
      this.prisma.propertyExpense.findMany({
        where: {
          propertyId,
          accountId,
          ...(Object.keys(expenseDateFilter).length > 0 && {
            expenseDate: expenseDateFilter,
          }),
        },
        orderBy: {
          expenseDate: 'desc',
        },
      }),
      this.prisma.propertyIncome.findMany({
        where: {
          propertyId,
          accountId,
          ...(Object.keys(incomeDateFilter).length > 0 && {
            incomeDate: incomeDateFilter,
          }),
        },
        orderBy: {
          incomeDate: 'desc',
        },
      }),
      this.prisma.propertyExpense.aggregate({
        where: {
          propertyId,
          accountId,
          ...(Object.keys(expenseDateFilter).length > 0 && {
            expenseDate: expenseDateFilter,
          }),
        },
        _sum: {
          amount: true,
        },
      }),
      this.prisma.propertyIncome.aggregate({
        where: {
          propertyId,
          accountId,
          ...(Object.keys(incomeDateFilter).length > 0 && {
            incomeDate: incomeDateFilter,
          }),
        },
        _sum: {
          amount: true,
        },
      }),
      this.prisma.propertyValuation.findFirst({
        where: {
          propertyId,
          accountId,
        },
        orderBy: {
          valuationDate: 'desc',
        },
      }),
    ]);

    const totalExpenses = Number(expenseTotal._sum.amount || 0);
    const totalIncome = Number(incomeTotal._sum.amount || 0);
    const netIncome = totalIncome - totalExpenses;
    const propertyValue = latestValuation ? Number(latestValuation.estimatedValue) : Number(property.estimatedValue || 0);
    const roi = propertyValue > 0 ? (netIncome / propertyValue) * 100 : 0;

    return {
      property: {
        id: property.id,
        address: property.address,
        fileNumber: property.fileNumber,
      },
      summary: {
        totalIncome,
        totalExpenses,
        netIncome,
        incomeCount: income.length,
        expenseCount: expenses.length,
        propertyValue,
        roi: Number(roi.toFixed(2)),
      },
      latestValuation: latestValuation ? {
        id: latestValuation.id,
        valuationDate: latestValuation.valuationDate,
        estimatedValue: Number(latestValuation.estimatedValue),
        valuationType: latestValuation.valuationType,
      } : null,
      expenses,
      income,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    };
  }

  /**
   * Get financial summary for a specific property.
   */
  async getPropertyFinancials(propertyId: string, accountId: string) {
    // Verify property belongs to account
    const property = await this.prisma.property.findFirst({
      where: {
        id: propertyId,
        accountId,
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    const [expenses, income, expenseTotal, incomeTotal] = await Promise.all([
      this.prisma.propertyExpense.findMany({
        where: {
          propertyId,
          accountId,
        },
        orderBy: {
          expenseDate: 'desc',
        },
      }),
      this.prisma.propertyIncome.findMany({
        where: {
          propertyId,
          accountId,
        },
        orderBy: {
          incomeDate: 'desc',
        },
      }),
      this.prisma.propertyExpense.aggregate({
        where: {
          propertyId,
          accountId,
        },
        _sum: {
          amount: true,
        },
      }),
      this.prisma.propertyIncome.aggregate({
        where: {
          propertyId,
          accountId,
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    const totalExpenses = Number(expenseTotal._sum.amount || 0);
    const totalIncome = Number(incomeTotal._sum.amount || 0);
    const net = totalIncome - totalExpenses;

    return {
      property: {
        id: property.id,
        address: property.address,
      },
      expenses,
      income,
      summary: {
        totalIncome: totalIncome,
        totalExpenses: totalExpenses,
        net: net,
      },
    };
  }

  async getIncomeExpensesDashboard(
    accountId: string,
    startDate?: string,
    endDate?: string,
    groupBy: 'month' | 'quarter' | 'year' = 'month',
  ) {
    const whereIncome: any = { accountId };
    const whereExpense: any = { accountId };

    if (startDate || endDate) {
      whereIncome.incomeDate = {};
      whereExpense.expenseDate = {};
      if (startDate) {
        whereIncome.incomeDate.gte = new Date(startDate);
        whereExpense.expenseDate.gte = new Date(startDate);
      }
      if (endDate) {
        whereIncome.incomeDate.lte = new Date(endDate);
        whereExpense.expenseDate.lte = new Date(endDate);
      }
    }

    const incomes = await this.prisma.propertyIncome.findMany({
      where: whereIncome,
      select: {
        incomeDate: true,
        amount: true,
      },
    });

    const expenses = await this.prisma.propertyExpense.findMany({
      where: whereExpense,
      select: {
        expenseDate: true,
        amount: true,
      },
    });

    // Group by period
    const periodMap = new Map<string, { income: number; expenses: number }>();

    incomes.forEach((income) => {
      const period = this.getPeriodKey(income.incomeDate, groupBy);
      if (!periodMap.has(period)) {
        periodMap.set(period, { income: 0, expenses: 0 });
      }
      const data = periodMap.get(period)!;
      data.income += Number(income.amount);
    });

    expenses.forEach((expense) => {
      const period = this.getPeriodKey(expense.expenseDate, groupBy);
      if (!periodMap.has(period)) {
        periodMap.set(period, { income: 0, expenses: 0 });
      }
      const data = periodMap.get(period)!;
      data.expenses += Number(expense.amount);
    });

    // Convert to array and sort
    return Array.from(periodMap.entries())
      .map(([period, data]) => ({
        period,
        income: Number(data.income.toFixed(2)),
        expenses: Number(data.expenses.toFixed(2)),
        net: Number((data.income - data.expenses).toFixed(2)),
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  private getPeriodKey(date: Date, groupBy: 'month' | 'quarter' | 'year'): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;

    if (groupBy === 'year') {
      return `${year}`;
    } else if (groupBy === 'quarter') {
      const quarter = Math.floor((month - 1) / 3) + 1;
      return `${year}-Q${quarter}`;
    } else {
      // month
      return `${year}-${String(month).padStart(2, '0')}`;
    }
  }
}
