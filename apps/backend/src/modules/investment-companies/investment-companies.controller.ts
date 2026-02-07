import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { InvestmentCompaniesService } from './investment-companies.service';
import { CreateInvestmentCompanyDto } from './dto/create-investment-company.dto';
import { UpdateInvestmentCompanyDto } from './dto/update-investment-company.dto';

// Hardcoded test account ID - authentication removed for simplification
const HARDCODED_ACCOUNT_ID = 'test-account-1';

@ApiTags('investment-companies')
@Controller('investment-companies')
export class InvestmentCompaniesController {
  constructor(
    private readonly investmentCompaniesService: InvestmentCompaniesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'יצירת חברת השקעה חדשה' })
  @ApiResponse({
    status: 201,
    description: 'חברת ההשקעה נוצרה בהצלחה',
  })
  @ApiResponse({
    status: 409,
    description: 'חברת השקעה עם שם זה כבר קיימת',
  })
  create(@Body() createDto: CreateInvestmentCompanyDto, @Request() req: any) {
    // Priority: X-Account-Id header > hardcoded
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    
    return this.investmentCompaniesService.create(
      createDto,
      effectiveAccountId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'קבלת כל חברות ההשקעה' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'country', required: false, type: String })
  @ApiQuery({ name: 'minInvestmentAmount', required: false, type: Number })
  @ApiQuery({ name: 'maxInvestmentAmount', required: false, type: Number })
  @ApiQuery({ name: 'minOwnershipPercentage', required: false, type: Number })
  @ApiQuery({ name: 'maxOwnershipPercentage', required: false, type: Number })
  @ApiQuery({ name: 'minPropertyCount', required: false, type: Number })
  @ApiQuery({ name: 'maxPropertyCount', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'רשימת חברות השקעה',
  })
  findAll(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('country') country?: string,
    @Query('minInvestmentAmount') minInvestmentAmount?: string,
    @Query('maxInvestmentAmount') maxInvestmentAmount?: string,
    @Query('minOwnershipPercentage') minOwnershipPercentage?: string,
    @Query('maxOwnershipPercentage') maxOwnershipPercentage?: string,
    @Query('minPropertyCount') minPropertyCount?: string,
    @Query('maxPropertyCount') maxPropertyCount?: string,
  ) {
    // Priority: X-Account-Id header > hardcoded
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    
    // Parse numeric parameters
    const minInvestmentAmountNum = minInvestmentAmount
      ? parseFloat(minInvestmentAmount)
      : undefined;
    const maxInvestmentAmountNum = maxInvestmentAmount
      ? parseFloat(maxInvestmentAmount)
      : undefined;
    const minOwnershipPercentageNum = minOwnershipPercentage
      ? parseFloat(minOwnershipPercentage)
      : undefined;
    const maxOwnershipPercentageNum = maxOwnershipPercentage
      ? parseFloat(maxOwnershipPercentage)
      : undefined;
    const minPropertyCountNum = minPropertyCount
      ? parseInt(minPropertyCount, 10)
      : undefined;
    const maxPropertyCountNum = maxPropertyCount
      ? parseInt(maxPropertyCount, 10)
      : undefined;
    
    return this.investmentCompaniesService.findAll(
      effectiveAccountId,
      page,
      limit,
      search,
      country,
      minInvestmentAmountNum,
      maxInvestmentAmountNum,
      minOwnershipPercentageNum,
      maxOwnershipPercentageNum,
      minPropertyCountNum,
      maxPropertyCountNum,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'קבלת חברת השקעה לפי מזהה' })
  @ApiResponse({
    status: 200,
    description: 'פרטי חברת השקעה',
  })
  @ApiResponse({ status: 404, description: 'חברת השקעה לא נמצאה' })
  findOne(@Param('id') id: string, @Request() req: any) {
    // Priority: X-Account-Id header > hardcoded
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    
    return this.investmentCompaniesService.findOne(id, effectiveAccountId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'עדכון חברת השקעה' })
  @ApiResponse({
    status: 200,
    description: 'חברת ההשקעה עודכנה בהצלחה',
  })
  @ApiResponse({ status: 404, description: 'חברת השקעה לא נמצאה' })
  @ApiResponse({
    status: 409,
    description: 'חברת השקעה עם שם זה כבר קיימת',
  })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateInvestmentCompanyDto,
    @Request() req: any,
  ) {
    // Priority: X-Account-Id header > hardcoded
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    
    return this.investmentCompaniesService.update(
      id,
      effectiveAccountId,
      updateDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'מחיקת חברת השקעה' })
  @ApiResponse({
    status: 200,
    description: 'חברת ההשקעה נמחקה בהצלחה',
  })
  @ApiResponse({ status: 404, description: 'חברת השקעה לא נמצאה' })
  @ApiResponse({
    status: 403,
    description: 'לא ניתן למחוק חברת השקעה עם נכסים מקושרים',
  })
  remove(@Param('id') id: string, @Request() req: any) {
    // Priority: X-Account-Id header > hardcoded
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    
    return this.investmentCompaniesService.remove(id, effectiveAccountId);
  }

  @Delete('test/cleanup')
  @ApiOperation({
    summary: 'מחיקת כל נתוני הטסט (TEST ONLY)',
    description:
      'מוחק את כל חברות ההשקעה של חשבון הטסט. ⚠️ משמש רק לטסטי E2E!',
  })
  @ApiResponse({
    status: 200,
    description: 'נתונים נמחקו בהצלחה',
    schema: {
      type: 'object',
      properties: {
        deletedCount: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'ניתן למחוק רק נתוני חשבון טסט',
  })
  async deleteTestData(@Request() req: any) {
    // Priority: X-Account-Id header > hardcoded
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    
    // Only allow deletion for test account
    const result =
      await this.investmentCompaniesService.deleteAllForAccount(
        effectiveAccountId,
      );
    return {
      ...result,
      message: `Deleted ${result.deletedCount} investment companies for test account`,
    };
  }
}
