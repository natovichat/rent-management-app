import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateMortgageDto } from './dto/create-mortgage.dto';
import { UpdateMortgageDto } from './dto/update-mortgage.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Prisma, MortgageStatus } from '@prisma/client';

/**
 * Service for managing mortgages.
 * 
 * Handles CRUD operations for mortgages with:
 * - Property validation
 * - Payment tracking
 * - Remaining balance calculation
 * - Account isolation
 */
@Injectable()
export class MortgagesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all mortgages for a property.
   */
  async findAllByProperty(propertyId: string, accountId: string) {
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

    return this.prisma.mortgage.findMany({
      where: {
        propertyId,
        accountId,
      },
      include: {
        property: true,
        bankAccount: true,
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
  }

  /**
   * Get all mortgages for an account with pagination, search, and advanced filters.
   */
  async findAll(
    accountId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: MortgageStatus,
    bank?: string,
    propertyId?: string,
    minLoanAmount?: number,
    maxLoanAmount?: number,
    minInterestRate?: number,
    maxInterestRate?: number,
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.MortgageWhereInput = { accountId };
    
    if (status) {
      where.status = status;
    }

    if (bank) {
      where.bank = bank;
    }

    if (propertyId) {
      where.propertyId = propertyId;
    }

    // Advanced filters - Loan amount range
    if (minLoanAmount !== undefined || maxLoanAmount !== undefined) {
      where.loanAmount = {};
      if (minLoanAmount !== undefined) {
        where.loanAmount.gte = minLoanAmount;
      }
      if (maxLoanAmount !== undefined) {
        where.loanAmount.lte = maxLoanAmount;
      }
    }

    // Advanced filters - Interest rate range
    if (minInterestRate !== undefined || maxInterestRate !== undefined) {
      where.interestRate = {};
      if (minInterestRate !== undefined) {
        where.interestRate.gte = minInterestRate;
      }
      if (maxInterestRate !== undefined) {
        where.interestRate.lte = maxInterestRate;
      }
    }

    // Search across property address and bank name
    if (search) {
      const trimmedSearch = search.trim();
      if (trimmedSearch.length > 0) {
        where.OR = [
          {
            property: {
              address: { contains: trimmedSearch, mode: 'insensitive' },
            },
          },
          {
            bank: { contains: trimmedSearch, mode: 'insensitive' },
          },
        ];
      }
    }

    const [mortgages, total] = await Promise.all([
      this.prisma.mortgage.findMany({
        where,
        skip,
        take: limit,
        include: {
          property: true,
          bankAccount: true,
          payments: {
            orderBy: {
              paymentDate: 'desc',
            },
          },
        },
        orderBy: {
          startDate: 'desc',
        },
      }),
      this.prisma.mortgage.count({ where }),
    ]);

    return {
      data: mortgages,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single mortgage by ID with payments.
   */
  async findOne(id: string, accountId: string) {
    const mortgage = await this.prisma.mortgage.findFirst({
      where: { id, accountId },
      include: {
        property: true,
        bankAccount: true,
        payments: {
          orderBy: {
            paymentDate: 'desc',
          },
        },
      },
    });

    if (!mortgage) {
      throw new NotFoundException(`Mortgage with ID ${id} not found`);
    }

    return mortgage;
  }

  /**
   * Create a new mortgage.
   */
  async create(createMortgageDto: CreateMortgageDto, accountId: string) {
    // Validate interest rate is between 0 and 100
    if (
      createMortgageDto.interestRate !== undefined &&
      (createMortgageDto.interestRate < 0 || createMortgageDto.interestRate > 100)
    ) {
      throw new BadRequestException(
        'Interest rate must be between 0 and 100',
      );
    }

    // Validate end date is after start date
    if (createMortgageDto.endDate) {
      const startDate = new Date(createMortgageDto.startDate);
      const endDate = new Date(createMortgageDto.endDate);
      if (endDate <= startDate) {
        throw new BadRequestException(
          'End date must be after start date',
        );
      }
    }

    // Verify property belongs to account
    const property = await this.prisma.property.findFirst({
      where: {
        id: createMortgageDto.propertyId,
        accountId,
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // Validate linked properties if provided
    if (createMortgageDto.linkedProperties && createMortgageDto.linkedProperties.length > 0) {
      const linkedProperties = await this.prisma.property.findMany({
        where: {
          id: { in: createMortgageDto.linkedProperties },
          accountId,
        },
      });

      if (linkedProperties.length !== createMortgageDto.linkedProperties.length) {
        throw new BadRequestException('One or more linked properties not found');
      }
    }

    return this.prisma.mortgage.create({
      data: {
        accountId,
        propertyId: createMortgageDto.propertyId,
        bank: createMortgageDto.bank,
        loanAmount: new Prisma.Decimal(createMortgageDto.loanAmount),
        interestRate: createMortgageDto.interestRate
          ? new Prisma.Decimal(createMortgageDto.interestRate)
          : null,
        monthlyPayment: createMortgageDto.monthlyPayment
          ? new Prisma.Decimal(createMortgageDto.monthlyPayment)
          : null,
        bankAccountId: createMortgageDto.bankAccountId || null,
        startDate: new Date(createMortgageDto.startDate),
        endDate: createMortgageDto.endDate
          ? new Date(createMortgageDto.endDate)
          : null,
        status: createMortgageDto.status,
        linkedProperties: createMortgageDto.linkedProperties || [],
        notes: createMortgageDto.notes,
      },
      include: {
        property: true,
        bankAccount: true,
        payments: true,
      },
    });
  }

  /**
   * Update a mortgage.
   */
  async update(
    id: string,
    updateMortgageDto: UpdateMortgageDto,
    accountId: string,
  ) {
    // Verify mortgage belongs to account
    await this.findOne(id, accountId);

    // Validate linked properties if provided
    if (updateMortgageDto.linkedProperties && updateMortgageDto.linkedProperties.length > 0) {
      const linkedProperties = await this.prisma.property.findMany({
        where: {
          id: { in: updateMortgageDto.linkedProperties },
          accountId,
        },
      });

      if (linkedProperties.length !== updateMortgageDto.linkedProperties.length) {
        throw new BadRequestException('One or more linked properties not found');
      }
    }

    const updateData: Prisma.MortgageUpdateInput = {};

    if (updateMortgageDto.propertyId !== undefined) {
      // Verify new property belongs to account
      const property = await this.prisma.property.findFirst({
        where: {
          id: updateMortgageDto.propertyId,
          accountId,
        },
      });

      if (!property) {
        throw new NotFoundException('Property not found');
      }

      updateData.property = {
        connect: {
          id: updateMortgageDto.propertyId,
        },
      };
    }

    if (updateMortgageDto.bank !== undefined) {
      updateData.bank = updateMortgageDto.bank;
    }

    if (updateMortgageDto.loanAmount !== undefined) {
      updateData.loanAmount = new Prisma.Decimal(updateMortgageDto.loanAmount);
    }

    if (updateMortgageDto.interestRate !== undefined) {
      if (
        updateMortgageDto.interestRate !== null &&
        (updateMortgageDto.interestRate < 0 || updateMortgageDto.interestRate > 100)
      ) {
        throw new BadRequestException(
          'Interest rate must be between 0 and 100',
        );
      }
      updateData.interestRate = updateMortgageDto.interestRate
        ? new Prisma.Decimal(updateMortgageDto.interestRate)
        : null;
    }

    if (updateMortgageDto.monthlyPayment !== undefined) {
      updateData.monthlyPayment = updateMortgageDto.monthlyPayment
        ? new Prisma.Decimal(updateMortgageDto.monthlyPayment)
        : null;
    }

    if (updateMortgageDto.startDate !== undefined) {
      updateData.startDate = new Date(updateMortgageDto.startDate);
    }

    if (updateMortgageDto.endDate !== undefined) {
      if (updateMortgageDto.endDate) {
        const mortgage = await this.prisma.mortgage.findUnique({
          where: { id },
        });
        const startDate = updateMortgageDto.startDate
          ? new Date(updateMortgageDto.startDate)
          : mortgage!.startDate;
        const endDate = new Date(updateMortgageDto.endDate);
        if (endDate <= startDate) {
          throw new BadRequestException(
            'End date must be after start date',
          );
        }
      }
      updateData.endDate = updateMortgageDto.endDate
        ? new Date(updateMortgageDto.endDate)
        : null;
    }

    if (updateMortgageDto.status !== undefined) {
      updateData.status = updateMortgageDto.status;
    }

    if (updateMortgageDto.linkedProperties !== undefined) {
      updateData.linkedProperties = updateMortgageDto.linkedProperties;
    }

    if (updateMortgageDto.notes !== undefined) {
      updateData.notes = updateMortgageDto.notes;
    }

    return this.prisma.mortgage.update({
      where: { id },
      data: updateData,
      include: {
        property: true,
        payments: {
          orderBy: {
            paymentDate: 'desc',
          },
        },
      },
    });
  }

  /**
   * Delete a mortgage.
   * Cannot delete if mortgage has associated payments.
   */
  async remove(id: string, accountId: string) {
    // Verify mortgage belongs to account
    const mortgage = await this.findOne(id, accountId);

    // Check if mortgage has payments
    const paymentCount = await this.prisma.mortgagePayment.count({
      where: {
        mortgageId: id,
        accountId,
      },
    });

    if (paymentCount > 0) {
      throw new ConflictException(
        'Cannot delete mortgage with associated payments',
      );
    }

    await this.prisma.mortgage.delete({
      where: { id },
    });

    return { message: 'Mortgage deleted successfully' };
  }

  /**
   * Add a payment to a mortgage.
   */
  async addPayment(
    mortgageId: string,
    createPaymentDto: CreatePaymentDto,
    accountId: string,
  ) {
    // Verify mortgage belongs to account
    const mortgage = await this.findOne(mortgageId, accountId);

    // Validate principal + interest <= amount if both provided
    if (
      createPaymentDto.principal !== undefined &&
      createPaymentDto.interest !== undefined
    ) {
      const total = createPaymentDto.principal + createPaymentDto.interest;
      if (total > createPaymentDto.amount) {
        throw new BadRequestException(
          'Principal + interest cannot exceed payment amount',
        );
      }
    }

    // Validate principal <= amount if provided
    if (
      createPaymentDto.principal !== undefined &&
      createPaymentDto.principal > createPaymentDto.amount
    ) {
      throw new BadRequestException(
        'Principal cannot exceed payment amount',
      );
    }

    // Validate interest <= amount if provided
    if (
      createPaymentDto.interest !== undefined &&
      createPaymentDto.interest > createPaymentDto.amount
    ) {
      throw new BadRequestException(
        'Interest cannot exceed payment amount',
      );
    }

    return this.prisma.mortgagePayment.create({
      data: {
        accountId,
        mortgageId,
        paymentDate: new Date(createPaymentDto.paymentDate),
        amount: new Prisma.Decimal(createPaymentDto.amount),
        principal: createPaymentDto.principal
          ? new Prisma.Decimal(createPaymentDto.principal)
          : null,
        interest: createPaymentDto.interest
          ? new Prisma.Decimal(createPaymentDto.interest)
          : null,
        notes: createPaymentDto.notes,
      },
      include: {
        mortgage: {
          include: {
            property: true,
          },
        },
      },
    });
  }

  /**
   * Calculate remaining balance for a mortgage.
   * 
   * Remaining balance = loanAmount - sum of all principal payments
   */
  async calculateRemainingBalance(mortgageId: string, accountId: string) {
    // Verify mortgage belongs to account
    const mortgage = await this.findOne(mortgageId, accountId);

    // Get all payments with principal amounts
    const payments = await this.prisma.mortgagePayment.findMany({
      where: {
        mortgageId,
        accountId,
        principal: { not: null },
      },
      select: {
        principal: true,
      },
    });

    // Calculate total principal paid
    const totalPrincipalPaid = payments.reduce((sum, payment) => {
      return sum.plus(payment.principal || 0);
    }, new Prisma.Decimal(0));

    // Calculate remaining balance
    const remainingBalance = mortgage.loanAmount.minus(totalPrincipalPaid);

    return {
      mortgageId,
      loanAmount: mortgage.loanAmount.toNumber(),
      totalPrincipalPaid: totalPrincipalPaid.toNumber(),
      remainingBalance: remainingBalance.toNumber(),
      totalPayments: payments.length,
    };
  }

  /**
   * Get mortgage summary statistics for an account.
   */
  async getSummary(accountId: string) {
    const mortgages = await this.prisma.mortgage.findMany({
      where: { accountId },
      include: {
        payments: {
          where: {
            principal: { not: null },
          },
          select: {
            principal: true,
          },
        },
      },
    });

    const totalMortgages = mortgages.length;
    const totalLoanAmount = mortgages.reduce(
      (sum, m) => sum.plus(m.loanAmount),
      new Prisma.Decimal(0),
    );

    // Calculate remaining balances
    const remainingBalances = mortgages.map((mortgage) => {
      const totalPrincipalPaid = mortgage.payments.reduce(
        (sum, p) => sum.plus(p.principal || 0),
        new Prisma.Decimal(0),
      );
      return mortgage.loanAmount.minus(totalPrincipalPaid);
    });

    const totalRemainingBalance = remainingBalances.reduce(
      (sum, balance) => sum.plus(balance),
      new Prisma.Decimal(0),
    );

    // Calculate total monthly payments for active mortgages
    const activeMortgages = mortgages.filter(
      (m) => m.status === MortgageStatus.ACTIVE,
    );
    const totalMonthlyPayments = activeMortgages.reduce(
      (sum, m) => sum.plus(m.monthlyPayment || 0),
      new Prisma.Decimal(0),
    );

    // Count by status
    const mortgagesByStatus = {
      [MortgageStatus.ACTIVE]: mortgages.filter(
        (m) => m.status === MortgageStatus.ACTIVE,
      ).length,
      [MortgageStatus.PAID_OFF]: mortgages.filter(
        (m) => m.status === MortgageStatus.PAID_OFF,
      ).length,
      [MortgageStatus.REFINANCED]: mortgages.filter(
        (m) => m.status === MortgageStatus.REFINANCED,
      ).length,
      [MortgageStatus.DEFAULTED]: mortgages.filter(
        (m) => m.status === MortgageStatus.DEFAULTED,
      ).length,
    };

    // Calculate average interest rate (weighted by loan amount)
    const totalInterestWeighted = mortgages.reduce(
      (sum, m) => sum.plus(m.loanAmount.times(m.interestRate || 0)),
      new Prisma.Decimal(0),
    );
    const averageInterestRate = totalLoanAmount.gt(0)
      ? totalInterestWeighted.dividedBy(totalLoanAmount).toNumber()
      : 0;

    return {
      totalMortgageDebt: totalRemainingBalance.toNumber(), // Use remaining balance as debt
      totalMonthlyPayments: totalMonthlyPayments.toNumber(),
      activeMortgagesCount: mortgagesByStatus[MortgageStatus.ACTIVE],
      paidOffMortgagesCount: mortgagesByStatus[MortgageStatus.PAID_OFF],
      totalRemainingBalance: totalRemainingBalance.toNumber(),
      averageInterestRate: Number(averageInterestRate.toFixed(2)),
      // Keep additional fields for backward compatibility
      totalMortgages,
      totalLoanAmount: totalLoanAmount.toNumber(),
      mortgagesByStatus,
    };
  }
}
