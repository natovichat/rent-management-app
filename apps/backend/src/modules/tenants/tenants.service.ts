import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

/**
 * Service for managing tenants.
 * 
 * Handles CRUD operations for tenants with account isolation.
 */
@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new tenant.
   */
  async create(accountId: string, createTenantDto: CreateTenantDto) {
    // Check if email already exists in this account
    if (createTenantDto.email) {
      const existing = await this.prisma.tenant.findFirst({
        where: {
          accountId,
          email: createTenantDto.email,
        },
      });

      if (existing) {
        throw new ConflictException(
          `Tenant with email ${createTenantDto.email} already exists`,
        );
      }
    }

    return this.prisma.tenant.create({
      data: {
        accountId,
        ...createTenantDto,
      },
    });
  }

  /**
   * Get all tenants for an account.
   * Supports optional search parameter for filtering by name, email, or phone.
   */
  async findAll(accountId: string, search?: string) {
    const where: any = { accountId };

    // Add search filter if provided
    if (search && search.trim()) {
      const searchTerm = search.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { phone: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    return this.prisma.tenant.findMany({
      where,
      include: {
        leases: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get a single tenant by ID.
   */
  async findOne(accountId: string, id: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id, accountId },
      include: {
        leases: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    return tenant;
  }

  /**
   * Update a tenant.
   */
  async update(
    accountId: string,
    id: string,
    updateTenantDto: UpdateTenantDto,
  ) {
    // Verify tenant belongs to account
    await this.findOne(accountId, id);

    // Check email uniqueness if changing email
    if (updateTenantDto.email !== undefined) {
      const existing = await this.prisma.tenant.findFirst({
        where: {
          accountId,
          email: updateTenantDto.email,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Tenant with email ${updateTenantDto.email} already exists`,
        );
      }
    }

    return this.prisma.tenant.update({
      where: { id },
      data: updateTenantDto,
    });
  }

  /**
   * Delete a tenant.
   * Cannot delete if tenant has active or future leases.
   */
  async remove(accountId: string, id: string) {
    // Verify tenant belongs to account
    const tenant = await this.findOne(accountId, id);

    // Check for active or future leases
    const activeLeases = await this.prisma.lease.count({
      where: {
        tenantId: id,
        status: {
          in: ['ACTIVE', 'FUTURE'],
        },
      },
    });

    if (activeLeases > 0) {
      throw new ConflictException(
        'Cannot delete tenant with active or future leases. Terminate leases first.',
      );
    }

    await this.prisma.tenant.delete({
      where: { id },
    });

    return { message: 'Tenant deleted successfully' };
  }
}
