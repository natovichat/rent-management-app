import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as request from 'supertest';
import { OwnersController } from './owners.controller';
import { OwnersService } from './owners.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { OwnerType } from '@prisma/client';

const mockOwner = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'John Doe',
  type: OwnerType.INDIVIDUAL,
  idNumber: '123456789',
  email: 'john@example.com',
  phone: '050-1234567',
  address: '123 Main St',
  notes: 'Test notes',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('OwnersController', () => {
  let app: INestApplication;

  const mockOwnersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OwnersController],
      providers: [
        {
          provide: OwnersService,
          useValue: mockOwnersService,
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

  describe('POST /api/owners', () => {
    it('should create an owner', async () => {
      const dto: CreateOwnerDto = {
        name: 'John Doe',
        type: OwnerType.INDIVIDUAL,
        email: 'john@example.com',
      };

      mockOwnersService.create.mockResolvedValue(mockOwner);

      const response = await request(app.getHttpServer())
        .post('/owners')
        .send(dto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: mockOwner.id,
        name: dto.name,
        type: dto.type,
        email: dto.email,
      });
      expect(mockOwnersService.create).toHaveBeenCalledWith(dto);
    });

    it('should return 400 when name is too short', async () => {
      await request(app.getHttpServer())
        .post('/owners')
        .send({
          name: 'J',
          type: OwnerType.INDIVIDUAL,
        })
        .expect(400);

      expect(mockOwnersService.create).not.toHaveBeenCalled();
    });

    it('should return 400 when type is invalid', async () => {
      await request(app.getHttpServer())
        .post('/owners')
        .send({
          name: 'John Doe',
          type: 'INVALID_TYPE',
        })
        .expect(400);

      expect(mockOwnersService.create).not.toHaveBeenCalled();
    });

    it('should return 400 when type is missing', async () => {
      await request(app.getHttpServer())
        .post('/owners')
        .send({
          name: 'John Doe',
        })
        .expect(400);

      expect(mockOwnersService.create).not.toHaveBeenCalled();
    });

    it('should return 400 when name is missing', async () => {
      await request(app.getHttpServer())
        .post('/owners')
        .send({
          type: OwnerType.INDIVIDUAL,
        })
        .expect(400);

      expect(mockOwnersService.create).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid email', async () => {
      await request(app.getHttpServer())
        .post('/owners')
        .send({
          name: 'John Doe',
          type: OwnerType.INDIVIDUAL,
          email: 'not-an-email',
        })
        .expect(400);

      expect(mockOwnersService.create).not.toHaveBeenCalled();
    });

    it('should reject unknown properties', async () => {
      await request(app.getHttpServer())
        .post('/owners')
        .send({
          name: 'John Doe',
          type: OwnerType.INDIVIDUAL,
          unknownField: 'value',
        })
        .expect(400);

      expect(mockOwnersService.create).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/owners', () => {
    it('should return paginated list of owners', async () => {
      const paginatedResponse = {
        data: [mockOwner],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      mockOwnersService.findAll.mockResolvedValue(paginatedResponse);

      const response = await request(app.getHttpServer())
        .get('/owners')
        .expect(200);

      expect(response.body).toMatchObject({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: mockOwner.id,
            name: mockOwner.name,
            type: mockOwner.type,
          }),
        ]),
        meta: paginatedResponse.meta,
      });
      expect(mockOwnersService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });

    it('should pass query params to findAll', async () => {
      mockOwnersService.findAll.mockResolvedValue({ data: [], meta: {} });

      await request(app.getHttpServer())
        .get('/owners')
        .query({ page: 2, limit: 20, search: 'john', type: 'COMPANY' })
        .expect(200);

      expect(mockOwnersService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 20,
          search: 'john',
          type: OwnerType.COMPANY,
        }),
      );
    });
  });

  describe('GET /api/owners/:id', () => {
    it('should return owner by id', async () => {
      mockOwnersService.findOne.mockResolvedValue(mockOwner);

      const response = await request(app.getHttpServer())
        .get(`/owners/${mockOwner.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: mockOwner.id,
        name: mockOwner.name,
        type: mockOwner.type,
      });
      expect(mockOwnersService.findOne).toHaveBeenCalledWith(mockOwner.id);
    });

    it('should return 404 when owner not found', async () => {
      mockOwnersService.findOne.mockRejectedValue(
        new NotFoundException('Owner with id not-found not found'),
      );

      await request(app.getHttpServer())
        .get('/owners/not-found')
        .expect(404);
    });
  });

  describe('PATCH /api/owners/:id', () => {
    it('should update owner', async () => {
      const updateDto: UpdateOwnerDto = {
        name: 'John Updated',
        email: 'updated@example.com',
      };
      const updated = { ...mockOwner, ...updateDto };

      mockOwnersService.update.mockResolvedValue(updated);

      const response = await request(app.getHttpServer())
        .patch(`/owners/${mockOwner.id}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject(updateDto);
      expect(mockOwnersService.update).toHaveBeenCalledWith(
        mockOwner.id,
        updateDto,
      );
    });

    it('should return 404 when updating non-existent owner', async () => {
      mockOwnersService.update.mockRejectedValue(
        new NotFoundException('Owner with id not-found not found'),
      );

      await request(app.getHttpServer())
        .patch('/owners/not-found')
        .send({ name: 'Updated' })
        .expect(404);
    });

    it('should return 400 when update has invalid type', async () => {
      await request(app.getHttpServer())
        .patch(`/owners/${mockOwner.id}`)
        .send({ type: 'INVALID' })
        .expect(400);

      expect(mockOwnersService.update).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/owners/:id', () => {
    it('should delete owner and return 204', async () => {
      mockOwnersService.remove.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete(`/owners/${mockOwner.id}`)
        .expect(204);

      expect(mockOwnersService.remove).toHaveBeenCalledWith(mockOwner.id);
    });

    it('should return 404 when deleting non-existent owner', async () => {
      mockOwnersService.remove.mockRejectedValue(
        new NotFoundException('Owner with id not-found not found'),
      );

      await request(app.getHttpServer())
        .delete('/owners/not-found')
        .expect(404);
    });

    it('should return 409 when owner has ownerships', async () => {
      mockOwnersService.remove.mockRejectedValue(
        new ConflictException(
          'Cannot delete owner: has 1 ownership(s). Remove ownerships first.',
        ),
      );

      await request(app.getHttpServer())
        .delete(`/owners/${mockOwner.id}`)
        .expect(409);
    });
  });
});
