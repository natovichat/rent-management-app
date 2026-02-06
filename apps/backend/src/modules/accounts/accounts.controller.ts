import { Controller, Get, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { AccountResponseDto } from './dto/account-response.dto';
import { CreateAccountDto } from './dto/create-account.dto';

@ApiTags('accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({ summary: 'קבלת כל החשבונות' })
  @ApiResponse({
    status: 200,
    description: 'רשימת כל החשבונות',
    type: [AccountResponseDto],
  })
  findAll(): Promise<AccountResponseDto[]> {
    return this.accountsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'יצירת חשבון חדש' })
  @ApiBody({ type: CreateAccountDto })
  @ApiResponse({
    status: 201,
    description: 'החשבון נוצר בהצלחה',
    type: AccountResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'נתונים לא תקינים',
  })
  create(@Body() createAccountDto: CreateAccountDto): Promise<AccountResponseDto> {
    return this.accountsService.create(createAccountDto);
  }
}
