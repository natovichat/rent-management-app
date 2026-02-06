import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PrismaService } from '../../database/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import {
  PropertyType,
  PropertyStatus,
  AcquisitionMethod,
  LegalStatus,
  PropertyCondition,
  LandType,
  ManagementFeeFrequency,
  TaxFrequency,
  EstimationSource,
} from '@prisma/client';

describe('PropertiesService', () => {
  let service: PropertiesService;
  let prisma: PrismaService;
  let testAccountId: string;
  let testPropertyId: string;

  const mockPrismaService = {
    property: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
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
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
    prisma = module.get<PrismaService>(PrismaService);

    testAccountId = 'test-account-id';
    testPropertyId = 'test-property-id';

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreatePropertyDto = {
      address: 'Test Address',
      type: PropertyType.RESIDENTIAL,
      status: PropertyStatus.OWNED,
    };

    it('should create a property successfully', async () => {
      const mockProperty = {
        id: testPropertyId,
        accountId: testAccountId,
        ...createDto,
        _count: { units: 0 },
      };

      mockPrismaService.property.create.mockResolvedValue(mockProperty);

      const result = await service.create(testAccountId, createDto);

      expect(result).toEqual({
        ...mockProperty,
        unitCount: 0,
      });
      expect(mockPrismaService.property.create).toHaveBeenCalledWith({
        data: {
          accountId: testAccountId,
          ...createDto,
        },
        include: {
          _count: {
            select: { units: true },
          },
        },
      });
    });

    it('should throw BadRequestException when acquisitionDate > saleDate', async () => {
      const invalidDto: CreatePropertyDto = {
        address: 'Test Address',
        acquisitionDate: '2023-06-15T00:00:00.000Z',
        saleDate: '2020-01-15T00:00:00.000Z',
      };

      await expect(service.create(testAccountId, invalidDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(testAccountId, invalidDto)).rejects.toThrow(
        'תאריך רכישה חייב להיות לפני או שווה לתאריך מכירה',
      );
    });

    it('should throw BadRequestException when landArea > totalArea', async () => {
      const invalidDto: CreatePropertyDto = {
        address: 'Test Address',
        landArea: 200,
        totalArea: 100,
      };

      await expect(service.create(testAccountId, invalidDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(testAccountId, invalidDto)).rejects.toThrow(
        'שטח קרקע לא יכול להיות גדול משטח כולל',
      );
    });

    it('should throw BadRequestException when sharedOwnershipPercentage < 0', async () => {
      const invalidDto: CreatePropertyDto = {
        address: 'Test Address',
        sharedOwnershipPercentage: -1,
      };

      await expect(service.create(testAccountId, invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when sharedOwnershipPercentage > 100', async () => {
      const invalidDto: CreatePropertyDto = {
        address: 'Test Address',
        sharedOwnershipPercentage: 101,
      };

      await expect(service.create(testAccountId, invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when isSold=true but saleDate is missing', async () => {
      const invalidDto: CreatePropertyDto = {
        address: 'Test Address',
        isSold: true,
      };

      await expect(service.create(testAccountId, invalidDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(testAccountId, invalidDto)).rejects.toThrow(
        'נכס שנמכר חייב לכלול תאריך מכירה',
      );
    });

    it('should throw BadRequestException when isPartialOwnership=true but sharedOwnershipPercentage is missing', async () => {
      const invalidDto: CreatePropertyDto = {
        address: 'Test Address',
        isPartialOwnership: true,
      };

      await expect(service.create(testAccountId, invalidDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(testAccountId, invalidDto)).rejects.toThrow(
        'נכס בבעלות חלקית חייב לכלול אחוז בעלות משותפת',
      );
    });

    it('should accept valid business rules', async () => {
      const validDto: CreatePropertyDto = {
        address: 'Test Address',
        acquisitionDate: '2020-01-15T00:00:00.000Z',
        saleDate: '2023-06-15T00:00:00.000Z',
        landArea: 100,
        totalArea: 200,
        sharedOwnershipPercentage: 50.5,
        isSold: true,
        isPartialOwnership: true,
      };

      const mockProperty = {
        id: testPropertyId,
        accountId: testAccountId,
        ...validDto,
        _count: { units: 0 },
      };

      mockPrismaService.property.create.mockResolvedValue(mockProperty);

      const result = await service.create(testAccountId, validDto);
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    const existingProperty = {
      id: testPropertyId,
      accountId: testAccountId,
      address: 'Existing Address',
      acquisitionDate: new Date('2020-01-15'),
      saleDate: null,
      landArea: 100,
      totalArea: 200,
      isPartialOwnership: false,
      sharedOwnershipPercentage: null,
    };

    beforeEach(() => {
      mockPrismaService.property.findFirst.mockResolvedValue(existingProperty);
    });

    it('should update property successfully', async () => {
      const updateDto: UpdatePropertyDto = {
        address: 'Updated Address',
      };

      const updatedProperty = {
        ...existingProperty,
        ...updateDto,
        _count: { units: 0 },
      };

      mockPrismaService.property.update.mockResolvedValue(updatedProperty);

      const result = await service.update(testPropertyId, testAccountId, updateDto);

      expect(result).toEqual({
        ...updatedProperty,
        unitCount: 0,
      });
    });

    it('should throw NotFoundException when property does not exist', async () => {
      mockPrismaService.property.findFirst.mockResolvedValue(null);

      await expect(
        service.update(testPropertyId, testAccountId, { address: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should validate business rules on update', async () => {
      const invalidUpdate: UpdatePropertyDto = {
        acquisitionDate: '2023-06-15T00:00:00.000Z',
        saleDate: '2020-01-15T00:00:00.000Z',
      };

      await expect(
        service.update(testPropertyId, testAccountId, invalidUpdate),
      ).rejects.toThrow(BadRequestException);
    });

    it('should validate combined existing and new values', async () => {
      const updateDto: UpdatePropertyDto = {
        saleDate: '2019-01-15T00:00:00.000Z', // Before existing acquisitionDate (2020-01-15)
      };

      await expect(
        service.update(testPropertyId, testAccountId, updateDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should validate landArea vs totalArea on update', async () => {
      const invalidUpdate: UpdatePropertyDto = {
        landArea: 300, // Greater than existing totalArea (200)
      };

      await expect(
        service.update(testPropertyId, testAccountId, invalidUpdate),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return property with all fields', async () => {
      const mockProperty = {
        id: testPropertyId,
        accountId: testAccountId,
        address: 'Test Address',
        type: PropertyType.RESIDENTIAL,
        status: PropertyStatus.OWNED,
        floors: 3,
        totalUnits: 12,
        parkingSpaces: 5,
        acquisitionPrice: 2000000,
        acquisitionMethod: AcquisitionMethod.PURCHASE,
        legalStatus: LegalStatus.REGISTERED,
        propertyCondition: PropertyCondition.EXCELLENT,
        landType: LandType.URBAN,
        managementFeeFrequency: ManagementFeeFrequency.MONTHLY,
        taxFrequency: TaxFrequency.QUARTERLY,
        estimationSource: EstimationSource.PROFESSIONAL_APPRAISAL,
        units: [],
        plotInfo: null,
        ownerships: [],
        mortgages: [],
        valuations: [],
        investmentCompany: null,
        _count: { units: 0 },
      };

      mockPrismaService.property.findFirst.mockResolvedValue(mockProperty);

      const result = await service.findOne(testPropertyId, testAccountId);

      expect(result).toEqual({
        ...mockProperty,
        unitCount: 0,
      });
      expect(mockPrismaService.property.findFirst).toHaveBeenCalledWith({
        where: { id: testPropertyId, accountId: testAccountId },
        include: {
          units: {
            include: {
              leases: {
                where: { status: 'ACTIVE' },
                include: { tenant: true },
              },
            },
          },
          plotInfo: true,
          ownerships: {
            include: {
              owner: true,
            },
          },
          mortgages: true,
          valuations: {
            orderBy: {
              valuationDate: 'desc',
            },
          },
          investmentCompany: true,
          _count: {
            select: { units: true },
          },
        },
      });
    });

    it('should throw NotFoundException when property does not exist', async () => {
      mockPrismaService.property.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne(testPropertyId, testAccountId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
