import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { BankAccountsService } from './bank-accounts.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { QueryBankAccountDto } from './dto/query-bank-account.dto';
import { BankAccountEntity } from './entities/bank-account.entity';
import { BankAccountType } from './dto/create-bank-account.dto';

@ApiTags('bank-accounts')
@Controller('bank-accounts')
export class BankAccountsController {
  constructor(private readonly bankAccountsService: BankAccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new bank account' })
  @ApiResponse({
    status: 201,
    description: 'Bank account created successfully',
    type: BankAccountEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - invalid input',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - bank account with same bankName and accountNumber already exists',
  })
  create(@Body() createBankAccountDto: CreateBankAccountDto) {
    return this.bankAccountsService.create(createBankAccountDto);
  }

  @Get()
  @ApiOperation({ summary: 'List bank accounts with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (1-based)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'bankName', required: false, type: String, description: 'Filter by bank name (partial match)' })
  @ApiQuery({ name: 'accountType', required: false, enum: BankAccountType, description: 'Filter by account type' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of bank accounts',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/BankAccountEntity' } },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 20 },
            total: { type: 'number', example: 50 },
            totalPages: { type: 'number', example: 3 },
          },
        },
      },
    },
  })
  findAll(@Query() query: QueryBankAccountDto) {
    return this.bankAccountsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bank account by ID' })
  @ApiParam({ name: 'id', description: 'Bank account UUID' })
  @ApiResponse({
    status: 200,
    description: 'Bank account found',
    type: BankAccountEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Bank account not found',
  })
  findOne(@Param('id') id: string) {
    return this.bankAccountsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update bank account' })
  @ApiParam({ name: 'id', description: 'Bank account UUID' })
  @ApiResponse({
    status: 200,
    description: 'Bank account updated successfully',
    type: BankAccountEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'Bank account not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - duplicate bankName and accountNumber',
  })
  update(
    @Param('id') id: string,
    @Body() updateBankAccountDto: UpdateBankAccountDto,
  ) {
    return this.bankAccountsService.update(id, updateBankAccountDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete bank account' })
  @ApiParam({ name: 'id', description: 'Bank account UUID' })
  @ApiResponse({ status: 204, description: 'Bank account soft-deleted successfully' })
  @ApiResponse({ status: 404, description: 'Bank account not found' })
  @ApiResponse({ status: 409, description: 'Conflict - bank account has linked active mortgages' })
  async remove(@Param('id') id: string) {
    await this.bankAccountsService.remove(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted bank account (admin only)' })
  @ApiParam({ name: 'id', description: 'Bank account UUID' })
  @ApiResponse({ status: 200, description: 'Bank account restored successfully' })
  @ApiResponse({ status: 404, description: 'Deleted bank account not found' })
  restore(@Param('id') id: string) {
    return this.bankAccountsService.restore(id);
  }
}
