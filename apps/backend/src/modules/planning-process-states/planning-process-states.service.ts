import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePlanningProcessStateDto } from './dto/create-planning-process-state.dto';
import { UpdatePlanningProcessStateDto } from './dto/update-planning-process-state.dto';

/**
 * Service for managing PlanningProcessState (1:1 with Property)
 */
@Injectable()
export class PlanningProcessStatesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a planning process state for a property.
   * Ensures property exists and no state already exists (1:1 constraint).
   */
  async create(propertyId: string, dto: CreatePlanningProcessStateDto) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      include: { planningProcessState: true },
    });

    if (!property) {
      throw new NotFoundException(`Property with id ${propertyId} not found`);
    }

    if (property.planningProcessState) {
      throw new ConflictException(
        `Property ${propertyId} already has a planning process state. Use PATCH to update.`,
      );
    }

    return this.prisma.planningProcessState.create({
      data: {
        propertyId,
        stateType: dto.stateType,
        lastUpdateDate: new Date(dto.lastUpdateDate),
        developerName: dto.developerName,
        projectedSizeAfter: dto.projectedSizeAfter,
        notes: dto.notes,
      },
    });
  }

  /**
   * Find planning process state by property ID
   */
  async findByProperty(propertyId: string) {
    const state = await this.prisma.planningProcessState.findUnique({
      where: { propertyId },
    });

    if (!state) {
      throw new NotFoundException(
        `Planning process state for property ${propertyId} not found`,
      );
    }

    return state;
  }

  /**
   * Update planning process state for a property
   */
  async update(propertyId: string, dto: UpdatePlanningProcessStateDto) {
    await this.findByProperty(propertyId);

    return this.prisma.planningProcessState.update({
      where: { propertyId },
      data: {
        ...(dto.stateType !== undefined && { stateType: dto.stateType }),
        ...(dto.lastUpdateDate !== undefined && {
          lastUpdateDate: new Date(dto.lastUpdateDate),
        }),
        ...(dto.developerName !== undefined && {
          developerName: dto.developerName,
        }),
        ...(dto.projectedSizeAfter !== undefined && {
          projectedSizeAfter: dto.projectedSizeAfter,
        }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
  }

  /**
   * Remove planning process state for a property
   */
  async remove(propertyId: string) {
    await this.findByProperty(propertyId);

    await this.prisma.planningProcessState.delete({
      where: { propertyId },
    });
  }
}
