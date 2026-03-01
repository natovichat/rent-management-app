import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { QueryBankAccountDto } from './dto/query-bank-account.dto';
import { Prisma } from '@prisma/client';

/**
 * Service for managing bank accounts.
 * Handles CRUD operations with uniqueness validation (bankName + accountNumber)
 * and prevents deletion when linked to mortgages.
 */
@Injectable()
export class BankAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new bank account.
   * Validates uniqueness of bankName + accountNumber combination.
   */
  async create(dto: CreateBankAccountDto) {
    await this.checkUniqueness(dto.bankName, dto.accountNumber);

    return this.prisma.bankAccount.create({
      data: {
        bankName: dto.bankName,
        branchNumber: dto.branchNumber,
        accountNumber: dto.accountNumber,
        accountType: dto.accountType,
        accountHolder: dto.accountHolder,
        notes: dto.notes,
        isActive: dto.isActive ?? true,
      },
    });
  }

  /**
   * Find all bank accounts with pagination and filters.
   */
  async findAll(query: QueryBankAccountDto) {
    const { page = 1, limit = 20, bankName, accountType, isActive, includeDeleted } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.BankAccountWhereInput = {};

    if (!includeDeleted) {
      where.deletedAt = null;
    }

    if (bankName) {
      where.bankName = { contains: bankName, mode: 'insensitive' };
    }
    if (accountType) {
      where.accountType = accountType;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [data, total] = await Promise.all([
      this.prisma.bankAccount.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ bankName: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.bankAccount.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a bank account by ID.
   */
  async findOne(id: string, includeDeleted = false) {
    const bankAccount = await this.prisma.bankAccount.findFirst({
      where: {
        id,
        ...(!includeDeleted && { deletedAt: null }),
      },
    });

    if (!bankAccount) {
      throw new NotFoundException(`Bank account with ID ${id} not found`);
    }

    return bankAccount;
  }

  /**
   * Update a bank account.
   * Validates uniqueness when bankName or accountNumber are changed.
   */
  async update(id: string, dto: UpdateBankAccountDto) {
    const existing = await this.findOne(id);

    const bankName = dto.bankName ?? existing.bankName;
    const accountNumber = dto.accountNumber ?? existing.accountNumber;

    if (bankName !== existing.bankName || accountNumber !== existing.accountNumber) {
      await this.checkUniqueness(bankName, accountNumber, id);
    }

    const data: Prisma.BankAccountUpdateInput = {};
    if (dto.bankName !== undefined) data.bankName = dto.bankName;
    if (dto.branchNumber !== undefined) data.branchNumber = dto.branchNumber;
    if (dto.accountNumber !== undefined) data.accountNumber = dto.accountNumber;
    if (dto.accountType !== undefined) data.accountType = dto.accountType;
    if (dto.accountHolder !== undefined) data.accountHolder = dto.accountHolder;
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    return this.prisma.bankAccount.update({
      where: { id },
      data,
    });
  }

  /**
   * Soft-delete a bank account.
   * Prevents deletion when linked to active mortgages.
   */
  async remove(id: string) {
    await this.findOne(id);

    const mortgageCount = await this.prisma.mortgage.count({
      where: { bankAccountId: id, deletedAt: null },
    });

    if (mortgageCount > 0) {
      throw new ConflictException(
        `Cannot delete bank account: it is linked to ${mortgageCount} mortgage(s). Remove the mortgage links first.`,
      );
    }

    return this.prisma.bankAccount.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Restore a soft-deleted bank account.
   */
  async restore(id: string) {
    const bankAccount = await this.prisma.bankAccount.findFirst({
      where: { id, deletedAt: { not: null } },
    });

    if (!bankAccount) {
      throw new NotFoundException(`Deleted bank account with ID ${id} not found`);
    }

    return this.prisma.bankAccount.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  /**
   * Check uniqueness of bankName + accountNumber.
   * Excludes existing record when updating.
   */
  private async checkUniqueness(
    bankName: string,
    accountNumber: string,
    excludeId?: string,
  ) {
    const existing = await this.prisma.bankAccount.findFirst({
      where: {
        bankName,
        accountNumber,
        deletedAt: null,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });

    if (existing) {
      throw new ConflictException(
        `Bank account with bank "${bankName}" and account number "${accountNumber}" already exists`,
      );
    }
  }
}
