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
import { MortgagesService } from './mortgages.service';
import { CreateMortgageDto } from './dto/create-mortgage.dto';
import { UpdateMortgageDto } from './dto/update-mortgage.dto';
import { QueryMortgageDto } from './dto/query-mortgage.dto';
import { MortgageEntity } from './entities/mortgage.entity';
import { MortgageStatus } from '../../firebase/types';

@ApiTags('mortgages')
@Controller('mortgages')
export class MortgagesController {
  constructor(private readonly mortgagesService: MortgagesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new mortgage' })
  @ApiResponse({
    status: 201,
    description: 'Mortgage created successfully',
    type: MortgageEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or related entity not found',
  })
  create(@Body() createMortgageDto: CreateMortgageDto) {
    return this.mortgagesService.create(createMortgageDto);
  }

  @Get()
  @ApiOperation({ summary: 'List mortgages with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (1-based)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'status', required: false, enum: MortgageStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'propertyId', required: false, type: String, description: 'Filter by property ID' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of mortgages',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/MortgageEntity' } },
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
  findAll(@Query() query: QueryMortgageDto) {
    return this.mortgagesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get mortgage by ID with relations' })
  @ApiParam({ name: 'id', description: 'Mortgage UUID' })
  @ApiResponse({
    status: 200,
    description: 'Mortgage found with property, bankAccount, mortgageOwner, payer',
    type: MortgageEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Mortgage not found',
  })
  findOne(@Param('id') id: string) {
    return this.mortgagesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update mortgage' })
  @ApiParam({ name: 'id', description: 'Mortgage UUID' })
  @ApiResponse({
    status: 200,
    description: 'Mortgage updated successfully',
    type: MortgageEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or related entity not found',
  })
  @ApiResponse({
    status: 404,
    description: 'Mortgage not found',
  })
  update(
    @Param('id') id: string,
    @Body() updateMortgageDto: UpdateMortgageDto,
  ) {
    return this.mortgagesService.update(id, updateMortgageDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete mortgage' })
  @ApiParam({ name: 'id', description: 'Mortgage UUID' })
  @ApiResponse({ status: 204, description: 'Mortgage soft-deleted successfully' })
  @ApiResponse({ status: 404, description: 'Mortgage not found' })
  async remove(@Param('id') id: string) {
    await this.mortgagesService.remove(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted mortgage (admin only)' })
  @ApiParam({ name: 'id', description: 'Mortgage UUID' })
  @ApiResponse({ status: 200, description: 'Mortgage restored successfully' })
  @ApiResponse({ status: 404, description: 'Deleted mortgage not found' })
  restore(@Param('id') id: string) {
    return this.mortgagesService.restore(id);
  }
}
