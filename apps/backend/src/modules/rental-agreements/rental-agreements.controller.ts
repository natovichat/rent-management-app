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
import { RentalAgreementsService } from './rental-agreements.service';
import { CreateRentalAgreementDto } from './dto/create-rental-agreement.dto';
import { UpdateRentalAgreementDto } from './dto/update-rental-agreement.dto';
import { QueryRentalAgreementDto } from './dto/query-rental-agreement.dto';
import { RentalAgreementEntity } from './entities/rental-agreement.entity';
import { RentalAgreementStatus } from '@prisma/client';

@ApiTags('rental-agreements')
@Controller('rental-agreements')
export class RentalAgreementsController {
  constructor(
    private readonly rentalAgreementsService: RentalAgreementsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new rental agreement' })
  @ApiResponse({
    status: 201,
    description: 'Rental agreement created successfully',
    type: RentalAgreementEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or related entity not found',
  })
  create(@Body() createRentalAgreementDto: CreateRentalAgreementDto) {
    return this.rentalAgreementsService.create(createRentalAgreementDto);
  }

  @Get()
  @ApiOperation({ summary: 'List rental agreements with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (1-based)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'status', required: false, enum: RentalAgreementStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'propertyId', required: false, type: String, description: 'Filter by property ID' })
  @ApiQuery({ name: 'tenantId', required: false, type: String, description: 'Filter by tenant ID' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of rental agreements',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/RentalAgreementEntity' } },
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
  findAll(@Query() query: QueryRentalAgreementDto) {
    return this.rentalAgreementsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get rental agreement by ID with property and tenant' })
  @ApiParam({ name: 'id', description: 'Rental agreement UUID' })
  @ApiResponse({
    status: 200,
    description: 'Rental agreement found with property and tenant',
    type: RentalAgreementEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Rental agreement not found',
  })
  findOne(@Param('id') id: string) {
    return this.rentalAgreementsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update rental agreement' })
  @ApiParam({ name: 'id', description: 'Rental agreement UUID' })
  @ApiResponse({
    status: 200,
    description: 'Rental agreement updated successfully',
    type: RentalAgreementEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or related entity not found',
  })
  @ApiResponse({
    status: 404,
    description: 'Rental agreement not found',
  })
  update(
    @Param('id') id: string,
    @Body() updateRentalAgreementDto: UpdateRentalAgreementDto,
  ) {
    return this.rentalAgreementsService.update(id, updateRentalAgreementDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete rental agreement' })
  @ApiParam({ name: 'id', description: 'Rental agreement UUID' })
  @ApiResponse({ status: 204, description: 'Rental agreement soft-deleted successfully' })
  @ApiResponse({ status: 404, description: 'Rental agreement not found' })
  async remove(@Param('id') id: string) {
    await this.rentalAgreementsService.remove(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted rental agreement (admin only)' })
  @ApiParam({ name: 'id', description: 'Rental agreement UUID' })
  @ApiResponse({ status: 200, description: 'Rental agreement restored successfully' })
  @ApiResponse({ status: 404, description: 'Deleted rental agreement not found' })
  restore(@Param('id') id: string) {
    return this.rentalAgreementsService.restore(id);
  }
}
