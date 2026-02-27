import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { QueryPersonDto } from './dto/query-person.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PersonsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePersonDto) {
    return this.prisma.person.create({
      data: {
        name: dto.name,
        idNumber: dto.idNumber ?? undefined,
        email: dto.email ?? undefined,
        phone: dto.phone ?? undefined,
        notes: dto.notes ?? undefined,
      },
    });
  }

  async findAll(query: QueryPersonDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PersonWhereInput = {};

    if (search?.trim()) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.person.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.person.count({ where }),
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

  async findOne(id: string) {
    const person = await this.prisma.person.findUnique({
      where: { id },
    });

    if (!person) {
      throw new NotFoundException(`Person with id ${id} not found`);
    }

    return person;
  }

  async update(id: string, dto: UpdatePersonDto) {
    await this.findOne(id);

    return this.prisma.person.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.idNumber !== undefined && { idNumber: dto.idNumber }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
  }

  async remove(id: string) {
    const person = await this.prisma.person.findUnique({
      where: { id },
      include: {
        mortgageOwnerOf: { take: 1 },
        mortgagePayerOf: { take: 1 },
        tenantsOf: { take: 1 },
      },
    });

    if (!person) {
      throw new NotFoundException(`Person with id ${id} not found`);
    }

    const hasMortgageOwner = person.mortgageOwnerOf.length > 0;
    const hasMortgagePayer = person.mortgagePayerOf.length > 0;
    const hasRentalAgreements = person.tenantsOf.length > 0;

    if (hasMortgageOwner || hasMortgagePayer || hasRentalAgreements) {
      const relations: string[] = [];
      if (hasMortgageOwner) relations.push('mortgages (as owner)');
      if (hasMortgagePayer) relations.push('mortgages (as payer)');
      if (hasRentalAgreements) relations.push('rental agreements');
      throw new ConflictException(
        `Cannot delete person: has related ${relations.join(', ')}`,
      );
    }

    return this.prisma.person.delete({
      where: { id },
    });
  }
}
