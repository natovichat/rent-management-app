import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PersonsController } from './persons.controller';
import { PersonsService } from './persons.service';
import { RentalAgreementsService } from '../rental-agreements/rental-agreements.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('PersonsController', () => {
  let app: INestApplication;
  let personsService: PersonsService;

  const mockPerson = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'יוסי כהן',
    idNumber: '123456789',
    email: 'yossi@example.com',
    phone: '050-1234567',
    notes: 'Test notes',
    createdAt: new Date('2025-02-27T10:00:00.000Z'),
    updatedAt: new Date('2025-02-27T10:00:00.000Z'),
  };

  const mockPersonsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockRentalAgreementsService = {
    findByTenant: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [PersonsController],
      providers: [
        {
          provide: PersonsService,
          useValue: mockPersonsService,
        },
        {
          provide: RentalAgreementsService,
          useValue: mockRentalAgreementsService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    personsService = moduleFixture.get<PersonsService>(PersonsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /persons', () => {
    it('should create a person and return 201', async () => {
      const dto: CreatePersonDto = {
        name: 'יוסי כהן',
        email: 'yossi@example.com',
      };
      mockPersonsService.create.mockResolvedValue(mockPerson);

      const response = await request(app.getHttpServer())
        .post('/persons')
        .send(dto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: mockPerson.id,
        name: mockPerson.name,
        email: mockPerson.email,
      });
      expect(personsService.create).toHaveBeenCalledWith(dto);
    });

    it('should return 400 when name is too short', async () => {
      await request(app.getHttpServer())
        .post('/persons')
        .send({ name: 'A' })
        .expect(400);

      expect(personsService.create).not.toHaveBeenCalled();
    });

    it('should return 400 when name is missing', async () => {
      await request(app.getHttpServer())
        .post('/persons')
        .send({})
        .expect(400);

      expect(personsService.create).not.toHaveBeenCalled();
    });

    it('should return 400 when email is invalid', async () => {
      await request(app.getHttpServer())
        .post('/persons')
        .send({ name: 'יוסי כהן', email: 'invalid-email' })
        .expect(400);

      expect(personsService.create).not.toHaveBeenCalled();
    });

    it('should return 400 when extra fields are sent (forbidNonWhitelisted)', async () => {
      await request(app.getHttpServer())
        .post('/persons')
        .send({ name: 'יוסי כהן', unknownField: 'value' })
        .expect(400);

      expect(personsService.create).not.toHaveBeenCalled();
    });
  });

  describe('GET /persons', () => {
    it('should return paginated list', async () => {
      mockPersonsService.findAll.mockResolvedValue({
        data: [mockPerson],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      const response = await request(app.getHttpServer())
        .get('/persons')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
      expect(personsService.findAll).toHaveBeenCalled();
    });

    it('should pass query params to service', async () => {
      mockPersonsService.findAll.mockResolvedValue({
        data: [],
        meta: { page: 2, limit: 20, total: 0, totalPages: 0 },
      });

      await request(app.getHttpServer())
        .get('/persons')
        .query({ page: 2, limit: 20, search: 'יוסי' })
        .expect(200);

      expect(personsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 20,
          search: 'יוסי',
        }),
      );
    });
  });

  describe('GET /persons/:id', () => {
    it('should return person when found', async () => {
      mockPersonsService.findOne.mockResolvedValue(mockPerson);

      const response = await request(app.getHttpServer())
        .get(`/persons/${mockPerson.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: mockPerson.id,
        name: mockPerson.name,
      });
      expect(personsService.findOne).toHaveBeenCalledWith(mockPerson.id);
    });

    it('should return 404 when person not found', async () => {
      mockPersonsService.findOne.mockRejectedValue(
        new NotFoundException('Person with id non-existent not found'),
      );

      await request(app.getHttpServer())
        .get('/persons/non-existent')
        .expect(404);

      expect(personsService.findOne).toHaveBeenCalledWith('non-existent');
    });
  });

  describe('PATCH /persons/:id', () => {
    it('should update person and return 200', async () => {
      const dto: UpdatePersonDto = { name: 'Updated Name' };
      const updatedPerson = { ...mockPerson, name: 'Updated Name' };
      mockPersonsService.update.mockResolvedValue(updatedPerson);

      const response = await request(app.getHttpServer())
        .patch(`/persons/${mockPerson.id}`)
        .send(dto)
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
      expect(personsService.update).toHaveBeenCalledWith(mockPerson.id, dto);
    });

    it('should return 404 when person not found', async () => {
      mockPersonsService.update.mockRejectedValue(
        new NotFoundException('Person with id non-existent not found'),
      );

      await request(app.getHttpServer())
        .patch('/persons/non-existent')
        .send({ name: 'Test' })
        .expect(404);
    });
  });

  describe('DELETE /persons/:id', () => {
    it('should delete person and return 204', async () => {
      mockPersonsService.remove.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete(`/persons/${mockPerson.id}`)
        .expect(204);

      expect(personsService.remove).toHaveBeenCalledWith(mockPerson.id);
    });

    it('should return 404 when person not found', async () => {
      mockPersonsService.remove.mockRejectedValue(
        new NotFoundException('Person with id non-existent not found'),
      );

      await request(app.getHttpServer())
        .delete('/persons/non-existent')
        .expect(404);
    });

    it('should return 409 when person has relations', async () => {
      mockPersonsService.remove.mockRejectedValue(
        new ConflictException(
          'Cannot delete person: has related mortgages (as payer)',
        ),
      );

      await request(app.getHttpServer())
        .delete(`/persons/${mockPerson.id}`)
        .expect(409);
    });
  });
});
