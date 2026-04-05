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
import { OwnerPaymentsService } from './owner-payments.service';
import { CreateOwnerPaymentDto } from './dto/create-owner-payment.dto';
import { UpdateOwnerPaymentDto } from './dto/update-owner-payment.dto';
import { QueryOwnerPaymentDto } from './dto/query-owner-payment.dto';
import { OwnerPaymentEntity } from './entities/owner-payment.entity';

@ApiTags('owner-payments')
@Controller('owner-payments')
export class OwnerPaymentsController {
  constructor(private readonly ownerPaymentsService: OwnerPaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Record an owner payment' })
  @ApiResponse({ status: 201, description: 'Owner payment created', type: OwnerPaymentEntity })
  @ApiResponse({ status: 400, description: 'Validation error or duplicate record' })
  create(@Body() createOwnerPaymentDto: CreateOwnerPaymentDto) {
    return this.ownerPaymentsService.create(createOwnerPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: 'List owner payments with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of owner payments' })
  findAll(@Query() query: QueryOwnerPaymentDto) {
    return this.ownerPaymentsService.findAll(query);
  }

  @Get('schedule')
  @ApiOperation({
    summary: 'Get computed owner payment schedule for a rental agreement',
    description: 'Returns one row per ownership per month for the life of the rental agreement. Existing persisted records are merged in; missing months appear as virtual PENDING rows.',
  })
  @ApiQuery({ name: 'rentalAgreementId', required: true, description: 'Rental agreement ID' })
  @ApiQuery({ name: 'ownershipId', required: false, description: 'Filter to a specific ownership' })
  @ApiResponse({ status: 200, description: 'Schedule rows', type: [OwnerPaymentEntity] })
  getSchedule(
    @Query('rentalAgreementId') rentalAgreementId: string,
    @Query('ownershipId') ownershipId?: string,
  ) {
    return this.ownerPaymentsService.getSchedule(rentalAgreementId, ownershipId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single owner payment record' })
  @ApiParam({ name: 'id', description: 'Owner payment ID' })
  @ApiResponse({ status: 200, type: OwnerPaymentEntity })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@Param('id') id: string) {
    return this.ownerPaymentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an owner payment record (e.g. mark as paid)' })
  @ApiParam({ name: 'id', description: 'Owner payment ID' })
  @ApiResponse({ status: 200, type: OwnerPaymentEntity })
  @ApiResponse({ status: 404, description: 'Not found' })
  update(@Param('id') id: string, @Body() updateOwnerPaymentDto: UpdateOwnerPaymentDto) {
    return this.ownerPaymentsService.update(id, updateOwnerPaymentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete an owner payment record' })
  @ApiParam({ name: 'id', description: 'Owner payment ID' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  remove(@Param('id') id: string) {
    return this.ownerPaymentsService.remove(id);
  }
}
