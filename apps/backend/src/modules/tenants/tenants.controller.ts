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
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
// Hardcoded test account ID - fallback for development/testing
const HARDCODED_ACCOUNT_ID = 'test-account-1';

/**
 * Controller for tenant management.
 * 
 * Reads accountId from X-Account-Id header (sent by frontend).
 * Falls back to hardcoded account ID for development/testing.
 */
@ApiTags('tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tenant' })
  create(@Request() req: any, @Body() createTenantDto: CreateTenantDto) {
    const accountId = req.headers['x-account-id'] || HARDCODED_ACCOUNT_ID;
    return this.tenantsService.create(accountId, createTenantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tenants' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name, email, or phone' })
  findAll(@Request() req: any, @Query('search') search?: string) {
    const accountId = req.headers['x-account-id'] || HARDCODED_ACCOUNT_ID;
    return this.tenantsService.findAll(accountId, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tenant by ID' })
  findOne(@Request() req: any, @Param('id') id: string) {
    const accountId = req.headers['x-account-id'] || HARDCODED_ACCOUNT_ID;
    return this.tenantsService.findOne(accountId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tenant' })
  update(@Request() req: any, @Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    const accountId = req.headers['x-account-id'] || HARDCODED_ACCOUNT_ID;
    return this.tenantsService.update(accountId, id, updateTenantDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tenant' })
  remove(@Request() req: any, @Param('id') id: string) {
    const accountId = req.headers['x-account-id'] || HARDCODED_ACCOUNT_ID;
    return this.tenantsService.remove(accountId, id);
  }
}
