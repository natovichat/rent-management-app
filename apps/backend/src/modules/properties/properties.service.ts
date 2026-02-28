import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { QueryPropertyDto } from './dto/query-property.dto';
import {
  PropertyType,
  PropertyStatus,
  Prisma,
} from '@prisma/client';

/** Map lowercase include names to Prisma relation names */
const INCLUDE_MAP: Record<string, keyof Prisma.PropertyInclude> = {
  planningprocessstate: 'planningProcessState',
  utilityinfo: 'utilityInfo',
};

/**
 * Service for managing properties
 */
@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Parse and validate include query param
   */
  private parseInclude(includeStr?: string): Prisma.PropertyInclude | undefined {
    if (!includeStr || !includeStr.trim()) {
      return undefined;
    }
    const parts = includeStr
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (parts.length === 0) {
      return undefined;
    }
    const include: Prisma.PropertyInclude = {};
    for (const part of parts) {
      const key = INCLUDE_MAP[part];
      if (key) {
        include[key] = true;
      }
    }
    return Object.keys(include).length > 0 ? include : undefined;
  }

  /**
   * Map CreatePropertyDto to Prisma create data
   */
  private mapCreateDtoToData(dto: CreatePropertyDto): Prisma.PropertyCreateInput {
    const data: Prisma.PropertyCreateInput = {
      address: dto.address,
      fileNumber: dto.fileNumber,
      type: dto.type,
      status: dto.status,
      country: dto.country,
      city: dto.city,
      totalArea: dto.totalArea,
      landArea: dto.landArea,
      estimatedValue: dto.estimatedValue,
      lastValuationDate: dto.lastValuationDate
        ? new Date(dto.lastValuationDate)
        : undefined,
      gush: dto.gush,
      helka: dto.helka,
      isMortgaged: dto.isMortgaged,
      floors: dto.floors,
      totalUnits: dto.totalUnits,
      parkingSpaces: dto.parkingSpaces,
      balconySizeSqm: dto.balconySizeSqm,
      storageSizeSqm: dto.storageSizeSqm,
      parkingType: dto.parkingType,
      purchasePrice: dto.purchasePrice,
      purchaseDate: dto.purchaseDate
        ? new Date(dto.purchaseDate)
        : undefined,
      acquisitionMethod: dto.acquisitionMethod,
      estimatedRent: dto.estimatedRent,
      rentalIncome: dto.rentalIncome,
      projectedValue: dto.projectedValue,
      saleProjectedTax: dto.saleProjectedTax,
      cadastralNumber: dto.cadastralNumber,
      taxId: dto.taxId,
      registrationDate: dto.registrationDate
        ? new Date(dto.registrationDate)
        : undefined,
      legalStatus: dto.legalStatus,
      constructionYear: dto.constructionYear,
      lastRenovationYear: dto.lastRenovationYear,
      buildingPermitNumber: dto.buildingPermitNumber,
      propertyCondition: dto.propertyCondition,
      landType: dto.landType,
      landDesignation: dto.landDesignation,
      isPartialOwnership: dto.isPartialOwnership,
      sharedOwnershipPercentage: dto.sharedOwnershipPercentage,
      isSold: dto.isSold,
      saleDate: dto.saleDate ? new Date(dto.saleDate) : undefined,
      salePrice: dto.salePrice,
      propertyManager: dto.propertyManager,
      managementCompany: dto.managementCompany,
      managementFees: dto.managementFees,
      managementFeeFrequency: dto.managementFeeFrequency,
      taxAmount: dto.taxAmount,
      taxFrequency: dto.taxFrequency,
      lastTaxPayment: dto.lastTaxPayment
        ? new Date(dto.lastTaxPayment)
        : undefined,
      insuranceDetails: dto.insuranceDetails,
      insuranceExpiry: dto.insuranceExpiry
        ? new Date(dto.insuranceExpiry)
        : undefined,
      zoning: dto.zoning,
      utilities: dto.utilities,
      restrictions: dto.restrictions,
      estimationSource: dto.estimationSource,
      notes: dto.notes,
    };
    return Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined),
    ) as Prisma.PropertyCreateInput;
  }

  /**
   * Map UpdatePropertyDto to Prisma update data
   */
  private mapUpdateDtoToData(dto: UpdatePropertyDto): Prisma.PropertyUpdateInput {
    const data: Prisma.PropertyUpdateInput = {
      address: dto.address,
      fileNumber: dto.fileNumber,
      type: dto.type,
      status: dto.status,
      country: dto.country,
      city: dto.city,
      totalArea: dto.totalArea,
      landArea: dto.landArea,
      estimatedValue: dto.estimatedValue,
      lastValuationDate: dto.lastValuationDate
        ? new Date(dto.lastValuationDate)
        : undefined,
      gush: dto.gush,
      helka: dto.helka,
      isMortgaged: dto.isMortgaged,
      floors: dto.floors,
      totalUnits: dto.totalUnits,
      parkingSpaces: dto.parkingSpaces,
      balconySizeSqm: dto.balconySizeSqm,
      storageSizeSqm: dto.storageSizeSqm,
      parkingType: dto.parkingType,
      purchasePrice: dto.purchasePrice,
      purchaseDate: dto.purchaseDate
        ? new Date(dto.purchaseDate)
        : undefined,
      acquisitionMethod: dto.acquisitionMethod,
      estimatedRent: dto.estimatedRent,
      rentalIncome: dto.rentalIncome,
      projectedValue: dto.projectedValue,
      saleProjectedTax: dto.saleProjectedTax,
      cadastralNumber: dto.cadastralNumber,
      taxId: dto.taxId,
      registrationDate: dto.registrationDate
        ? new Date(dto.registrationDate)
        : undefined,
      legalStatus: dto.legalStatus,
      constructionYear: dto.constructionYear,
      lastRenovationYear: dto.lastRenovationYear,
      buildingPermitNumber: dto.buildingPermitNumber,
      propertyCondition: dto.propertyCondition,
      landType: dto.landType,
      landDesignation: dto.landDesignation,
      isPartialOwnership: dto.isPartialOwnership,
      sharedOwnershipPercentage: dto.sharedOwnershipPercentage,
      isSold: dto.isSold,
      saleDate: dto.saleDate ? new Date(dto.saleDate) : undefined,
      salePrice: dto.salePrice,
      propertyManager: dto.propertyManager,
      managementCompany: dto.managementCompany,
      managementFees: dto.managementFees,
      managementFeeFrequency: dto.managementFeeFrequency,
      taxAmount: dto.taxAmount,
      taxFrequency: dto.taxFrequency,
      lastTaxPayment: dto.lastTaxPayment
        ? new Date(dto.lastTaxPayment)
        : undefined,
      insuranceDetails: dto.insuranceDetails,
      insuranceExpiry: dto.insuranceExpiry
        ? new Date(dto.insuranceExpiry)
        : undefined,
      zoning: dto.zoning,
      utilities: dto.utilities,
      restrictions: dto.restrictions,
      estimationSource: dto.estimationSource,
      notes: dto.notes,
    };
    return Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined),
    ) as Prisma.PropertyUpdateInput;
  }

  /**
   * Create a new property
   */
  async create(dto: CreatePropertyDto) {
    const data = this.mapCreateDtoToData(dto);
    return this.prisma.property.create({
      data,
    });
  }

  /**
   * Find all properties with pagination, search and filters
   */
  async findAll(query: QueryPropertyDto) {
    const { page = 1, limit = 10, search, type, status, city, country } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PropertyWhereInput = {};

    if (type) {
      where.type = type as PropertyType;
    }
    if (status) {
      where.status = status as PropertyStatus;
    }
    if (city) {
      where.city = { equals: city, mode: 'insensitive' };
    }
    if (country) {
      where.country = { equals: country, mode: 'insensitive' };
    }

    if (search && search.trim()) {
      where.OR = [
        { address: { contains: search.trim(), mode: 'insensitive' } },
        { city: { contains: search.trim(), mode: 'insensitive' } },
        { country: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: { address: 'asc' },
      }),
      this.prisma.property.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Find one property by ID with optional relations
   */
  async findOne(id: string, includeStr?: string) {
    const include = this.parseInclude(includeStr);

    const property = await this.prisma.property.findUnique({
      where: { id },
      include,
    });

    if (!property) {
      throw new NotFoundException(`Property with id ${id} not found`);
    }

    return property;
  }

  /**
   * Update a property
   */
  async update(id: string, dto: UpdatePropertyDto) {
    await this.findOne(id);

    const data = this.mapUpdateDtoToData(dto);
    return this.prisma.property.update({
      where: { id },
      data,
    });
  }

  /**
   * Remove a property. Fails if property has ownerships, mortgages, or rental agreements.
   */
  async remove(id: string) {
    const property = await this.prisma.property.findUnique({ where: { id } });

    if (!property) {
      throw new NotFoundException(`Property with id ${id} not found`);
    }

    // Delete all related data in the correct order within a transaction
    await this.prisma.$transaction(async (tx) => {
      // 1. Delete property events (some may reference rental agreements)
      await tx.propertyEvent.deleteMany({ where: { propertyId: id } });

      // 2. Delete rental agreements (onDelete: Restrict — must be removed manually)
      await tx.rentalAgreement.deleteMany({ where: { propertyId: id } });

      // 3. Delete mortgages tied to this property (onDelete: SetNull by default)
      await tx.mortgage.deleteMany({ where: { propertyId: id } });

      // 4. Delete the property itself.
      //    Ownerships, PlanningProcessState, UtilityInfo cascade automatically.
      await tx.property.delete({ where: { id } });
    });
  }
}
