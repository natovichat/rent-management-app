import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { BankAccountResponseDto } from './dto/bank-account-response.dto';

@Injectable()
export class BankAccountsService {
  constructor(private prisma: PrismaService) {}

  async create(
    accountId: string,
    createDto: CreateBankAccountDto,
  ): Promise<BankAccountResponseDto> {
    // Check for duplicate account number in same bank for this account
    const existing = await this.prisma.bankAccount.findFirst({
      where: {
        accountId,
        bankName: createDto.bankName,
        accountNumber: createDto.accountNumber,
      },
    });

    if (existing) {
      throw new ConflictException(
        `חשבון בנק ${createDto.bankName} - ${createDto.accountNumber} כבר קיים`,
      );
    }

    const bankAccount = await this.prisma.bankAccount.create({
      data: {
        accountId,
        ...createDto,
      },
    });

    return bankAccount as BankAccountResponseDto;
  }

  async findAll(accountId: string): Promise<BankAccountResponseDto[]> {
    const bankAccounts = await this.prisma.bankAccount.findMany({
      where: { accountId },
      orderBy: [{ bankName: 'asc' }, { createdAt: 'desc' }],
    });

    return bankAccounts as BankAccountResponseDto[];
  }

  async findAllActive(accountId: string): Promise<BankAccountResponseDto[]> {
    const bankAccounts = await this.prisma.bankAccount.findMany({
      where: {
        accountId,
        isActive: true,
      },
      orderBy: [{ bankName: 'asc' }, { createdAt: 'desc' }],
    });

    return bankAccounts as BankAccountResponseDto[];
  }

  async findOne(
    id: string,
    accountId: string,
  ): Promise<BankAccountResponseDto> {
    const bankAccount = await this.prisma.bankAccount.findFirst({
      where: { id, accountId },
    });

    if (!bankAccount) {
      throw new NotFoundException(`חשבון בנק לא נמצא`);
    }

    return bankAccount as BankAccountResponseDto;
  }

  async update(
    id: string,
    accountId: string,
    updateDto: UpdateBankAccountDto,
  ): Promise<BankAccountResponseDto> {
    // Verify ownership
    await this.findOne(id, accountId);

    // If updating bank name or account number, check for duplicates
    if (updateDto.bankName || updateDto.accountNumber) {
      const current = await this.prisma.bankAccount.findUnique({
        where: { id },
      });

      if (!current) {
        throw new NotFoundException(`חשבון בנק לא נמצא`);
      }

      const existing = await this.prisma.bankAccount.findFirst({
        where: {
          accountId,
          bankName: updateDto.bankName || current.bankName,
          accountNumber: updateDto.accountNumber || current.accountNumber,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(
          `חשבון בנק ${updateDto.bankName || current.bankName} - ${updateDto.accountNumber || current.accountNumber} כבר קיים`,
        );
      }
    }

    const bankAccount = await this.prisma.bankAccount.update({
      where: { id },
      data: updateDto,
    });

    return bankAccount as BankAccountResponseDto;
  }

  async remove(id: string, accountId: string): Promise<void> {
    // Verify ownership
    await this.findOne(id, accountId);

    // Check if bank account is used by any mortgages
    const mortgageCount = await this.prisma.mortgage.count({
      where: {
        bankAccountId: id,
      },
    });

    if (mortgageCount > 0) {
      throw new ConflictException(
        `לא ניתן למחוק חשבון בנק המשויך ל-${mortgageCount} משכנתאות. נתק תחילה את המשכנתאות.`,
      );
    }

    await this.prisma.bankAccount.delete({
      where: { id },
    });
  }

  async deactivate(id: string, accountId: string): Promise<BankAccountResponseDto> {
    return this.update(id, accountId, { isActive: false });
  }

  async activate(id: string, accountId: string): Promise<BankAccountResponseDto> {
    return this.update(id, accountId, { isActive: true });
  }

  async getMortgagesUsingAccount(id: string, accountId: string) {
    // Verify ownership
    await this.findOne(id, accountId);

    return this.prisma.mortgage.findMany({
      where: {
        accountId,
        bankAccountId: id,
      },
      select: {
        id: true,
        bank: true,
        loanAmount: true,
        monthlyPayment: true,
        status: true,
        property: {
          select: {
            id: true,
            address: true,
          },
        },
      },
    });
  }
}
