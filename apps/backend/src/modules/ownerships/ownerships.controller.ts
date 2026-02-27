import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { OwnershipsService } from './ownerships.service';
import { CreateOwnershipDto } from './dto/create-ownership.dto';
import { UpdateOwnershipDto } from './dto/update-ownership.dto';
import { OwnershipEntity } from './entities/ownership.entity';
import { OwnershipValidationEntity } from './entities/ownership-validation.entity';

@ApiTags('ownerships')
@Controller('properties/:propertyId/ownerships')
export class PropertyOwnershipsController {
  constructor(private readonly ownershipsService: OwnershipsService) {}

  @Post()
  @ApiOperation({ summary: 'Create ownership for a property' })
  @ApiParam({ name: 'propertyId', description: 'Property UUID' })
  @ApiResponse({
    status: 201,
    description: 'Ownership created successfully',
    type: OwnershipEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - invalid input or percentage out of range',
  })
  @ApiResponse({
    status: 404,
    description: 'Property or owner not found',
  })
  create(
    @Param('propertyId') propertyId: string,
    @Body() createOwnershipDto: CreateOwnershipDto,
  ) {
    return this.ownershipsService.create(propertyId, createOwnershipDto);
  }

  @Get()
  @ApiOperation({ summary: 'List ownerships for a property' })
  @ApiParam({ name: 'propertyId', description: 'Property UUID' })
  @ApiResponse({
    status: 200,
    description: 'List of ownerships with owner details',
    schema: {
      type: 'array',
      items: { $ref: '#/components/schemas/OwnershipEntity' },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Property not found',
  })
  findByProperty(@Param('propertyId') propertyId: string) {
    return this.ownershipsService.findByProperty(propertyId);
  }

  @Get('validate')
  @ApiOperation({ summary: 'Validate total ownership percentage for a property' })
  @ApiParam({ name: 'propertyId', description: 'Property UUID' })
  @ApiResponse({
    status: 200,
    description: 'Validation result',
    type: OwnershipValidationEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Property not found',
  })
  validateTotalOwnership(@Param('propertyId') propertyId: string) {
    return this.ownershipsService.validateTotalOwnership(propertyId);
  }
}

@ApiTags('ownerships')
@Controller('owners/:ownerId/ownerships')
export class OwnerOwnershipsController {
  constructor(private readonly ownershipsService: OwnershipsService) {}

  @Get()
  @ApiOperation({ summary: 'List ownerships for an owner' })
  @ApiParam({ name: 'ownerId', description: 'Owner UUID' })
  @ApiResponse({
    status: 200,
    description: 'List of ownerships with property details',
    schema: {
      type: 'array',
      items: { $ref: '#/components/schemas/OwnershipEntity' },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Owner not found',
  })
  findByOwner(@Param('ownerId') ownerId: string) {
    return this.ownershipsService.findByOwner(ownerId);
  }
}

@ApiTags('ownerships')
@Controller('ownerships')
export class OwnershipsController {
  constructor(private readonly ownershipsService: OwnershipsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get ownership by ID' })
  @ApiParam({ name: 'id', description: 'Ownership UUID' })
  @ApiResponse({
    status: 200,
    description: 'Ownership found',
    type: OwnershipEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Ownership not found',
  })
  findOne(@Param('id') id: string) {
    return this.ownershipsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update ownership' })
  @ApiParam({ name: 'id', description: 'Ownership UUID' })
  @ApiResponse({
    status: 200,
    description: 'Ownership updated successfully',
    type: OwnershipEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'Ownership not found',
  })
  update(
    @Param('id') id: string,
    @Body() updateOwnershipDto: UpdateOwnershipDto,
  ) {
    return this.ownershipsService.update(id, updateOwnershipDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete ownership' })
  @ApiParam({ name: 'id', description: 'Ownership UUID' })
  @ApiResponse({
    status: 204,
    description: 'Ownership deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Ownership not found',
  })
  async remove(@Param('id') id: string) {
    await this.ownershipsService.remove(id);
  }
}
