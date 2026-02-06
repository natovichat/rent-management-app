import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ValuationsService } from './valuations.service';
import { CreateValuationDto } from './dto/create-valuation.dto';
import { UpdateValuationDto } from './dto/update-valuation.dto';

// Hardcoded test account ID - authentication removed for simplification
const HARDCODED_ACCOUNT_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Controller for property valuation management.
 * 
 * Authentication removed for now - all operations use hardcoded account ID.
 */
@ApiTags('valuations')
@Controller('valuations')
export class ValuationsController {
  constructor(private readonly valuationsService: ValuationsService) {}

  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Get all valuations for a property' })
  findAllByProperty(@Param('propertyId') propertyId: string) {
    return this.valuationsService.findAllByProperty(
      propertyId,
      HARDCODED_ACCOUNT_ID,
    );
  }

  @Get('property/:propertyId/latest')
  @ApiOperation({ summary: 'Get the latest valuation for a property' })
  getLatest(@Param('propertyId') propertyId: string) {
    return this.valuationsService.getLatest(propertyId, HARDCODED_ACCOUNT_ID);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a valuation by ID' })
  findOne(@Param('id') id: string) {
    return this.valuationsService.findOne(id, HARDCODED_ACCOUNT_ID);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new valuation' })
  create(@Body() createValuationDto: CreateValuationDto) {
    return this.valuationsService.create(
      createValuationDto,
      HARDCODED_ACCOUNT_ID,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a valuation' })
  update(
    @Param('id') id: string,
    @Body() updateValuationDto: UpdateValuationDto,
  ) {
    return this.valuationsService.update(
      id,
      updateValuationDto,
      HARDCODED_ACCOUNT_ID,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a valuation' })
  remove(@Param('id') id: string) {
    return this.valuationsService.remove(id, HARDCODED_ACCOUNT_ID);
  }
}
