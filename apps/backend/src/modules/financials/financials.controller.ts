import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { FinancialsService } from './financials.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
// Hardcoded test account ID - authentication removed for simplification
const HARDCODED_ACCOUNT_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Controller for financial management (expenses and income).
 * 
 * Authentication removed - using hardcoded test account.
 */
@ApiTags('financials')
@Controller('financials')
export class FinancialsController {
  constructor(private readonly financialsService: FinancialsService) {}

  // ============================================
  // EXPENSE ENDPOINTS
  // ============================================

  @Get('expenses')
  @ApiOperation({ summary: 'Get all expenses' })
  @ApiQuery({ name: 'propertyId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'List of expenses',
  })
  findAllExpenses(
    @Request() req: any,
    @Query('propertyId') propertyId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const accountId = req.headers['x-account-id'] || HARDCODED_ACCOUNT_ID;
    return this.financialsService.findAllExpenses(accountId, {
      propertyId,
      startDate,
      endDate,
    });
  }

  @Post('expenses')
  @ApiOperation({ summary: 'Create a new expense' })
  @ApiResponse({
    status: 201,
    description: 'Expense created successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Property not found',
  })
  createExpense(@Request() req: any, @Body() createExpenseDto: CreateExpenseDto) {
    const accountId = req.headers['x-account-id'] || HARDCODED_ACCOUNT_ID;
    return this.financialsService.createExpense(createExpenseDto, accountId);
  }

  @Patch('expenses/:id')
  @ApiOperation({ summary: 'Update an expense' })
  @ApiResponse({
    status: 200,
    description: 'Expense updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Expense not found',
  })
  updateExpense(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    const accountId = req.headers['x-account-id'] || HARDCODED_ACCOUNT_ID;
    return this.financialsService.updateExpense(id, updateExpenseDto, accountId);
  }

  @Delete('expenses/:id')
  @ApiOperation({ summary: 'Delete an expense' })
  @ApiResponse({
    status: 200,
    description: 'Expense deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Expense not found',
  })
  removeExpense(@Request() req: any, @Param('id') id: string) {
    const accountId = req.headers['x-account-id'] || HARDCODED_ACCOUNT_ID;
    return this.financialsService.removeExpense(id, accountId);
  }

  // ============================================
  // INCOME ENDPOINTS
  // ============================================

  @Get('income')
  @ApiOperation({ summary: 'Get all income' })
  @ApiQuery({ name: 'propertyId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'List of income entries',
  })
  findAllIncome(
    @Request() req: any,
    @Query('propertyId') propertyId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const accountId = req.headers['x-account-id'] || HARDCODED_ACCOUNT_ID;
    return this.financialsService.findAllIncome(accountId, {
      propertyId,
      startDate,
      endDate,
    });
  }

  @Post('income')
  @ApiOperation({ summary: 'Create a new income entry' })
  @ApiResponse({
    status: 201,
    description: 'Income created successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Property not found',
  })
  createIncome(@Request() req: any, @Body() createIncomeDto: CreateIncomeDto) {
    const accountId = req.headers['x-account-id'] || HARDCODED_ACCOUNT_ID;
    return this.financialsService.createIncome(createIncomeDto, accountId);
  }

  @Patch('income/:id')
  @ApiOperation({ summary: 'Update an income entry' })
  @ApiResponse({
    status: 200,
    description: 'Income updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Income not found',
  })
  updateIncome(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateIncomeDto: UpdateIncomeDto,
  ) {
    const accountId = req.headers['x-account-id'] || HARDCODED_ACCOUNT_ID;
    return this.financialsService.updateIncome(id, updateIncomeDto, accountId);
  }

  @Delete('income/:id')
  @ApiOperation({ summary: 'Delete an income entry' })
  @ApiResponse({
    status: 200,
    description: 'Income deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Income not found',
  })
  removeIncome(@Request() req: any, @Param('id') id: string) {
    const accountId = req.headers['x-account-id'] || HARDCODED_ACCOUNT_ID;
    return this.financialsService.removeIncome(id, accountId);
  }

  // ============================================
  // SUMMARY ENDPOINTS
  // ============================================

  // Specific routes MUST come before parameterized routes
  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Get financials for a specific property' })
  @ApiResponse({
    status: 200,
    description: 'Property financials including expenses, income, and summary',
  })
  @ApiResponse({
    status: 404,
    description: 'Property not found',
  })
  getPropertyFinancials(@Request() req: any, @Param('propertyId') propertyId: string) {
    const accountId = req.headers['x-account-id'] || HARDCODED_ACCOUNT_ID;
    return this.financialsService.getPropertyFinancials(propertyId, accountId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get financial summary' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Financial summary with total income, expenses, and net',
  })
  getFinancialSummary(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const accountId = req.headers['x-account-id'] || HARDCODED_ACCOUNT_ID;
    return this.financialsService.getFinancialSummary(
      accountId,
      startDate,
      endDate,
    );
  }

  // ============================================
  // BREAKDOWN ENDPOINTS
  // ============================================

  @Get('expenses/breakdown')
  @ApiOperation({ summary: 'Get expense breakdown by category' })
  @ApiQuery({ name: 'propertyId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Expense breakdown grouped by type',
  })
  getExpenseBreakdown(
    @Request() req: any,
    @Query('propertyId') propertyId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const accountId = req.headers['x-account-id'] || HARDCODED_ACCOUNT_ID;
    return this.financialsService.getExpenseBreakdown(
      accountId,
      {
        propertyId,
        startDate,
        endDate,
      },
    );
  }

  @Get('income/breakdown')
  @ApiOperation({ summary: 'Get income breakdown by type' })
  @ApiQuery({ name: 'propertyId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Income breakdown grouped by type',
  })
  getIncomeBreakdown(
    @Request() req: any,
    @Query('propertyId') propertyId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const accountId = req.headers['x-account-id'] || HARDCODED_ACCOUNT_ID;
    return this.financialsService.getIncomeBreakdown(
      accountId,
      {
        propertyId,
        startDate,
        endDate,
      },
    );
  }

  // ============================================
  // DASHBOARD ENDPOINTS
  // ============================================

  @Get('property/:propertyId/dashboard')
  @ApiOperation({ summary: 'Get financial dashboard for a property' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Complete financial dashboard data',
  })
  getPropertyDashboard(
    @Request() req: any,
    @Param('propertyId') propertyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const accountId = req.headers['x-account-id'] || HARDCODED_ACCOUNT_ID;
    return this.financialsService.getPropertyDashboard(
      propertyId,
      accountId,
      startDate,
      endDate,
    );
  }

  @Get('dashboard/income-expenses')
  @ApiOperation({ summary: 'Get income vs expenses data for dashboard' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'groupBy', required: false, enum: ['month', 'quarter', 'year'], description: 'Group by period' })
  @ApiResponse({
    status: 200,
    description: 'Income vs expenses data grouped by period',
  })
  getIncomeExpensesDashboard(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('groupBy') groupBy: 'month' | 'quarter' | 'year' = 'month',
  ) {
    const accountId = req.headers['x-account-id'] || HARDCODED_ACCOUNT_ID;
    return this.financialsService.getIncomeExpensesDashboard(
      accountId,
      startDate,
      endDate,
      groupBy,
    );
  }
}
