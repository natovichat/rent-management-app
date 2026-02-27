import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as request from 'supertest';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { MortgagesService } from '../mortgages/mortgages.service';
import { RentalAgreementsService } from '../rental-agreements/rental-agreements.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
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

describe('PropertiesController', () => {
  let app: INestApplication;

  const mockPropertiesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockMortgagesService = {
    findByProperty: jest.fn(),
  };

  const mockRentalAgreementsService = {
    findByProperty: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertiesController],
      providers: [
        {
          provide: PropertiesService,
          useValue: mockPropertiesService,
        },
        {
          provide: MortgagesService,
          useValue: mockMortgagesService,
        },
        {
          provide: RentalAgreementsService,
          useValue: mockRentalAgreementsService,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    jest.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /api/properties', () => {
    it('should create a property', async () => {
      const dto: CreatePropertyDto = {
        address: 'רחוב הרצל 15, תל אביב',
        type: PropertyType.RESIDENTIAL,
        status: PropertyStatus.OWNED,
      };

      mockPropertiesService.create.mockResolvedValue(mockProperty);

      const response = await request(app.getHttpServer())
        .post('/properties')
        .send(dto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: mockProperty.id,
        address: dto.address,
        type: dto.type,
        status: dto.status,
      });
      expect(mockPropertiesService.create).toHaveBeenCalledWith(dto);
    });

    it('should return 400 when address is too short', async () => {
      await request(app.getHttpServer())
        .post('/properties')
        .send({
          address: '123',
        })
        .expect(400);

      expect(mockPropertiesService.create).not.toHaveBeenCalled();
    });

    it('should return 400 when address is missing', async () => {
      await request(app.getHttpServer())
        .post('/properties')
        .send({
          type: PropertyType.RESIDENTIAL,
        })
        .expect(400);

      expect(mockPropertiesService.create).not.toHaveBeenCalled();
    });

    it('should return 400 when type is invalid', async () => {
      await request(app.getHttpServer())
        .post('/properties')
        .send({
          address: 'רחוב הרצל 15, תל אביב',
          type: 'INVALID_TYPE',
        })
        .expect(400);

      expect(mockPropertiesService.create).not.toHaveBeenCalled();
    });

    it('should reject unknown properties', async () => {
      await request(app.getHttpServer())
        .post('/properties')
        .send({
          address: 'רחוב הרצל 15, תל אביב',
          unknownField: 'value',
        })
        .expect(400);

      expect(mockPropertiesService.create).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/properties', () => {
    it('should return paginated list of properties', async () => {
      const paginatedResponse = {
        data: [mockProperty],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      mockPropertiesService.findAll.mockResolvedValue(paginatedResponse);

      const response = await request(app.getHttpServer())
        .get('/properties')
        .expect(200);

      expect(response.body).toMatchObject({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: mockProperty.id,
            address: mockProperty.address,
            type: mockProperty.type,
            status: mockProperty.status,
          }),
        ]),
        meta: paginatedResponse.meta,
      });
      expect(mockPropertiesService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });

    it('should pass query params to findAll', async () => {
      mockPropertiesService.findAll.mockResolvedValue({ data: [], meta: {} });

      await request(app.getHttpServer())
        .get('/properties')
        .query({
          page: 2,
          limit: 20,
          search: 'תל אביב',
          type: 'COMMERCIAL',
          status: 'OWNED',
          city: 'תל אביב',
          country: 'Israel',
        })
        .expect(200);

      expect(mockPropertiesService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 20,
          search: 'תל אביב',
          type: PropertyType.COMMERCIAL,
          status: PropertyStatus.OWNED,
          city: 'תל אביב',
          country: 'Israel',
        }),
      );
    });
  });

  describe('GET /api/properties/:id', () => {
    it('should return property by id', async () => {
      mockPropertiesService.findOne.mockResolvedValue(mockProperty);

      const response = await request(app.getHttpServer())
        .get(`/properties/${mockProperty.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: mockProperty.id,
        address: mockProperty.address,
        type: mockProperty.type,
        status: mockProperty.status,
      });
      expect(mockPropertiesService.findOne).toHaveBeenCalledWith(
        mockProperty.id,
        undefined,
      );
    });

    it('should pass include param to findOne', async () => {
      mockPropertiesService.findOne.mockResolvedValue({
        ...mockProperty,
        planningProcessState: {},
        utilityInfo: {},
      });

      await request(app.getHttpServer())
        .get(`/properties/${mockProperty.id}`)
        .query({ include: 'planningProcessState,utilityInfo' })
        .expect(200);

      expect(mockPropertiesService.findOne).toHaveBeenCalledWith(
        mockProperty.id,
        'planningProcessState,utilityInfo',
      );
    });

    it('should return 404 when property not found', async () => {
      mockPropertiesService.findOne.mockRejectedValue(
        new NotFoundException('Property with id not-found not found'),
      );

      await request(app.getHttpServer())
        .get('/properties/not-found')
        .expect(404);
    });
  });

  describe('PATCH /api/properties/:id', () => {
    it('should update property', async () => {
      const updateDto: UpdatePropertyDto = {
        address: 'רחוב דיזנגוף 20, תל אביב',
        city: 'תל אביב',
      };
      const updated = { ...mockProperty, ...updateDto };

      mockPropertiesService.update.mockResolvedValue(updated);

      const response = await request(app.getHttpServer())
        .patch(`/properties/${mockProperty.id}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject(updateDto);
      expect(mockPropertiesService.update).toHaveBeenCalledWith(
        mockProperty.id,
        updateDto,
      );
    });

    it('should return 404 when updating non-existent property', async () => {
      mockPropertiesService.update.mockRejectedValue(
        new NotFoundException('Property with id not-found not found'),
      );

      await request(app.getHttpServer())
        .patch('/properties/not-found')
        .send({ address: 'Updated' })
        .expect(404);
    });

    it('should return 400 when update has invalid type', async () => {
      await request(app.getHttpServer())
        .patch(`/properties/${mockProperty.id}`)
        .send({ type: 'INVALID' })
        .expect(400);

      expect(mockPropertiesService.update).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/properties/:id', () => {
    it('should delete property and return 204', async () => {
      mockPropertiesService.remove.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete(`/properties/${mockProperty.id}`)
        .expect(204);

      expect(mockPropertiesService.remove).toHaveBeenCalledWith(
        mockProperty.id,
      );
    });

    it('should return 404 when deleting non-existent property', async () => {
      mockPropertiesService.remove.mockRejectedValue(
        new NotFoundException('Property with id not-found not found'),
      );

      await request(app.getHttpServer())
        .delete('/properties/not-found')
        .expect(404);
    });

    it('should return 409 when property has relations', async () => {
      mockPropertiesService.remove.mockRejectedValue(
        new ConflictException(
          'Cannot delete property: has 1 ownership(s). Remove relations first.',
        ),
      );

      await request(app.getHttpServer())
        .delete(`/properties/${mockProperty.id}`)
        .expect(409);
    });
  });
});
