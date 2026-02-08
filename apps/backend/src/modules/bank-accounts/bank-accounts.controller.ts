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
  Request,
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
    @Request() req: any,
    @Body() createBankAccountDto: CreateBankAccountDto,
  ): Promise<BankAccountResponseDto> {
    const accountId = req.headers['x-account-id'] || HARDCODED_ACCOUNT_ID;
    return this.bankAccountsService.create(accountId, createBankAccountDto);
  }

  @Get()
  @ApiOperation({ summary: 'קבלת כל חשבונות הבנק' })
  @ApiResponse({
    status: 200,
    description: 'רשימת חשבונות הבנק',
    type: [BankAccountResponseDto],
  })
  findAll(
    @Request() req: any,
    @Query('activeOnly') activeOnly?: boolean,
  ): Promise<BankAccountResponseDto[]> {
    const accountId = req.headers['x-account-id'] || HARDCODED_ACCOUNT_ID;
    if (activeOnly === true || activeOnly === 'true' as any) {
      return this.bankAccountsService.findAllActive(accountId);
    }
    return this.bankAccountsService.findAll(accountId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'קבלת חשבון בנק לפי ID' })
  @ApiResponse({
    status: 200,
    description: 'פרטי חשבון הבנק',
    type: BankAccountResponseDto,
  })
  @ApiResponse({ status: 404, description: 'חשבון בנק לא נמצא' })
  findOne(@Request() req: any, @Param('id') id: string): Promise<BankAccountResponseDto> {
    const accountId = req.headers['x-account-id'] || HARDCODED_ACCOUNT_ID;
    return this.bankAccountsService.findOne(id, accountId);
  }

  @Get(':id/mortgages')
  @ApiOperation({ summary: 'קבלת משכנתאות המשויכות לחשבון בנק' })
  @ApiResponse({
    status: 200,
    description: 'רשימת משכנתאות',
  })
  getMortgages(@Request() req: any, @Param('id') id: string) {
    const accountId = req.headers['x-account-id'] || HARDCODED_ACCOUNT_ID;
    return this.bankAccountsService.getMortgagesUsingAccount(id, accountId);
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
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateBankAccountDto: UpdateBankAccountDto,
  ): Promise<BankAccountResponseDto> {
    const accountId = req.headers['x-account-id'] || HARDCODED_ACCOUNT_ID;
    return this.bankAccountsService.update(id, accountId, updateBankAccountDto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'השבתת חשבון בנק' })
  @ApiResponse({
    status: 200,
    description: 'חשבון הבנק הושבת בהצלחה',
    type: BankAccountResponseDto,
  })
  deactivate(@Request() req: any, @Param('id') id: string): Promise<BankAccountResponseDto> {
    const accountId = req.headers['x-account-id'] || HARDCODED_ACCOUNT_ID;
    return this.bankAccountsService.deactivate(id, accountId);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'הפעלת חשבון בנק' })
  @ApiResponse({
    status: 200,
    description: 'חשבון הבנק הופעל בהצלחה',
    type: BankAccountResponseDto,
  })
  activate(@Request() req: any, @Param('id') id: string): Promise<BankAccountResponseDto> {
    const accountId = req.headers['x-account-id'] || HARDCODED_ACCOUNT_ID;
    return this.bankAccountsService.activate(id, accountId);
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
  remove(@Request() req: any, @Param('id') id: string): Promise<void> {
    const accountId = req.headers['x-account-id'] || HARDCODED_ACCOUNT_ID;
    return this.bankAccountsService.remove(id, accountId);
  }
}
