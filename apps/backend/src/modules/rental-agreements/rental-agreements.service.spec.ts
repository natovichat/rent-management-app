import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { RentalAgreementsService } from './rental-agreements.service';
import { PrismaService } from '../../database/prisma.service';
import { CreateRentalAgreementDto } from './dto/create-rental-agreement.dto';
import { UpdateRentalAgreementDto } from './dto/update-rental-agreement.dto';
import { QueryRentalAgreementDto } from './dto/query-rental-agreement.dto';
import { RentalAgreementStatus } from '@prisma/client';

const mockRentalAgreement = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  propertyId: '550e8400-e29b-41d4-a716-446655440001',
  tenantId: '550e8400-e29b-41d4-a716-446655440002',
  monthlyRent: 5000,
  startDate: new Date('2025-01-01'),
  endDate: new Date('2026-12-31'),
  status: RentalAgreementStatus.ACTIVE,
  hasExtensionOption: false,
  extensionUntilDate: null,
  extensionMonthlyRent: null,
  notes: 'Test agreement',
  createdAt: new Date(),
  updatedAt: new Date(),
  property: { id: '550e8400-e29b-41d4-a716-446655440001', address: 'Test St' },
  tenant: { id: '550e8400-e29b-41d4-a716-446655440002', name: 'John' },
};

describe('RentalAgreementsService', () => {
  let service: RentalAgreementsService;
  let prisma: PrismaService;

  const mockPrisma = {
    rentalAgreement: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    property: {
      findUnique: jest.fn(),
    },
    person: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RentalAgreementsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<RentalAgreementsService>(RentalAgreementsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a rental agreement', async () => {
      const dto: CreateRentalAgreementDto = {
        propertyId: '550e8400-e29b-41d4-a716-446655440001',
        tenantId: '550e8400-e29b-41d4-a716-446655440002',
        monthlyRent: 5000,
        startDate: '2025-01-01',
        endDate: '2026-12-31',
      };

      mockPrisma.property.findUnique.mockResolvedValue({ id: dto.propertyId });
      mockPrisma.person.findUnique.mockResolvedValue({ id: dto.tenantId });
      mockPrisma.rentalAgreement.create.mockResolvedValue(mockRentalAgreement);

      const result = await service.create(dto);

      expect(mockPrisma.property.findUnique).toHaveBeenCalledWith({
        where: { id: dto.propertyId },
      });
      expect(mockPrisma.person.findUnique).toHaveBeenCalledWith({
        where: { id: dto.tenantId },
      });
      expect(mockPrisma.rentalAgreement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          monthlyRent: dto.monthlyRent,
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          status: 'FUTURE',
          hasExtensionOption: false,
        }),
        include: expect.any(Object),
      });
      expect(result).toEqual(mockRentalAgreement);
    });

    it('should validate property exists', async () => {
      const dto: CreateRentalAgreementDto = {
        propertyId: 'non-existent-property',
        tenantId: '550e8400-e29b-41d4-a716-446655440002',
        monthlyRent: 5000,
        startDate: '2025-01-01',
        endDate: '2026-12-31',
      };

      mockPrisma.property.findUnique.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(/Property.*not found/);
      expect(mockPrisma.rentalAgreement.create).not.toHaveBeenCalled();
    });

    it('should validate tenant exists', async () => {
      const dto: CreateRentalAgreementDto = {
        propertyId: '550e8400-e29b-41d4-a716-446655440001',
        tenantId: 'non-existent-tenant',
        monthlyRent: 5000,
        startDate: '2025-01-01',
        endDate: '2026-12-31',
      };

      mockPrisma.property.findUnique.mockResolvedValue({ id: dto.propertyId });
      mockPrisma.person.findUnique.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(/tenant.*not found/);
      expect(mockPrisma.rentalAgreement.create).not.toHaveBeenCalled();
    });

    it('should validate endDate is after startDate', async () => {
      const dto: CreateRentalAgreementDto = {
        propertyId: '550e8400-e29b-41d4-a716-446655440001',
        tenantId: '550e8400-e29b-41d4-a716-446655440002',
        monthlyRent: 5000,
        startDate: '2026-12-31',
        endDate: '2025-01-01',
      };

      mockPrisma.property.findUnique.mockResolvedValue({ id: dto.propertyId });
      mockPrisma.person.findUnique.mockResolvedValue({ id: dto.tenantId });

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(
        'endDate must be after startDate',
      );
      expect(mockPrisma.rentalAgreement.create).not.toHaveBeenCalled();
    });

    it('should validate monthlyRent is greater than 0', async () => {
      const dto: CreateRentalAgreementDto = {
        propertyId: '550e8400-e29b-41d4-a716-446655440001',
        tenantId: '550e8400-e29b-41d4-a716-446655440002',
        monthlyRent: 0,
        startDate: '2025-01-01',
        endDate: '2026-12-31',
      };

      mockPrisma.property.findUnique.mockResolvedValue({ id: dto.propertyId });
      mockPrisma.person.findUnique.mockResolvedValue({ id: dto.tenantId });

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(
        'monthlyRent must be greater than 0',
      );
      expect(mockPrisma.rentalAgreement.create).not.toHaveBeenCalled();
    });

    it('should create with extension options', async () => {
      const dto: CreateRentalAgreementDto = {
        propertyId: '550e8400-e29b-41d4-a716-446655440001',
        tenantId: '550e8400-e29b-41d4-a716-446655440002',
        monthlyRent: 5000,
        startDate: '2025-01-01',
        endDate: '2026-12-31',
        hasExtensionOption: true,
        extensionUntilDate: '2027-06-30',
        extensionMonthlyRent: 5500,
        status: RentalAgreementStatus.FUTURE,
      };

      mockPrisma.property.findUnique.mockResolvedValue({ id: dto.propertyId });
      mockPrisma.person.findUnique.mockResolvedValue({ id: dto.tenantId });
      mockPrisma.rentalAgreement.create.mockResolvedValue(mockRentalAgreement);

      await service.create(dto);

      expect(mockPrisma.rentalAgreement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          hasExtensionOption: true,
          extensionUntilDate: new Date('2027-06-30'),
          extensionMonthlyRent: 5500,
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated rental agreements', async () => {
      mockPrisma.rentalAgreement.findMany.mockResolvedValue([
        mockRentalAgreement,
      ]);
      mockPrisma.rentalAgreement.count.mockResolvedValue(1);

      const query: QueryRentalAgreementDto = { page: 1, limit: 20 };
      const result = await service.findAll(query);

      expect(result).toEqual({
        data: [mockRentalAgreement],
        meta: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      });
      expect(mockPrisma.rentalAgreement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('should filter by status when provided', async () => {
      mockPrisma.rentalAgreement.findMany.mockResolvedValue([]);
      mockPrisma.rentalAgreement.count.mockResolvedValue(0);

      await service.findAll({ status: RentalAgreementStatus.ACTIVE });

      expect(mockPrisma.rentalAgreement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: RentalAgreementStatus.ACTIVE },
        }),
      );
    });

    it('should filter by propertyId and tenantId when provided', async () => {
      mockPrisma.rentalAgreement.findMany.mockResolvedValue([]);
      mockPrisma.rentalAgreement.count.mockResolvedValue(0);

      await service.findAll({
        propertyId: 'prop-1',
        tenantId: 'tenant-1',
      });

      expect(mockPrisma.rentalAgreement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            propertyId: 'prop-1',
            tenantId: 'tenant-1',
          },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return rental agreement when found', async () => {
      mockPrisma.rentalAgreement.findUnique.mockResolvedValue(
        mockRentalAgreement,
      );

      const result = await service.findOne(mockRentalAgreement.id);

      expect(result).toEqual(mockRentalAgreement);
      expect(mockPrisma.rentalAgreement.findUnique).toHaveBeenCalledWith({
        where: { id: mockRentalAgreement.id },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.rentalAgreement.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        'Rental agreement with ID non-existent-id not found',
      );
    });
  });

  describe('findByProperty', () => {
    it('should return rental agreements for property', async () => {
      mockPrisma.property.findUnique.mockResolvedValue({ id: 'prop-1' });
      mockPrisma.rentalAgreement.findMany.mockResolvedValue([
        mockRentalAgreement,
      ]);

      const result = await service.findByProperty('prop-1');

      expect(result).toEqual([mockRentalAgreement]);
      expect(mockPrisma.property.findUnique).toHaveBeenCalledWith({
        where: { id: 'prop-1' },
      });
      expect(mockPrisma.rentalAgreement.findMany).toHaveBeenCalledWith({
        where: { propertyId: 'prop-1' },
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when property not found', async () => {
      mockPrisma.property.findUnique.mockResolvedValue(null);

      await expect(service.findByProperty('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByProperty('non-existent')).rejects.toThrow(
        'Property with ID non-existent not found',
      );
      expect(mockPrisma.rentalAgreement.findMany).not.toHaveBeenCalled();
    });
  });

  describe('findByTenant', () => {
    it('should return rental agreements for tenant', async () => {
      mockPrisma.person.findUnique.mockResolvedValue({ id: 'tenant-1' });
      mockPrisma.rentalAgreement.findMany.mockResolvedValue([
        mockRentalAgreement,
      ]);

      const result = await service.findByTenant('tenant-1');

      expect(result).toEqual([mockRentalAgreement]);
      expect(mockPrisma.person.findUnique).toHaveBeenCalledWith({
        where: { id: 'tenant-1' },
      });
      expect(mockPrisma.rentalAgreement.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when person not found', async () => {
      mockPrisma.person.findUnique.mockResolvedValue(null);

      await expect(service.findByTenant('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByTenant('non-existent')).rejects.toThrow(
        'Person (tenant) with ID non-existent not found',
      );
      expect(mockPrisma.rentalAgreement.findMany).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update rental agreement', async () => {
      const updateDto: UpdateRentalAgreementDto = {
        notes: 'Updated notes',
        status: RentalAgreementStatus.TERMINATED,
      };
      const updated = { ...mockRentalAgreement, ...updateDto };

      mockPrisma.rentalAgreement.findUnique.mockResolvedValue(
        mockRentalAgreement,
      );
      mockPrisma.rentalAgreement.update.mockResolvedValue(updated);

      const result = await service.update(mockRentalAgreement.id, updateDto);

      expect(mockPrisma.rentalAgreement.update).toHaveBeenCalledWith({
        where: { id: mockRentalAgreement.id },
        data: expect.objectContaining({
          notes: updateDto.notes,
          status: updateDto.status,
        }),
        include: expect.any(Object),
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when updating non-existent agreement', async () => {
      mockPrisma.rentalAgreement.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { notes: 'Test' }),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrisma.rentalAgreement.update).not.toHaveBeenCalled();
    });

    it('should validate endDate after startDate when both provided', async () => {
      mockPrisma.rentalAgreement.findUnique.mockResolvedValue(
        mockRentalAgreement,
      );

      await expect(
        service.update(mockRentalAgreement.id, {
          startDate: '2026-12-31',
          endDate: '2025-01-01',
        }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update(mockRentalAgreement.id, {
          startDate: '2026-12-31',
          endDate: '2025-01-01',
        }),
      ).rejects.toThrow('endDate must be after startDate');
      expect(mockPrisma.rentalAgreement.update).not.toHaveBeenCalled();
    });

    it('should validate monthlyRent is greater than 0 when provided', async () => {
      mockPrisma.rentalAgreement.findUnique.mockResolvedValue(
        mockRentalAgreement,
      );

      await expect(
        service.update(mockRentalAgreement.id, { monthlyRent: 0 }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update(mockRentalAgreement.id, { monthlyRent: 0 }),
      ).rejects.toThrow('monthlyRent must be greater than 0');
      expect(mockPrisma.rentalAgreement.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete rental agreement', async () => {
      mockPrisma.rentalAgreement.findUnique.mockResolvedValue(
        mockRentalAgreement,
      );
      mockPrisma.rentalAgreement.delete.mockResolvedValue(mockRentalAgreement);

      const result = await service.remove(mockRentalAgreement.id);

      expect(mockPrisma.rentalAgreement.delete).toHaveBeenCalledWith({
        where: { id: mockRentalAgreement.id },
      });
      expect(result).toEqual(mockRentalAgreement);
    });

    it('should throw NotFoundException when agreement not found', async () => {
      mockPrisma.rentalAgreement.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.rentalAgreement.delete).not.toHaveBeenCalled();
    });
  });
});
