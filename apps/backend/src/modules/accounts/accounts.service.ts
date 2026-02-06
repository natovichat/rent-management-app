import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AccountResponseDto } from './dto/account-response.dto';
import { CreateAccountDto } from './dto/create-account.dto';
import { AccountStatus } from '@prisma/client';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all accounts
   * Used by account selector to display all available accounts
   */
  async findAll(): Promise<AccountResponseDto[]> {
    const accounts = await this.prisma.account.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return accounts;
  }

  /**
   * Create a new account
   * Used for testing and account management
   */
  async create(createAccountDto: CreateAccountDto): Promise<AccountResponseDto> {
    const account = await this.prisma.account.create({
      data: {
        ...(createAccountDto.id && { id: createAccountDto.id }),
        name: createAccountDto.name,
        status: createAccountDto.status || AccountStatus.ACTIVE,
      },
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return account;
  }
}
