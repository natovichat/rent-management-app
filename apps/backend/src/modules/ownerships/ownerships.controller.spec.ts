import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, NotFoundException } from '@nestjs/common';
import * as request from 'supertest';
import {
  PropertyOwnershipsController,
  PersonOwnershipsController,
  OwnershipsController,
} from './ownerships.controller';
import { OwnershipsService } from './ownerships.service';
import { CreateOwnershipDto } from './dto/create-ownership.dto';
import { UpdateOwnershipDto } from './dto/update-ownership.dto';
import { OwnershipType } from '@prisma/client';

const mockPropertyId = '550e8400-e29b-41d4-a716-446655440001';
const mockPersonId = '550e8400-e29b-41d4-a716-446655440002';
const mockOwnershipId = '550e8400-e29b-41d4-a716-446655440003';

const mockOwnership = {
  id: mockOwnershipId,
  propertyId: mockPropertyId,
  personId: mockPersonId,
  ownershipPercentage: 50,
  ownershipType: OwnershipType.REAL,
  managementFee: 500,
  familyDivision: false,
  startDate: new Date('2025-01-01'),
  endDate: null,
  notes: 'Test notes',
  createdAt: new Date(),
  updatedAt: new Date(),
  person: { id: mockPersonId, name: 'John Doe', type: 'INDIVIDUAL' },
  property: { id: mockPropertyId, address: '123 Main St' },
};

describe('OwnershipsController', () => {
  let app: INestApplication;

  const mockOwnershipsService = {
    create: jest.fn(),
    findByProperty: jest.fn(),
    findByPerson: jest.fn(),
    findOne: jest.fn(),
    validateTotalOwnership: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [
        PropertyOwnershipsController,
        PersonOwnershipsController,
        OwnershipsController,
      ],
      providers: [
        {
          provide: OwnershipsService,
          useValue: mockOwnershipsService,
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

  describe('POST /properties/:propertyId/ownerships', () => {
    const createDto: CreateOwnershipDto = {
      personId: mockPersonId,
      ownershipPercentage: 50,
      ownershipType: OwnershipType.REAL,
      startDate: '2025-01-01',
      familyDivision: false,
    };

    it('should create ownership for property', async () => {
      mockOwnershipsService.create.mockResolvedValue(mockOwnership);

      const response = await request(app.getHttpServer())
        .post(`/properties/${mockPropertyId}/ownerships`)
        .send(createDto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: mockOwnershipId,
        propertyId: mockPropertyId,
        personId: mockPersonId,
        ownershipPercentage: 50,
        ownershipType: OwnershipType.REAL,
      });
      expect(mockOwnershipsService.create).toHaveBeenCalledWith(
        mockPropertyId,
        createDto,
      );
    });

    it('should return 400 when ownershipPercentage is out of range', async () => {
      await request(app.getHttpServer())
        .post(`/properties/${mockPropertyId}/ownerships`)
        .send({ ...createDto, ownershipPercentage: 150 })
        .expect(400);

      expect(mockOwnershipsService.create).not.toHaveBeenCalled();
    });

    it('should return 400 when personId is invalid UUID', async () => {
      await request(app.getHttpServer())
        .post(`/properties/${mockPropertyId}/ownerships`)
        .send({ ...createDto, personId: 'invalid' })
        .expect(400);

      expect(mockOwnershipsService.create).not.toHaveBeenCalled();
    });

    it('should return 400 when required fields are missing', async () => {
      await request(app.getHttpServer())
        .post(`/properties/${mockPropertyId}/ownerships`)
        .send({ personId: mockPersonId })
        .expect(400);

      expect(mockOwnershipsService.create).not.toHaveBeenCalled();
    });
  });

  describe('GET /properties/:propertyId/ownerships', () => {
    it('should return ownerships for property', async () => {
      mockOwnershipsService.findByProperty.mockResolvedValue([mockOwnership]);

      const response = await request(app.getHttpServer())
        .get(`/properties/${mockPropertyId}/ownerships`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        id: mockOwnershipId,
        propertyId: mockPropertyId,
        personId: mockPersonId,
        ownershipPercentage: 50,
        ownershipType: OwnershipType.REAL,
      });
      expect(mockOwnershipsService.findByProperty).toHaveBeenCalledWith(
        mockPropertyId,
      );
    });

    it('should return 404 when property not found', async () => {
      mockOwnershipsService.findByProperty.mockRejectedValue(
        new NotFoundException('Property not found'),
      );

      await request(app.getHttpServer())
        .get(`/properties/${mockPropertyId}/ownerships`)
        .expect(404);
    });
  });

  describe('GET /properties/:propertyId/ownerships/validate', () => {
    it('should return validation result', async () => {
      const validationResult = {
        isValid: true,
        totalPercentage: 100,
        message: 'Total ownership is 100%',
      };
      mockOwnershipsService.validateTotalOwnership.mockResolvedValue(
        validationResult,
      );

      const response = await request(app.getHttpServer())
        .get(`/properties/${mockPropertyId}/ownerships/validate`)
        .expect(200);

      expect(response.body).toEqual(validationResult);
      expect(mockOwnershipsService.validateTotalOwnership).toHaveBeenCalledWith(
        mockPropertyId,
      );
    });

    it('should return 404 when property not found', async () => {
      mockOwnershipsService.validateTotalOwnership.mockRejectedValue(
        new NotFoundException('Property not found'),
      );

      await request(app.getHttpServer())
        .get(`/properties/${mockPropertyId}/ownerships/validate`)
        .expect(404);
    });
  });

  describe('GET /persons/:personId/ownerships', () => {
    it('should return ownerships for person', async () => {
      mockOwnershipsService.findByPerson.mockResolvedValue([mockOwnership]);

      const response = await request(app.getHttpServer())
        .get(`/persons/${mockPersonId}/ownerships`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        id: mockOwnershipId,
        propertyId: mockPropertyId,
        personId: mockPersonId,
      });
      expect(mockOwnershipsService.findByPerson).toHaveBeenCalledWith(
        mockPersonId,
      );
    });

    it('should return 404 when person not found', async () => {
      mockOwnershipsService.findByPerson.mockRejectedValue(
        new NotFoundException('Person not found'),
      );

      await request(app.getHttpServer())
        .get(`/persons/${mockPersonId}/ownerships`)
        .expect(404);
    });
  });

  describe('GET /ownerships/:id', () => {
    it('should return ownership by id', async () => {
      mockOwnershipsService.findOne.mockResolvedValue(mockOwnership);

      const response = await request(app.getHttpServer())
        .get(`/ownerships/${mockOwnershipId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: mockOwnershipId,
        propertyId: mockPropertyId,
        personId: mockPersonId,
      });
      expect(mockOwnershipsService.findOne).toHaveBeenCalledWith(
        mockOwnershipId,
      );
    });

    it('should return 404 when ownership not found', async () => {
      mockOwnershipsService.findOne.mockRejectedValue(
        new NotFoundException('Ownership not found'),
      );

      await request(app.getHttpServer())
        .get(`/ownerships/${mockOwnershipId}`)
        .expect(404);
    });
  });

  describe('PATCH /ownerships/:id', () => {
    it('should update ownership', async () => {
      const updateDto: UpdateOwnershipDto = {
        ownershipPercentage: 75,
        notes: 'Updated',
      };
      const updated = { ...mockOwnership, ...updateDto };
      mockOwnershipsService.update.mockResolvedValue(updated);

      const response = await request(app.getHttpServer())
        .patch(`/ownerships/${mockOwnershipId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject(updateDto);
      expect(mockOwnershipsService.update).toHaveBeenCalledWith(
        mockOwnershipId,
        updateDto,
      );
    });

    it('should return 404 when ownership not found', async () => {
      mockOwnershipsService.update.mockRejectedValue(
        new NotFoundException('Ownership not found'),
      );

      await request(app.getHttpServer())
        .patch(`/ownerships/${mockOwnershipId}`)
        .send({ notes: 'Updated' })
        .expect(404);
    });

    it('should return 400 when percentage is invalid', async () => {
      await request(app.getHttpServer())
        .patch(`/ownerships/${mockOwnershipId}`)
        .send({ ownershipPercentage: -10 })
        .expect(400);

      expect(mockOwnershipsService.update).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /ownerships/:id', () => {
    it('should delete ownership and return 204', async () => {
      mockOwnershipsService.remove.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete(`/ownerships/${mockOwnershipId}`)
        .expect(204);

      expect(mockOwnershipsService.remove).toHaveBeenCalledWith(
        mockOwnershipId,
      );
    });

    it('should return 404 when ownership not found', async () => {
      mockOwnershipsService.remove.mockRejectedValue(
        new NotFoundException('Ownership not found'),
      );

      await request(app.getHttpServer())
        .delete(`/ownerships/${mockOwnershipId}`)
        .expect(404);
    });
  });
});
