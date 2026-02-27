import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { BankAccountsController } from './bank-accounts.controller';
import { BankAccountsService } from './bank-accounts.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { BankAccountType } from './dto/create-bank-account.dto';

describe('BankAccountsController', () => {
  let app: INestApplication;
  let bankAccountsService: BankAccountsService;

  const mockBankAccount = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    bankName: 'בנק לאומי',
    branchNumber: '689',
    accountNumber: '123456',
    accountType: BankAccountType.PERSONAL_CHECKING,
    accountHolder: 'יוסי כהן',
    notes: 'חשבון עיקרי',
    isActive: true,
    createdAt: new Date('2025-02-27T10:00:00.000Z'),
    updatedAt: new Date('2025-02-27T10:00:00.000Z'),
  };

  const mockBankAccountsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [BankAccountsController],
      providers: [
        {
          provide: BankAccountsService,
          useValue: mockBankAccountsService,
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
    bankAccountsService =
      moduleFixture.get<BankAccountsService>(BankAccountsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /bank-accounts', () => {
    it('should create a bank account and return 201', async () => {
      const dto: CreateBankAccountDto = {
        bankName: 'בנק לאומי',
        accountNumber: '123456',
        accountType: BankAccountType.PERSONAL_CHECKING,
      };
      mockBankAccountsService.create.mockResolvedValue(mockBankAccount);

      const response = await request(app.getHttpServer())
        .post('/bank-accounts')
        .send(dto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: mockBankAccount.id,
        bankName: mockBankAccount.bankName,
        accountNumber: mockBankAccount.accountNumber,
      });
      expect(bankAccountsService.create).toHaveBeenCalledWith(dto);
    });

    it('should return 400 when bankName is missing', async () => {
      await request(app.getHttpServer())
        .post('/bank-accounts')
        .send({
          accountNumber: '123456',
          accountType: BankAccountType.PERSONAL_CHECKING,
        })
        .expect(400);

      expect(bankAccountsService.create).not.toHaveBeenCalled();
    });

    it('should return 400 when accountNumber is missing', async () => {
      await request(app.getHttpServer())
        .post('/bank-accounts')
        .send({
          bankName: 'בנק לאומי',
          accountType: BankAccountType.PERSONAL_CHECKING,
        })
        .expect(400);

      expect(bankAccountsService.create).not.toHaveBeenCalled();
    });

    it('should return 400 when accountType is invalid', async () => {
      await request(app.getHttpServer())
        .post('/bank-accounts')
        .send({
          bankName: 'בנק לאומי',
          accountNumber: '123456',
          accountType: 'INVALID_TYPE',
        })
        .expect(400);

      expect(bankAccountsService.create).not.toHaveBeenCalled();
    });

    it('should return 409 when duplicate bankName + accountNumber', async () => {
      mockBankAccountsService.create.mockRejectedValue(
        new ConflictException(
          'Bank account with bank "בנק לאומי" and account number "123456" already exists',
        ),
      );

      await request(app.getHttpServer())
        .post('/bank-accounts')
        .send({
          bankName: 'בנק לאומי',
          accountNumber: '123456',
          accountType: BankAccountType.PERSONAL_CHECKING,
        })
        .expect(409);
    });
  });

  describe('GET /bank-accounts', () => {
    it('should return paginated list', async () => {
      mockBankAccountsService.findAll.mockResolvedValue({
        data: [mockBankAccount],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });

      const response = await request(app.getHttpServer())
        .get('/bank-accounts')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      });
      expect(bankAccountsService.findAll).toHaveBeenCalled();
    });

    it('should pass query params to service', async () => {
      mockBankAccountsService.findAll.mockResolvedValue({
        data: [],
        meta: { page: 2, limit: 10, total: 0, totalPages: 0 },
      });

      await request(app.getHttpServer())
        .get('/bank-accounts')
        .query({ page: 2, limit: 10, bankName: 'לאומי', isActive: true })
        .expect(200);

      expect(bankAccountsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 10,
          bankName: 'לאומי',
          isActive: true,
        }),
      );
    });
  });

  describe('GET /bank-accounts/:id', () => {
    it('should return bank account when found', async () => {
      mockBankAccountsService.findOne.mockResolvedValue(mockBankAccount);

      const response = await request(app.getHttpServer())
        .get(`/bank-accounts/${mockBankAccount.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: mockBankAccount.id,
        bankName: mockBankAccount.bankName,
        accountNumber: mockBankAccount.accountNumber,
      });
      expect(bankAccountsService.findOne).toHaveBeenCalledWith(
        mockBankAccount.id,
      );
    });

    it('should return 404 when bank account not found', async () => {
      mockBankAccountsService.findOne.mockRejectedValue(
        new NotFoundException('Bank account with ID non-existent not found'),
      );

      await request(app.getHttpServer())
        .get('/bank-accounts/non-existent')
        .expect(404);

      expect(bankAccountsService.findOne).toHaveBeenCalledWith('non-existent');
    });
  });

  describe('PATCH /bank-accounts/:id', () => {
    it('should update bank account and return 200', async () => {
      const dto: UpdateBankAccountDto = { notes: 'Updated notes' };
      const updatedBankAccount = { ...mockBankAccount, notes: 'Updated notes' };
      mockBankAccountsService.update.mockResolvedValue(updatedBankAccount);

      const response = await request(app.getHttpServer())
        .patch(`/bank-accounts/${mockBankAccount.id}`)
        .send(dto)
        .expect(200);

      expect(response.body.notes).toBe('Updated notes');
      expect(bankAccountsService.update).toHaveBeenCalledWith(
        mockBankAccount.id,
        dto,
      );
    });

    it('should return 404 when bank account not found', async () => {
      mockBankAccountsService.update.mockRejectedValue(
        new NotFoundException('Bank account with ID non-existent not found'),
      );

      await request(app.getHttpServer())
        .patch('/bank-accounts/non-existent')
        .send({ bankName: 'Test' })
        .expect(404);
    });

    it('should return 409 when update creates duplicate', async () => {
      mockBankAccountsService.update.mockRejectedValue(
        new ConflictException(
          'Bank account with bank "בנק קיים" and account number "123" already exists',
        ),
      );

      await request(app.getHttpServer())
        .patch(`/bank-accounts/${mockBankAccount.id}`)
        .send({ bankName: 'בנק קיים', accountNumber: '123' })
        .expect(409);
    });
  });

  describe('DELETE /bank-accounts/:id', () => {
    it('should delete bank account and return 204', async () => {
      mockBankAccountsService.remove.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete(`/bank-accounts/${mockBankAccount.id}`)
        .expect(204);

      expect(bankAccountsService.remove).toHaveBeenCalledWith(
        mockBankAccount.id,
      );
    });

    it('should return 404 when bank account not found', async () => {
      mockBankAccountsService.remove.mockRejectedValue(
        new NotFoundException('Bank account with ID non-existent not found'),
      );

      await request(app.getHttpServer())
        .delete('/bank-accounts/non-existent')
        .expect(404);
    });

    it('should return 409 when bank account has linked mortgages', async () => {
      mockBankAccountsService.remove.mockRejectedValue(
        new ConflictException(
          'Cannot delete bank account: it is linked to 2 mortgage(s). Remove the mortgage links first.',
        ),
      );

      await request(app.getHttpServer())
        .delete(`/bank-accounts/${mockBankAccount.id}`)
        .expect(409);
    });
  });
});
