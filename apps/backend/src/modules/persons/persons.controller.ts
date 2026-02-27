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
import { PersonsService } from './persons.service';
import { RentalAgreementsService } from '../rental-agreements/rental-agreements.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { QueryPersonDto } from './dto/query-person.dto';
import { PersonEntity } from './entities/person.entity';

@ApiTags('persons')
@Controller('persons')
export class PersonsController {
  constructor(
    private readonly personsService: PersonsService,
    private readonly rentalAgreementsService: RentalAgreementsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new person' })
  @ApiResponse({
    status: 201,
    description: 'Person created successfully',
    type: PersonEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - invalid input',
  })
  create(@Body() createPersonDto: CreatePersonDto) {
    return this.personsService.create(createPersonDto);
  }

  @Get()
  @ApiOperation({ summary: 'List persons with pagination and search' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name, email, phone' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of persons',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/PersonEntity' } },
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
  findAll(@Query() query: QueryPersonDto) {
    return this.personsService.findAll(query);
  }

  @Get(':personId/rental-agreements')
  @ApiOperation({ summary: 'Get rental agreements for a person (tenant)' })
  @ApiParam({ name: 'personId', description: 'Person UUID (tenant)' })
  @ApiResponse({
    status: 200,
    description: 'List of rental agreements for the tenant',
    schema: {
      type: 'array',
      items: { $ref: '#/components/schemas/RentalAgreementEntity' },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Person not found',
  })
  findRentalAgreementsByTenant(@Param('personId') personId: string) {
    return this.rentalAgreementsService.findByTenant(personId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get person by ID' })
  @ApiParam({ name: 'id', description: 'Person UUID' })
  @ApiResponse({
    status: 200,
    description: 'Person found',
    type: PersonEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Person not found',
  })
  findOne(@Param('id') id: string) {
    return this.personsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update person' })
  @ApiParam({ name: 'id', description: 'Person UUID' })
  @ApiResponse({
    status: 200,
    description: 'Person updated successfully',
    type: PersonEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'Person not found',
  })
  update(@Param('id') id: string, @Body() updatePersonDto: UpdatePersonDto) {
    return this.personsService.update(id, updatePersonDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete person' })
  @ApiParam({ name: 'id', description: 'Person UUID' })
  @ApiResponse({
    status: 204,
    description: 'Person deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Person not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - person has mortgages or rental agreements, cannot delete',
  })
  async remove(@Param('id') id: string) {
    await this.personsService.remove(id);
  }
}
