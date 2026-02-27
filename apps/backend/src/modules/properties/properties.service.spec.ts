import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PrismaService } from '../../database/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { QueryPropertyDto } from './dto/query-property.dto';
import { PropertyType, PropertyStatus } from '@prisma/client';

const mockProperty = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  address: 'רחוב הרצל 15, תל אביב',
  fileNumber: '12345',
  type: PropertyType.RESIDENTIAL,
  status: PropertyStatus.OWNED,
  country: 'Israel',
  city: 'תל אביב',
  totalArea: null,
  landArea: null,
  estimatedValue: null,
  lastValuationDate: null,
  gush: null,
  helka: null,
  isMortgaged: false,
  floors: null,
  totalUnits: null,
  parkingSpaces: null,
  balconySizeSqm: null,
  storageSizeSqm: null,
  parkingType: null,
  purchasePrice: null,
  purchaseDate: null,
  acquisitionMethod: null,
  estimatedRent: null,
  rentalIncome: null,
  projectedValue: null,
  saleProjectedTax: null,
  cadastralNumber: null,
  taxId: null,
  registrationDate: null,
  legalStatus: null,
  constructionYear: null,
  lastRenovationYear: null,
  buildingPermitNumber: null,
  propertyCondition: null,
  landType: null,
  landDesignation: null,
  isPartialOwnership: false,
  sharedOwnershipPercentage: null,
  isSold: false,
  saleDate: null,
  salePrice: null,
  propertyManager: null,
  managementCompany: null,
  managementFees: null,
  managementFeeFrequency: null,
  taxAmount: null,
  taxFrequency: null,
  lastTaxPayment: null,
  insuranceDetails: null,
  insuranceExpiry: null,
  zoning: null,
  utilities: null,
  restrictions: null,
  estimationSource: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('PropertiesService', () => {
  let service: PropertiesService;
  let prisma: PrismaService;

  const mockPrisma = {
    property: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a property with minimal required fields', async () => {
      const dto: CreatePropertyDto = {
        address: 'רחוב הרצל 15, תל אביב',
      };

      mockPrisma.property.create.mockResolvedValue(mockProperty);

      const result = await service.create(dto);

      expect(mockPrisma.property.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          address: dto.address,
        }),
      });
      expect(result).toEqual(mockProperty);
    });

    it('should create property with all optional fields', async () => {
      const dto: CreatePropertyDto = {
        address: 'רחוב הרצל 15, תל אביב',
        fileNumber: '12345',
        type: PropertyType.RESIDENTIAL,
        status: PropertyStatus.OWNED,
        city: 'תל אביב',
        totalArea: 120.5,
        estimatedValue: 1500000,
      };

      const created = { ...mockProperty, ...dto };
      mockPrisma.property.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(mockPrisma.property.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          address: dto.address,
          fileNumber: dto.fileNumber,
          type: dto.type,
          status: dto.status,
          city: dto.city,
          totalArea: dto.totalArea,
          estimatedValue: dto.estimatedValue,
        }),
      });
      expect(result.type).toBe(PropertyType.RESIDENTIAL);
    });
  });

  describe('findAll', () => {
    it('should return paginated properties', async () => {
      mockPrisma.property.findMany.mockResolvedValue([mockProperty]);
      mockPrisma.property.count.mockResolvedValue(1);

      const query: QueryPropertyDto = { page: 1, limit: 10 };
      const result = await service.findAll(query);

      expect(result).toEqual({
        data: [mockProperty],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });
      expect(mockPrisma.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
          orderBy: { address: 'asc' },
        }),
      );
    });

    it('should filter by type when type is provided', async () => {
      mockPrisma.property.findMany.mockResolvedValue([]);
      mockPrisma.property.count.mockResolvedValue(0);

      await service.findAll({ type: PropertyType.COMMERCIAL });

      expect(mockPrisma.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { type: PropertyType.COMMERCIAL },
        }),
      );
    });

    it('should filter by status when status is provided', async () => {
      mockPrisma.property.findMany.mockResolvedValue([]);
      mockPrisma.property.count.mockResolvedValue(0);

      await service.findAll({ status: PropertyStatus.INVESTMENT });

      expect(mockPrisma.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: PropertyStatus.INVESTMENT },
        }),
      );
    });

    it('should search by address, city, country when search is provided', async () => {
      mockPrisma.property.findMany.mockResolvedValue([]);
      mockPrisma.property.count.mockResolvedValue(0);

      await service.findAll({ search: 'תל אביב' });

      expect(mockPrisma.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { address: { contains: 'תל אביב', mode: 'insensitive' } },
              { city: { contains: 'תל אביב', mode: 'insensitive' } },
              { country: { contains: 'תל אביב', mode: 'insensitive' } },
            ],
          },
        }),
      );
    });

    it('should combine type filter and search', async () => {
      mockPrisma.property.findMany.mockResolvedValue([]);
      mockPrisma.property.count.mockResolvedValue(0);

      await service.findAll({
        type: PropertyType.RESIDENTIAL,
        search: 'הרצל',
      });

      expect(mockPrisma.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            type: PropertyType.RESIDENTIAL,
            OR: [
              { address: { contains: 'הרצל', mode: 'insensitive' } },
              { city: { contains: 'הרצל', mode: 'insensitive' } },
              { country: { contains: 'הרצל', mode: 'insensitive' } },
            ],
          },
        }),
      );
    });

    it('should calculate correct skip for pagination', async () => {
      mockPrisma.property.findMany.mockResolvedValue([]);
      mockPrisma.property.count.mockResolvedValue(50);

      await service.findAll({ page: 3, limit: 10 });

      expect(mockPrisma.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return property when found', async () => {
      mockPrisma.property.findUnique.mockResolvedValue(mockProperty);

      const result = await service.findOne(mockProperty.id);

      expect(result).toEqual(mockProperty);
      expect(mockPrisma.property.findUnique).toHaveBeenCalledWith({
        where: { id: mockProperty.id },
        include: undefined,
      });
    });

    it('should include relations when include param is provided', async () => {
      mockPrisma.property.findUnique.mockResolvedValue({
        ...mockProperty,
        planningProcessState: {},
        utilityInfo: {},
      });

      const result = await service.findOne(
        mockProperty.id,
        'planningProcessState,utilityInfo',
      );

      expect(mockPrisma.property.findUnique).toHaveBeenCalledWith({
        where: { id: mockProperty.id },
        include: {
          planningProcessState: true,
          utilityInfo: true,
        },
      });
      expect(result).toHaveProperty('planningProcessState');
      expect(result).toHaveProperty('utilityInfo');
    });

    it('should throw NotFoundException when property not found', async () => {
      mockPrisma.property.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        'Property with id non-existent-id not found',
      );
    });
  });

  describe('update', () => {
    it('should update property', async () => {
      const updateDto: UpdatePropertyDto = {
        address: 'רחוב דיזנגוף 20, תל אביב',
        city: 'תל אביב',
      };
      const updated = { ...mockProperty, ...updateDto };

      mockPrisma.property.findUnique.mockResolvedValue(mockProperty);
      mockPrisma.property.update.mockResolvedValue(updated);

      const result = await service.update(mockProperty.id, updateDto);

      expect(mockPrisma.property.update).toHaveBeenCalledWith({
        where: { id: mockProperty.id },
        data: expect.objectContaining({
          address: updateDto.address,
          city: updateDto.city,
        }),
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when updating non-existent property', async () => {
      mockPrisma.property.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { address: 'Test' }),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrisma.property.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete property when no relations', async () => {
      mockPrisma.property.findUnique.mockResolvedValue({
        ...mockProperty,
        ownerships: [],
        mortgages: [],
        rentalAgreements: [],
      });
      mockPrisma.property.delete.mockResolvedValue(mockProperty);

      await service.remove(mockProperty.id);

      expect(mockPrisma.property.delete).toHaveBeenCalledWith({
        where: { id: mockProperty.id },
      });
    });

    it('should throw ConflictException when property has ownerships', async () => {
      mockPrisma.property.findUnique.mockResolvedValue({
        ...mockProperty,
        ownerships: [{ id: 'owner-1' }],
        mortgages: [],
        rentalAgreements: [],
      });

      await expect(service.remove(mockProperty.id)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.remove(mockProperty.id)).rejects.toThrow(
        /has 1 ownership\(s\)/,
      );
      expect(mockPrisma.property.delete).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when property has mortgages', async () => {
      mockPrisma.property.findUnique.mockResolvedValue({
        ...mockProperty,
        ownerships: [],
        mortgages: [{ id: 'mortgage-1' }],
        rentalAgreements: [],
      });

      await expect(service.remove(mockProperty.id)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.remove(mockProperty.id)).rejects.toThrow(
        /mortgage\(s\)/,
      );
      expect(mockPrisma.property.delete).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when property has rental agreements', async () => {
      mockPrisma.property.findUnique.mockResolvedValue({
        ...mockProperty,
        ownerships: [],
        mortgages: [],
        rentalAgreements: [{ id: 'agreement-1' }],
      });

      await expect(service.remove(mockProperty.id)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.remove(mockProperty.id)).rejects.toThrow(
        /rental agreement\(s\)/,
      );
      expect(mockPrisma.property.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when property not found', async () => {
      mockPrisma.property.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.property.delete).not.toHaveBeenCalled();
    });
  });
});
