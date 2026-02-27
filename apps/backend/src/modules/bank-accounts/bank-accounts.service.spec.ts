import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { BankAccountsService } from './bank-accounts.service';
import { PrismaService } from '../../database/prisma.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { QueryBankAccountDto } from './dto/query-bank-account.dto';
import { BankAccountType } from './dto/create-bank-account.dto';

const mockBankAccount = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  bankName: 'בנק לאומי',
  branchNumber: '689',
  accountNumber: '123456',
  accountType: BankAccountType.PERSONAL_CHECKING,
  accountHolder: 'יוסי כהן',
  notes: 'חשבון עיקרי',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('BankAccountsService', () => {
  let service: BankAccountsService;
  let prisma: PrismaService;

  const mockPrisma = {
    bankAccount: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    mortgage: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankAccountsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<BankAccountsService>(BankAccountsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a bank account', async () => {
      const dto: CreateBankAccountDto = {
        bankName: 'בנק לאומי',
        accountNumber: '123456',
        accountType: BankAccountType.PERSONAL_CHECKING,
      };

      mockPrisma.bankAccount.findFirst.mockResolvedValue(null);
      mockPrisma.bankAccount.create.mockResolvedValue(mockBankAccount);

      const result = await service.create(dto);

      expect(mockPrisma.bankAccount.findFirst).toHaveBeenCalledWith({
        where: { bankName: dto.bankName, accountNumber: dto.accountNumber },
      });
      expect(mockPrisma.bankAccount.create).toHaveBeenCalledWith({
        data: {
          bankName: dto.bankName,
          branchNumber: undefined,
          accountNumber: dto.accountNumber,
          accountType: dto.accountType,
          accountHolder: undefined,
          notes: undefined,
          isActive: true,
        },
      });
      expect(result).toEqual(mockBankAccount);
    });

    it('should create bank account with all optional fields', async () => {
      const dto: CreateBankAccountDto = {
        bankName: 'בנק הפועלים',
        branchNumber: '123',
        accountNumber: '789012',
        accountType: BankAccountType.PERSONAL_SAVINGS,
        accountHolder: 'דוד לוי',
        notes: 'חשבון חיסכון',
        isActive: false,
      };

      mockPrisma.bankAccount.findFirst.mockResolvedValue(null);
      mockPrisma.bankAccount.create.mockResolvedValue({
        ...mockBankAccount,
        ...dto,
      });

      const result = await service.create(dto);

      expect(mockPrisma.bankAccount.create).toHaveBeenCalledWith({
        data: {
          bankName: dto.bankName,
          branchNumber: dto.branchNumber,
          accountNumber: dto.accountNumber,
          accountType: dto.accountType,
          accountHolder: dto.accountHolder,
          notes: dto.notes,
          isActive: false,
        },
      });
      expect(result.isActive).toBe(false);
    });

    it('should throw ConflictException when bankName + accountNumber already exists', async () => {
      const dto: CreateBankAccountDto = {
        bankName: 'בנק לאומי',
        accountNumber: '123456',
        accountType: BankAccountType.PERSONAL_CHECKING,
      };

      mockPrisma.bankAccount.findFirst.mockResolvedValue(mockBankAccount);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      await expect(service.create(dto)).rejects.toThrow(/already exists/);
      expect(mockPrisma.bankAccount.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated bank accounts', async () => {
      mockPrisma.bankAccount.findMany.mockResolvedValue([mockBankAccount]);
      mockPrisma.bankAccount.count.mockResolvedValue(1);

      const query: QueryBankAccountDto = { page: 1, limit: 20 };
      const result = await service.findAll(query);

      expect(result).toEqual({
        data: [mockBankAccount],
        meta: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      });
      expect(mockPrisma.bankAccount.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
          orderBy: [{ bankName: 'asc' }, { createdAt: 'desc' }],
        }),
      );
    });

    it('should filter by bankName when provided', async () => {
      mockPrisma.bankAccount.findMany.mockResolvedValue([]);
      mockPrisma.bankAccount.count.mockResolvedValue(0);

      await service.findAll({ bankName: 'לאומי' });

      expect(mockPrisma.bankAccount.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            bankName: { contains: 'לאומי', mode: 'insensitive' },
          },
        }),
      );
    });

    it('should filter by accountType when provided', async () => {
      mockPrisma.bankAccount.findMany.mockResolvedValue([]);
      mockPrisma.bankAccount.count.mockResolvedValue(0);

      await service.findAll({ accountType: BankAccountType.BUSINESS });

      expect(mockPrisma.bankAccount.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { accountType: BankAccountType.BUSINESS },
        }),
      );
    });

    it('should filter by isActive when provided', async () => {
      mockPrisma.bankAccount.findMany.mockResolvedValue([]);
      mockPrisma.bankAccount.count.mockResolvedValue(0);

      await service.findAll({ isActive: true });

      expect(mockPrisma.bankAccount.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
        }),
      );
    });

    it('should calculate correct skip for pagination', async () => {
      mockPrisma.bankAccount.findMany.mockResolvedValue([]);
      mockPrisma.bankAccount.count.mockResolvedValue(50);

      await service.findAll({ page: 3, limit: 10 });

      expect(mockPrisma.bankAccount.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return bank account when found', async () => {
      mockPrisma.bankAccount.findUnique.mockResolvedValue(mockBankAccount);

      const result = await service.findOne(mockBankAccount.id);

      expect(result).toEqual(mockBankAccount);
      expect(mockPrisma.bankAccount.findUnique).toHaveBeenCalledWith({
        where: { id: mockBankAccount.id },
      });
    });

    it('should throw NotFoundException when bank account not found', async () => {
      mockPrisma.bankAccount.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        'Bank account with ID non-existent-id not found',
      );
    });
  });

  describe('update', () => {
    it('should update bank account', async () => {
      const updateDto: UpdateBankAccountDto = {
        bankName: 'בנק מזרחי',
        notes: 'עודכן',
      };
      const updated = { ...mockBankAccount, ...updateDto };

      mockPrisma.bankAccount.findUnique.mockResolvedValue(mockBankAccount);
      mockPrisma.bankAccount.findFirst.mockResolvedValue(null); // No duplicate
      mockPrisma.bankAccount.update.mockResolvedValue(updated);

      const result = await service.update(mockBankAccount.id, updateDto);

      expect(mockPrisma.bankAccount.update).toHaveBeenCalledWith({
        where: { id: mockBankAccount.id },
        data: expect.objectContaining({
          bankName: updateDto.bankName,
          notes: updateDto.notes,
        }),
      });
      expect(result).toEqual(updated);
    });

    it('should check uniqueness when bankName or accountNumber changed', async () => {
      const updateDto: UpdateBankAccountDto = {
        bankName: 'בנק חדש',
        accountNumber: '999999',
      };

      mockPrisma.bankAccount.findUnique.mockResolvedValue(mockBankAccount);
      mockPrisma.bankAccount.findFirst.mockResolvedValue(null);
      mockPrisma.bankAccount.update.mockResolvedValue({
        ...mockBankAccount,
        ...updateDto,
      });

      await service.update(mockBankAccount.id, updateDto);

      expect(mockPrisma.bankAccount.findFirst).toHaveBeenCalledWith({
        where: {
          bankName: 'בנק חדש',
          accountNumber: '999999',
          id: { not: mockBankAccount.id },
        },
      });
    });

    it('should throw ConflictException when update creates duplicate', async () => {
      const updateDto: UpdateBankAccountDto = {
        bankName: 'בנק קיים',
        accountNumber: 'קיים',
      };
      const existingOther = {
        ...mockBankAccount,
        id: 'other-id',
        bankName: 'בנק קיים',
        accountNumber: 'קיים',
      };

      mockPrisma.bankAccount.findUnique.mockResolvedValue(mockBankAccount);
      mockPrisma.bankAccount.findFirst.mockResolvedValue(existingOther);

      await expect(
        service.update(mockBankAccount.id, updateDto),
      ).rejects.toThrow(ConflictException);
      expect(mockPrisma.bankAccount.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when updating non-existent bank account', async () => {
      mockPrisma.bankAccount.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { bankName: 'Test' }),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrisma.bankAccount.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete bank account when no mortgages linked', async () => {
      mockPrisma.bankAccount.findUnique.mockResolvedValue(mockBankAccount);
      mockPrisma.mortgage.count.mockResolvedValue(0);
      mockPrisma.bankAccount.delete.mockResolvedValue(mockBankAccount);

      const result = await service.remove(mockBankAccount.id);

      expect(mockPrisma.mortgage.count).toHaveBeenCalledWith({
        where: { bankAccountId: mockBankAccount.id },
      });
      expect(mockPrisma.bankAccount.delete).toHaveBeenCalledWith({
        where: { id: mockBankAccount.id },
      });
      expect(result).toEqual(mockBankAccount);
    });

    it('should throw ConflictException when bank account has mortgages', async () => {
      mockPrisma.bankAccount.findUnique.mockResolvedValue(mockBankAccount);
      mockPrisma.mortgage.count.mockResolvedValue(2);

      await expect(service.remove(mockBankAccount.id)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.remove(mockBankAccount.id)).rejects.toThrow(
        /linked to 2 mortgage/,
      );
      expect(mockPrisma.bankAccount.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when bank account not found', async () => {
      mockPrisma.bankAccount.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.mortgage.count).not.toHaveBeenCalled();
      expect(mockPrisma.bankAccount.delete).not.toHaveBeenCalled();
    });
  });
});
