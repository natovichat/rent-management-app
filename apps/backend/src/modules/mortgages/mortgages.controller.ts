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
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { MortgagesService } from './mortgages.service';
import { CreateMortgageDto } from './dto/create-mortgage.dto';
import { UpdateMortgageDto } from './dto/update-mortgage.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { MortgageStatus } from '@prisma/client';
// Hardcoded test account ID - fallback if header not provided
const HARDCODED_ACCOUNT_ID = 'test-account-1';

/**
 * Controller for mortgage management.
 * 
 * Reads account ID from X-Account-Id header (set by frontend API interceptor).
 */
@ApiTags('mortgages')
@Controller('mortgages')
export class MortgagesController {
  constructor(private readonly mortgagesService: MortgagesService) {}

  /**
   * Get account ID from request header or use fallback.
   */
  private getAccountId(req: any): string {
    const headerAccountId = req.headers['x-account-id'];
    return headerAccountId || HARDCODED_ACCOUNT_ID;
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get mortgage summary statistics' })
  @ApiResponse({ status: 200, description: 'Mortgage summary statistics' })
  getSummary(@Request() req: any) {
    return this.mortgagesService.getSummary(this.getAccountId(req));
  }

  @Get()
  @ApiOperation({ summary: 'Get all mortgages for account' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: MortgageStatus, description: 'Filter by mortgage status' })
  @ApiQuery({ name: 'bank', required: false, type: String })
  @ApiQuery({ name: 'propertyId', required: false, type: String })
  @ApiQuery({ name: 'minLoanAmount', required: false, type: Number })
  @ApiQuery({ name: 'maxLoanAmount', required: false, type: Number })
  @ApiQuery({ name: 'minInterestRate', required: false, type: Number })
  @ApiQuery({ name: 'maxInterestRate', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of mortgages' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: MortgageStatus,
    @Query('bank') bank?: string,
    @Query('propertyId') propertyId?: string,
    @Query('minLoanAmount') minLoanAmount?: string,
    @Query('maxLoanAmount') maxLoanAmount?: string,
    @Query('minInterestRate') minInterestRate?: string,
    @Query('maxInterestRate') maxInterestRate?: string,
    @Request() req?: any,
  ) {
    const minLoanAmountNum = minLoanAmount
      ? parseFloat(minLoanAmount)
      : undefined;
    const maxLoanAmountNum = maxLoanAmount
      ? parseFloat(maxLoanAmount)
      : undefined;
    const minInterestRateNum = minInterestRate
      ? parseFloat(minInterestRate)
      : undefined;
    const maxInterestRateNum = maxInterestRate
      ? parseFloat(maxInterestRate)
      : undefined;

    return this.mortgagesService.findAll(
      this.getAccountId(req),
      page,
      limit,
      search,
      status,
      bank,
      propertyId,
      minLoanAmountNum,
      maxLoanAmountNum,
      minInterestRateNum,
      maxInterestRateNum,
    );
  }

  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Get all mortgages for a property' })
  @ApiResponse({ status: 200, description: 'List of mortgages for property' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  findAllByProperty(@Param('propertyId') propertyId: string, @Request() req: any) {
    return this.mortgagesService.findAllByProperty(
      propertyId,
      this.getAccountId(req),
    );
  }

  // Specific routes MUST come before parameterized routes
  @Get(':id/balance')
  @ApiOperation({ summary: 'Get remaining balance for a mortgage' })
  @ApiResponse({
    status: 200,
    description: 'Remaining balance calculated',
  })
  @ApiResponse({ status: 404, description: 'Mortgage not found' })
  getRemainingBalance(@Param('id') id: string, @Request() req: any) {
    return this.mortgagesService.calculateRemainingBalance(
      id,
      this.getAccountId(req),
    );
  }

  @Post(':id/payments')
  @ApiOperation({ summary: 'Add a payment to a mortgage' })
  @ApiResponse({
    status: 201,
    description: 'Payment added successfully',
  })
  @ApiResponse({ status: 404, description: 'Mortgage not found' })
  addPayment(
    @Param('id') mortgageId: string,
    @Body() createPaymentDto: CreatePaymentDto,
    @Request() req: any,
  ) {
    return this.mortgagesService.addPayment(
      mortgageId,
      createPaymentDto,
      this.getAccountId(req),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a mortgage by ID with payments' })
  @ApiResponse({ status: 200, description: 'Mortgage details with payments' })
  @ApiResponse({ status: 404, description: 'Mortgage not found' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.mortgagesService.findOne(id, this.getAccountId(req));
  }

  @Post()
  @ApiOperation({ summary: 'Create a new mortgage' })
  @ApiResponse({ status: 201, description: 'Mortgage created successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  create(@Body() createMortgageDto: CreateMortgageDto, @Request() req: any) {
    return this.mortgagesService.create(
      createMortgageDto,
      this.getAccountId(req),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a mortgage' })
  @ApiResponse({ status: 200, description: 'Mortgage updated successfully' })
  @ApiResponse({ status: 404, description: 'Mortgage not found' })
  update(
    @Param('id') id: string,
    @Body() updateMortgageDto: UpdateMortgageDto,
    @Request() req: any,
  ) {
    return this.mortgagesService.update(
      id,
      updateMortgageDto,
      this.getAccountId(req),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a mortgage' })
  @ApiResponse({ status: 200, description: 'Mortgage deleted successfully' })
  @ApiResponse({ status: 404, description: 'Mortgage not found' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.mortgagesService.remove(id, this.getAccountId(req));
  }
}
