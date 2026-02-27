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
import { OwnersService } from './owners.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { QueryOwnerDto } from './dto/query-owner.dto';
import { OwnerEntity } from './entities/owner.entity';

@ApiTags('owners')
@Controller('owners')
export class OwnersController {
  constructor(private readonly ownersService: OwnersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new owner' })
  @ApiResponse({
    status: 201,
    description: 'Owner created successfully',
    type: OwnerEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - invalid input',
  })
  create(@Body() createOwnerDto: CreateOwnerDto) {
    return this.ownersService.create(createOwnerDto);
  }

  @Get()
  @ApiOperation({ summary: 'List owners with pagination, search and filter' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name, email, phone' })
  @ApiQuery({ name: 'type', required: false, enum: ['INDIVIDUAL', 'COMPANY', 'PARTNERSHIP'], description: 'Filter by type' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of owners',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/OwnerEntity' } },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 25 },
            totalPages: { type: 'number', example: 3 },
          },
        },
      },
    },
  })
  findAll(@Query() query: QueryOwnerDto) {
    return this.ownersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get owner by ID' })
  @ApiParam({ name: 'id', description: 'Owner UUID' })
  @ApiResponse({
    status: 200,
    description: 'Owner found',
    type: OwnerEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Owner not found',
  })
  findOne(@Param('id') id: string) {
    return this.ownersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update owner' })
  @ApiParam({ name: 'id', description: 'Owner UUID' })
  @ApiResponse({
    status: 200,
    description: 'Owner updated successfully',
    type: OwnerEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'Owner not found',
  })
  update(@Param('id') id: string, @Body() updateOwnerDto: UpdateOwnerDto) {
    return this.ownersService.update(id, updateOwnerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete owner' })
  @ApiParam({ name: 'id', description: 'Owner UUID' })
  @ApiResponse({
    status: 204,
    description: 'Owner deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Owner not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - owner has ownerships, cannot delete',
  })
  async remove(@Param('id') id: string) {
    await this.ownersService.remove(id);
  }
}
