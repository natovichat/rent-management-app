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
import { PropertyEventsService } from './property-events.service';
import { CreatePlanningProcessEventDto } from './dto/create-planning-process-event.dto';
import { CreatePropertyDamageEventDto } from './dto/create-property-damage-event.dto';
import { CreateExpenseEventDto } from './dto/create-expense-event.dto';
import { CreateRentalPaymentRequestEventDto } from './dto/create-rental-payment-request-event.dto';
import { UpdatePropertyEventDto } from './dto/update-property-event.dto';
import { QueryPropertyEventDto } from './dto/query-property-event.dto';
import { PropertyEventEntity } from './entities/property-event.entity';
import { PropertyEventType } from '../../firebase/types';

@ApiTags('property-events')
@Controller('properties/:propertyId/events')
export class PropertyEventsController {
  constructor(
    private readonly propertyEventsService: PropertyEventsService,
  ) {}

  @Post('planning-process')
  @ApiOperation({ summary: 'Create a PlanningProcessEvent' })
  @ApiParam({ name: 'propertyId', description: 'Property UUID' })
  @ApiResponse({
    status: 201,
    description: 'PlanningProcessEvent created',
    type: PropertyEventEntity,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  createPlanningProcess(
    @Param('propertyId') propertyId: string,
    @Body() dto: CreatePlanningProcessEventDto,
  ) {
    return this.propertyEventsService.createPlanningProcess(propertyId, dto);
  }

  @Post('property-damage')
  @ApiOperation({ summary: 'Create a PropertyDamageEvent' })
  @ApiParam({ name: 'propertyId', description: 'Property UUID' })
  @ApiResponse({
    status: 201,
    description: 'PropertyDamageEvent created',
    type: PropertyEventEntity,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  createPropertyDamage(
    @Param('propertyId') propertyId: string,
    @Body() dto: CreatePropertyDamageEventDto,
  ) {
    return this.propertyEventsService.createPropertyDamage(propertyId, dto);
  }

  @Post('expense')
  @ApiOperation({ summary: 'Create an ExpenseEvent' })
  @ApiParam({ name: 'propertyId', description: 'Property UUID' })
  @ApiResponse({
    status: 201,
    description: 'ExpenseEvent created',
    type: PropertyEventEntity,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  createExpense(
    @Param('propertyId') propertyId: string,
    @Body() dto: CreateExpenseEventDto,
  ) {
    return this.propertyEventsService.createExpense(propertyId, dto);
  }

  @Post('rental-payment-request')
  @ApiOperation({ summary: 'Create a RentalPaymentRequestEvent' })
  @ApiParam({ name: 'propertyId', description: 'Property UUID' })
  @ApiResponse({
    status: 201,
    description: 'RentalPaymentRequestEvent created',
    type: PropertyEventEntity,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  createRentalPaymentRequest(
    @Param('propertyId') propertyId: string,
    @Body() dto: CreateRentalPaymentRequestEventDto,
  ) {
    return this.propertyEventsService.createRentalPaymentRequest(
      propertyId,
      dto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'List property events with pagination and filter' })
  @ApiParam({ name: 'propertyId', description: 'Property UUID' })
  @ApiQuery({
    name: 'eventType',
    required: false,
    enum: PropertyEventType,
    description: 'Filter by event type',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of property events',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/PropertyEventEntity' },
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Property not found' })
  findByProperty(
    @Param('propertyId') propertyId: string,
    @Query() query: QueryPropertyEventDto,
  ) {
    return this.propertyEventsService.findByProperty(propertyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property event by ID' })
  @ApiParam({ name: 'propertyId', description: 'Property UUID' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  @ApiResponse({
    status: 200,
    description: 'Property event found',
    type: PropertyEventEntity,
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  findOne(
    @Param('propertyId') propertyId: string,
    @Param('id') id: string,
  ) {
    return this.propertyEventsService.findOne(propertyId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update property event (partial, preserves eventType)' })
  @ApiParam({ name: 'propertyId', description: 'Property UUID' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  @ApiResponse({
    status: 200,
    description: 'Property event updated',
    type: PropertyEventEntity,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  update(
    @Param('propertyId') propertyId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePropertyEventDto,
  ) {
    return this.propertyEventsService.update(propertyId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete property event' })
  @ApiParam({ name: 'propertyId', description: 'Property UUID' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  @ApiResponse({ status: 204, description: 'Property event soft-deleted' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async remove(
    @Param('propertyId') propertyId: string,
    @Param('id') id: string,
  ) {
    await this.propertyEventsService.remove(propertyId, id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted property event (admin only)' })
  @ApiParam({ name: 'propertyId', description: 'Property UUID' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  @ApiResponse({ status: 200, description: 'Property event restored successfully' })
  @ApiResponse({ status: 404, description: 'Deleted event not found' })
  restore(
    @Param('propertyId') propertyId: string,
    @Param('id') id: string,
  ) {
    return this.propertyEventsService.restore(propertyId, id);
  }
}
