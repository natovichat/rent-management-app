import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { BankAccountsService } from './bank-accounts.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { BankAccountResponseDto } from './dto/bank-account-response.dto';
// Hardcoded test account ID - authentication removed for simplification
const HARDCODED_ACCOUNT_ID = 'test-account-1';

@ApiTags('bank-accounts')
@Controller('bank-accounts')
export class BankAccountsController {
  constructor(private readonly bankAccountsService: BankAccountsService) {}

  @Post()
  @ApiOperation({ summary: 'יצירת חשבון בנק חדש' })
  @ApiResponse({
    status: 201,
    description: 'חשבון הבנק נוצר בהצלחה',
    type: BankAccountResponseDto,
  })
  @ApiResponse({ status: 409, description: 'חשבון בנק כבר קיים' })
  create(
    @Body() createBankAccountDto: CreateBankAccountDto,
  ): Promise<BankAccountResponseDto> {
    return this.bankAccountsService.create(HARDCODED_ACCOUNT_ID, createBankAccountDto);
  }

  @Get()
  @ApiOperation({ summary: 'קבלת כל חשבונות הבנק' })
  @ApiResponse({
    status: 200,
    description: 'רשימת חשבונות הבנק',
    type: [BankAccountResponseDto],
  })
  findAll(
    @Query('activeOnly') activeOnly?: boolean,
  ): Promise<BankAccountResponseDto[]> {
    if (activeOnly === true || activeOnly === 'true' as any) {
      return this.bankAccountsService.findAllActive(HARDCODED_ACCOUNT_ID);
    }
    return this.bankAccountsService.findAll(HARDCODED_ACCOUNT_ID);
  }

  @Get(':id')
  @ApiOperation({ summary: 'קבלת חשבון בנק לפי ID' })
  @ApiResponse({
    status: 200,
    description: 'פרטי חשבון הבנק',
    type: BankAccountResponseDto,
  })
  @ApiResponse({ status: 404, description: 'חשבון בנק לא נמצא' })
  findOne(@Param('id') id: string): Promise<BankAccountResponseDto> {
    return this.bankAccountsService.findOne(id, HARDCODED_ACCOUNT_ID);
  }

  @Get(':id/mortgages')
  @ApiOperation({ summary: 'קבלת משכנתאות המשויכות לחשבון בנק' })
  @ApiResponse({
    status: 200,
    description: 'רשימת משכנתאות',
  })
  getMortgages(@Param('id') id: string) {
    return this.bankAccountsService.getMortgagesUsingAccount(id, HARDCODED_ACCOUNT_ID);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'עדכון חשבון בנק' })
  @ApiResponse({
    status: 200,
    description: 'חשבון הבנק עודכן בהצלחה',
    type: BankAccountResponseDto,
  })
  @ApiResponse({ status: 404, description: 'חשבון בנק לא נמצא' })
  @ApiResponse({ status: 409, description: 'חשבון בנק כבר קיים' })
  update(
    @Param('id') id: string,
    @Body() updateBankAccountDto: UpdateBankAccountDto,
  ): Promise<BankAccountResponseDto> {
    return this.bankAccountsService.update(id, HARDCODED_ACCOUNT_ID, updateBankAccountDto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'השבתת חשבון בנק' })
  @ApiResponse({
    status: 200,
    description: 'חשבון הבנק הושבת בהצלחה',
    type: BankAccountResponseDto,
  })
  deactivate(@Param('id') id: string): Promise<BankAccountResponseDto> {
    return this.bankAccountsService.deactivate(id, HARDCODED_ACCOUNT_ID);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'הפעלת חשבון בנק' })
  @ApiResponse({
    status: 200,
    description: 'חשבון הבנק הופעל בהצלחה',
    type: BankAccountResponseDto,
  })
  activate(@Param('id') id: string): Promise<BankAccountResponseDto> {
    return this.bankAccountsService.activate(id, HARDCODED_ACCOUNT_ID);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'מחיקת חשבון בנק' })
  @ApiResponse({ status: 200, description: 'חשבון הבנק נמחק בהצלחה' })
  @ApiResponse({ status: 404, description: 'חשבון בנק לא נמצא' })
  @ApiResponse({
    status: 409,
    description: 'לא ניתן למחוק חשבון בנק המשויך למשכנתאות',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.bankAccountsService.remove(id, HARDCODED_ACCOUNT_ID);
  }
}
