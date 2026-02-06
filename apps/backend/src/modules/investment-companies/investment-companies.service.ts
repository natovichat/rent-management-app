import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateInvestmentCompanyDto } from './dto/create-investment-company.dto';
import { UpdateInvestmentCompanyDto } from './dto/update-investment-company.dto';

@Injectable()
export class InvestmentCompaniesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new investment company.
   */
  async create(
    createDto: CreateInvestmentCompanyDto,
    accountId: string,
  ) {
    // Validate name uniqueness per account
    const existingCompany = await this.prisma.investmentCompany.findFirst({
      where: {
        accountId,
        name: createDto.name,
      },
    });

    if (existingCompany) {
      throw new ConflictException(
        `Investment company with name "${createDto.name}" already exists`,
      );
    }

    const company = await this.prisma.investmentCompany.create({
      data: {
        accountId,
        name: createDto.name,
        registrationNumber: createDto.registrationNumber,
        country: createDto.country || 'Israel',
        investmentAmount: createDto.investmentAmount
          ? createDto.investmentAmount
          : null,
        ownershipPercentage: createDto.ownershipPercentage
          ? createDto.ownershipPercentage
          : null,
        notes: createDto.notes,
      },
      include: {
        _count: {
          select: { properties: true },
        },
      },
    });

    return {
      ...company,
      propertyCount: company._count.properties,
    };
  }

  /**
   * Get all investment companies for an account with pagination, search, and advanced filters.
   */
  async findAll(
    accountId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    country?: string,
    minInvestmentAmount?: number,
    maxInvestmentAmount?: number,
    minOwnershipPercentage?: number,
    maxOwnershipPercentage?: number,
    minPropertyCount?: number,
    maxPropertyCount?: number,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      accountId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { registrationNumber: { contains: search, mode: 'insensitive' as const } },
          { country: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(country && { country }),
    };

    // Advanced filters - Investment amount range
    if (minInvestmentAmount !== undefined || maxInvestmentAmount !== undefined) {
      where.investmentAmount = {};
      if (minInvestmentAmount !== undefined) {
        where.investmentAmount.gte = minInvestmentAmount;
      }
      if (maxInvestmentAmount !== undefined) {
        where.investmentAmount.lte = maxInvestmentAmount;
      }
    }

    // Advanced filters - Ownership percentage range
    if (minOwnershipPercentage !== undefined || maxOwnershipPercentage !== undefined) {
      where.ownershipPercentage = {};
      if (minOwnershipPercentage !== undefined) {
        where.ownershipPercentage.gte = minOwnershipPercentage;
      }
      if (maxOwnershipPercentage !== undefined) {
        where.ownershipPercentage.lte = maxOwnershipPercentage;
      }
    }

    const [companies, totalBeforeFilter] = await Promise.all([
      this.prisma.investmentCompany.findMany({
        where,
        skip,
        take: limit * 2, // Fetch more to account for property count filtering
        include: {
          _count: {
            select: { properties: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.investmentCompany.count({ where }),
    ]);

    // Map companies with property count
    let companiesWithCount = companies.map((c) => ({
      ...c,
      propertyCount: c._count.properties,
    }));

    // Filter by property count if specified
    if (minPropertyCount !== undefined || maxPropertyCount !== undefined) {
      companiesWithCount = companiesWithCount.filter((c) => {
        if (minPropertyCount !== undefined && c.propertyCount < minPropertyCount) {
          return false;
        }
        if (maxPropertyCount !== undefined && c.propertyCount > maxPropertyCount) {
          return false;
        }
        return true;
      });
    }

    // Apply limit after property count filtering
    const paginatedCompanies = companiesWithCount.slice(0, limit);

    // Recalculate total if property count filter was applied
    let total = totalBeforeFilter;
    if (minPropertyCount !== undefined || maxPropertyCount !== undefined) {
      // Need to count all companies matching other filters, then filter by property count
      const allCompanies = await this.prisma.investmentCompany.findMany({
        where,
        include: {
          _count: {
            select: { properties: true },
          },
        },
      });
      total = allCompanies.filter((c) => {
        const propertyCount = c._count.properties;
        if (minPropertyCount !== undefined && propertyCount < minPropertyCount) {
          return false;
        }
        if (maxPropertyCount !== undefined && propertyCount > maxPropertyCount) {
          return false;
        }
        return true;
      }).length;
    }

    return {
      data: paginatedCompanies,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single investment company by ID.
   */
  async findOne(id: string, accountId: string) {
    const company = await this.prisma.investmentCompany.findFirst({
      where: { id, accountId },
      include: {
        _count: {
          select: { properties: true },
        },
      },
    });

    if (!company) {
      throw new NotFoundException(
        `Investment company with ID ${id} not found`,
      );
    }

    return {
      ...company,
      propertyCount: company._count.properties,
    };
  }

  /**
   * Update an investment company.
   */
  async update(
    id: string,
    accountId: string,
    updateDto: UpdateInvestmentCompanyDto,
  ) {
    // Verify ownership
    await this.verifyOwnership(id, accountId);

    // Validate name uniqueness if updating name
    if (updateDto.name) {
      const existingCompany = await this.prisma.investmentCompany.findFirst({
        where: {
          accountId,
          name: updateDto.name,
          NOT: { id },
        },
      });

      if (existingCompany) {
        throw new ConflictException(
          `Investment company with name "${updateDto.name}" already exists`,
        );
      }
    }

    const company = await this.prisma.investmentCompany.update({
      where: { id },
      data: {
        ...updateDto,
        investmentAmount: updateDto.investmentAmount
          ? updateDto.investmentAmount
          : undefined,
        ownershipPercentage: updateDto.ownershipPercentage
          ? updateDto.ownershipPercentage
          : undefined,
      },
    });

    return company;
  }

  /**
   * Delete an investment company.
   * Cannot delete if company has linked properties.
   */
  async remove(id: string, accountId: string) {
    // Verify ownership
    await this.verifyOwnership(id, accountId);

    // Check if company has any linked properties
    const propertyCount = await this.prisma.property.count({
      where: {
        investmentCompanyId: id,
      },
    });

    if (propertyCount > 0) {
      throw new ForbiddenException(
        `Cannot delete investment company with ${propertyCount} linked properties. Unlink properties first.`,
      );
    }

    await this.prisma.investmentCompany.delete({
      where: { id },
    });

    return { message: 'Investment company deleted successfully' };
  }

  /**
   * Delete all investment companies for test account (E2E testing only).
   */
  async deleteAllForAccount(
    accountId: string,
  ): Promise<{ deletedCount: number }> {
    console.log(
      '[InvestmentCompaniesService] Deleting all investment companies for account:',
      accountId,
    );

    // Safety check: Only allow deletion for test accounts
    // Allow both hardcoded test account and any account ID starting with "test-"
    const TEST_ACCOUNT_ID = '00000000-0000-0000-0000-000000000001';
    const isTestAccount = accountId === TEST_ACCOUNT_ID || accountId.startsWith('test-');
    
    if (!isTestAccount) {
      throw new ForbiddenException(
        'Can only delete data for test account. This is a safety measure to prevent accidental data loss.',
      );
    }

    try {
      const result = await this.prisma.investmentCompany.deleteMany({
        where: { accountId },
      });

      console.log(
        '[InvestmentCompaniesService] Deleted',
        result.count,
        'investment companies for account',
        accountId,
      );
      return { deletedCount: result.count };
    } catch (error) {
      console.error(
        '[InvestmentCompaniesService] Error deleting investment companies:',
        error,
      );
      throw error;
    }
  }

  /**
   * Helper: Verify investment company belongs to account.
   */
  private async verifyOwnership(id: string, accountId: string) {
    const company = await this.prisma.investmentCompany.findFirst({
      where: { id, accountId },
    });

    if (!company) {
      throw new NotFoundException(
        `Investment company with ID ${id} not found`,
      );
    }

    return company;
  }
}
