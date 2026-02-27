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
import { PropertiesService } from './properties.service';
import { MortgagesService } from '../mortgages/mortgages.service';
import { RentalAgreementsService } from '../rental-agreements/rental-agreements.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { QueryPropertyDto } from './dto/query-property.dto';
import { PropertyEntity } from './entities/property.entity';

@ApiTags('properties')
@Controller('properties')
export class PropertiesController {
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly mortgagesService: MortgagesService,
    private readonly rentalAgreementsService: RentalAgreementsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new property' })
  @ApiResponse({
    status: 201,
    description: 'Property created successfully',
    type: PropertyEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - invalid input',
  })
  create(@Body() createPropertyDto: CreatePropertyDto) {
    return this.propertiesService.create(createPropertyDto);
  }

  @Get()
  @ApiOperation({ summary: 'List properties with pagination, search and filter' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by address, city, country' })
  @ApiQuery({ name: 'type', required: false, enum: ['RESIDENTIAL', 'COMMERCIAL', 'LAND', 'MIXED_USE'], description: 'Filter by type' })
  @ApiQuery({ name: 'status', required: false, enum: ['OWNED', 'IN_CONSTRUCTION', 'IN_PURCHASE', 'SOLD', 'INVESTMENT'], description: 'Filter by status' })
  @ApiQuery({ name: 'city', required: false, type: String, description: 'Filter by city' })
  @ApiQuery({ name: 'country', required: false, type: String, description: 'Filter by country' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of properties',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/PropertyEntity' } },
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
  findAll(@Query() query: QueryPropertyDto) {
    return this.propertiesService.findAll(query);
  }

  @Get(':propertyId/mortgages')
  @ApiOperation({ summary: 'Get mortgages for a property' })
  @ApiParam({ name: 'propertyId', description: 'Property UUID' })
  @ApiResponse({
    status: 200,
    description: 'List of mortgages for the property (direct or linked)',
    schema: {
      type: 'array',
      items: { $ref: '#/components/schemas/MortgageEntity' },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Property not found',
  })
  findMortgagesByProperty(@Param('propertyId') propertyId: string) {
    return this.mortgagesService.findByProperty(propertyId);
  }

  @Get(':propertyId/rental-agreements')
  @ApiOperation({ summary: 'Get rental agreements for a property' })
  @ApiParam({ name: 'propertyId', description: 'Property UUID' })
  @ApiResponse({
    status: 200,
    description: 'List of rental agreements for the property',
    schema: {
      type: 'array',
      items: { $ref: '#/components/schemas/RentalAgreementEntity' },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Property not found',
  })
  findRentalAgreementsByProperty(@Param('propertyId') propertyId: string) {
    return this.rentalAgreementsService.findByProperty(propertyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property by ID' })
  @ApiParam({ name: 'id', description: 'Property UUID' })
  @ApiQuery({
    name: 'include',
    required: false,
    type: String,
    description: 'Include relations: planningProcessState, utilityInfo (comma-separated)',
  })
  @ApiResponse({
    status: 200,
    description: 'Property found',
    type: PropertyEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Property not found',
  })
  findOne(
    @Param('id') id: string,
    @Query('include') include?: string,
  ) {
    return this.propertiesService.findOne(id, include);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update property' })
  @ApiParam({ name: 'id', description: 'Property UUID' })
  @ApiResponse({
    status: 200,
    description: 'Property updated successfully',
    type: PropertyEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'Property not found',
  })
  update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(id, updatePropertyDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete property' })
  @ApiParam({ name: 'id', description: 'Property UUID' })
  @ApiResponse({
    status: 204,
    description: 'Property deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Property not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - property has ownerships, mortgages, or rental agreements',
  })
  async remove(@Param('id') id: string) {
    await this.propertiesService.remove(id);
  }
}
