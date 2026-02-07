import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
// Hardcoded test account ID - authentication removed for simplification
const HARDCODED_ACCOUNT_ID = 'test-account-1';

/**
 * Controller for tenant management.
 * 
 * Authentication removed - using hardcoded test account.
 */
@ApiTags('tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tenant' })
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(HARDCODED_ACCOUNT_ID, createTenantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tenants' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name, email, or phone' })
  findAll(@Query('search') search?: string) {
    return this.tenantsService.findAll(HARDCODED_ACCOUNT_ID, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tenant by ID' })
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(HARDCODED_ACCOUNT_ID, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tenant' })
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantsService.update(HARDCODED_ACCOUNT_ID, id, updateTenantDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tenant' })
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(HARDCODED_ACCOUNT_ID, id);
  }
}
