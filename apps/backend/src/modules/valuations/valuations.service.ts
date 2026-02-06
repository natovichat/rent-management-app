import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateValuationDto } from './dto/create-valuation.dto';
import { UpdateValuationDto } from './dto/update-valuation.dto';

/**
 * Service for managing property valuations.
 * 
 * Handles CRUD operations for property valuations with:
 * - Account isolation
 * - Property ownership verification
 * - Date ordering
 */
@Injectable()
export class ValuationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all valuations for a property, ordered by date descending.
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
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }

    return this.prisma.propertyValuation.findMany({
      where: {
        propertyId,
        accountId,
      },
      include: {
        property: true,
      },
      orderBy: {
        valuationDate: 'desc',
      },
    });
  }

  /**
   * Get a single valuation by ID.
   */
  async findOne(id: string, accountId: string) {
    const valuation = await this.prisma.propertyValuation.findFirst({
      where: {
        id,
        accountId,
      },
      include: {
        property: true,
      },
    });

    if (!valuation) {
      throw new NotFoundException(`Valuation with ID ${id} not found`);
    }

    return valuation;
  }

  /**
   * Create a new valuation.
   */
  async create(createValuationDto: CreateValuationDto, accountId: string) {
    // Verify property belongs to account
    const property = await this.prisma.property.findFirst({
      where: {
        id: createValuationDto.propertyId,
        accountId,
      },
    });

    if (!property) {
      throw new NotFoundException(
        `Property with ID ${createValuationDto.propertyId} not found`,
      );
    }

    return this.prisma.propertyValuation.create({
      data: {
        propertyId: createValuationDto.propertyId,
        accountId,
        valuationDate: new Date(createValuationDto.valuationDate),
        estimatedValue: createValuationDto.estimatedValue,
        valuationType: createValuationDto.valuationType,
        notes: createValuationDto.notes,
      },
      include: {
        property: true,
      },
    });
  }

  /**
   * Update a valuation.
   */
  async update(
    id: string,
    updateValuationDto: UpdateValuationDto,
    accountId: string,
  ) {
    // Verify valuation belongs to account
    await this.findOne(id, accountId);

    // If propertyId is being updated, verify new property belongs to account
    if (updateValuationDto.propertyId) {
      const property = await this.prisma.property.findFirst({
        where: {
          id: updateValuationDto.propertyId,
          accountId,
        },
      });

      if (!property) {
        throw new NotFoundException(
          `Property with ID ${updateValuationDto.propertyId} not found`,
        );
      }
    }

    const updateData: any = {
      ...updateValuationDto,
    };

    // Convert date string to Date if provided
    if (updateValuationDto.valuationDate) {
      updateData.valuationDate = new Date(updateValuationDto.valuationDate);
    }

    return this.prisma.propertyValuation.update({
      where: { id },
      data: updateData,
      include: {
        property: true,
      },
    });
  }

  /**
   * Delete a valuation.
   */
  async remove(id: string, accountId: string) {
    // Verify valuation belongs to account
    await this.findOne(id, accountId);

    await this.prisma.propertyValuation.delete({
      where: { id },
    });

    return { message: 'Valuation deleted successfully' };
  }

  /**
   * Get the most recent valuation for a property.
   */
  async getLatest(propertyId: string, accountId: string) {
    // Verify property belongs to account
    const property = await this.prisma.property.findFirst({
      where: {
        id: propertyId,
        accountId,
      },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }

    const latest = await this.prisma.propertyValuation.findFirst({
      where: {
        propertyId,
        accountId,
      },
      include: {
        property: true,
      },
      orderBy: {
        valuationDate: 'desc',
      },
    });

    if (!latest) {
      throw new NotFoundException(
        `No valuations found for property ${propertyId}`,
      );
    }

    return latest;
  }
}
