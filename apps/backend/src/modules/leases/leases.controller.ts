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
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { LeasesService } from './leases.service';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { UpdateLeaseDto } from './dto/update-lease.dto';
// Hardcoded test account ID - authentication removed for simplification
const HARDCODED_ACCOUNT_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Controller for lease management.
 * 
 * Authentication removed - using hardcoded test account.
 */
@ApiTags('leases')
@Controller('leases')
export class LeasesController {
  constructor(private readonly leasesService: LeasesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new lease' })
  create(@Body() createLeaseDto: CreateLeaseDto) {
    return this.leasesService.create(HARDCODED_ACCOUNT_ID, createLeaseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all leases' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'startDateFrom', required: false, type: String })
  @ApiQuery({ name: 'startDateTo', required: false, type: String })
  @ApiQuery({ name: 'endDateFrom', required: false, type: String })
  @ApiQuery({ name: 'endDateTo', required: false, type: String })
  @ApiQuery({ name: 'minMonthlyRent', required: false, type: Number })
  @ApiQuery({ name: 'maxMonthlyRent', required: false, type: Number })
  @ApiQuery({ name: 'propertyId', required: false, type: String })
  @ApiQuery({ name: 'tenantId', required: false, type: String })
  findAll(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('startDateFrom') startDateFrom?: string,
    @Query('startDateTo') startDateTo?: string,
    @Query('endDateFrom') endDateFrom?: string,
    @Query('endDateTo') endDateTo?: string,
    @Query('minMonthlyRent') minMonthlyRent?: string,
    @Query('maxMonthlyRent') maxMonthlyRent?: string,
    @Query('propertyId') propertyId?: string,
    @Query('tenantId') tenantId?: string,
  ) {
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;

    const minMonthlyRentNum = minMonthlyRent
      ? parseFloat(minMonthlyRent)
      : undefined;
    const maxMonthlyRentNum = maxMonthlyRent
      ? parseFloat(maxMonthlyRent)
      : undefined;

    return this.leasesService.findAll(
      effectiveAccountId,
      page,
      limit,
      search,
      startDateFrom,
      startDateTo,
      endDateFrom,
      endDateTo,
      minMonthlyRentNum,
      maxMonthlyRentNum,
      propertyId,
      tenantId,
    );
  }

  @Get('expiration-timeline')
  @ApiOperation({ summary: 'Get lease expiration timeline' })
  @ApiQuery({ name: 'months', required: false, type: Number, description: 'Number of months ahead to look (default: 12)' })
  @ApiResponse({
    status: 200,
    description: 'List of leases expiring within specified months',
  })
  getExpirationTimeline(
    @Query('months') months?: string,
    @Request() req?: any,
  ) {
    const accountId = req?.headers['x-account-id'] || HARDCODED_ACCOUNT_ID;
    const monthsAhead = months ? parseInt(months, 10) : 12;
    return this.leasesService.getExpirationTimeline(accountId, monthsAhead);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a lease by ID' })
  findOne(@Param('id') id: string) {
    return this.leasesService.findOne(HARDCODED_ACCOUNT_ID, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a lease' })
  update(@Param('id') id: string, @Body() updateLeaseDto: UpdateLeaseDto) {
    return this.leasesService.update(HARDCODED_ACCOUNT_ID, id, updateLeaseDto);
  }

  @Post(':id/terminate')
  @ApiOperation({ summary: 'Terminate a lease early' })
  terminate(@Param('id') id: string) {
    return this.leasesService.terminate(HARDCODED_ACCOUNT_ID, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a lease' })
  remove(@Param('id') id: string) {
    return this.leasesService.remove(HARDCODED_ACCOUNT_ID, id);
  }

  @Delete('test/cleanup')
  @ApiOperation({ 
    summary: 'מחיקת כל נתוני הטסט (TEST ONLY)',
    description: 'מוחק את כל החוזים של חשבון הטסט. ⚠️ משמש רק לטסטי E2E!'
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
  async deleteTestData() {
    const result = await this.leasesService.deleteAllForAccount(HARDCODED_ACCOUNT_ID);
    return {
      ...result,
      message: `Deleted ${result.deletedCount} leases for test account`,
    };
  }
}
