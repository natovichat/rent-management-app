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
    @Query('propertyId') propertyId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financialsService.findAllExpenses(HARDCODED_ACCOUNT_ID, {
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
  createExpense(@Body() createExpenseDto: CreateExpenseDto) {
    return this.financialsService.createExpense(createExpenseDto, HARDCODED_ACCOUNT_ID);
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
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.financialsService.updateExpense(id, updateExpenseDto, HARDCODED_ACCOUNT_ID);
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
  removeExpense(@Param('id') id: string) {
    return this.financialsService.removeExpense(id, HARDCODED_ACCOUNT_ID);
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
    @Query('propertyId') propertyId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financialsService.findAllIncome(HARDCODED_ACCOUNT_ID, {
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
  createIncome(@Body() createIncomeDto: CreateIncomeDto) {
    return this.financialsService.createIncome(createIncomeDto, HARDCODED_ACCOUNT_ID);
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
    @Param('id') id: string,
    @Body() updateIncomeDto: UpdateIncomeDto,
  ) {
    return this.financialsService.updateIncome(id, updateIncomeDto, HARDCODED_ACCOUNT_ID);
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
  removeIncome(@Param('id') id: string) {
    return this.financialsService.removeIncome(id, HARDCODED_ACCOUNT_ID);
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
  getPropertyFinancials(@Param('propertyId') propertyId: string) {
    return this.financialsService.getPropertyFinancials(propertyId, HARDCODED_ACCOUNT_ID);
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
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financialsService.getFinancialSummary(
      HARDCODED_ACCOUNT_ID,
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
    @Query('propertyId') propertyId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financialsService.getExpenseBreakdown(
      HARDCODED_ACCOUNT_ID,
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
    @Query('propertyId') propertyId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financialsService.getIncomeBreakdown(
      HARDCODED_ACCOUNT_ID,
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
    @Param('propertyId') propertyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financialsService.getPropertyDashboard(
      propertyId,
      HARDCODED_ACCOUNT_ID,
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
