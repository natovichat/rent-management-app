import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 20, propertyId?: string) {
    const skip = (page - 1) * limit;
    const where = propertyId ? { propertyId } : {};

    const [data, total] = await Promise.all([
      this.prisma.unit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          property: {
            select: { id: true, address: true, fileNumber: true },
          },
        },
      }),
      this.prisma.unit.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const unit = await this.prisma.unit.findUnique({
      where: { id },
      include: {
        property: {
          select: { id: true, address: true, fileNumber: true },
        },
      },
    });

    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }

    return unit;
  }

  async create(data: CreateUnitDto) {
    return this.prisma.unit.create({
      data,
      include: {
        property: {
          select: { id: true, address: true, fileNumber: true },
        },
      },
    });
  }

  async update(id: string, data: UpdateUnitDto) {
    await this.findOne(id);

    return this.prisma.unit.update({
      where: { id },
      data,
      include: {
        property: {
          select: { id: true, address: true, fileNumber: true },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.unit.delete({ where: { id } });
  }
}
