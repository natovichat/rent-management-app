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
import { PlanningProcessStatesService } from './planning-process-states.service';
import { CreatePlanningProcessStateDto } from './dto/create-planning-process-state.dto';
import { UpdatePlanningProcessStateDto } from './dto/update-planning-process-state.dto';
import { PlanningProcessStateEntity } from './entities/planning-process-state.entity';

@ApiTags('planning-process-states')
@Controller('properties/:propertyId/planning-process-state')
export class PlanningProcessStatesController {
  constructor(
    private readonly planningProcessStatesService: PlanningProcessStatesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create planning process state for a property' })
  @ApiParam({ name: 'propertyId', description: 'Property UUID' })
  @ApiResponse({
    status: 201,
    description: 'Planning process state created successfully',
    type: PlanningProcessStateEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - invalid input',
  })
  @ApiResponse({
    status: 404,
    description: 'Property not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Property already has a planning process state',
  })
  create(
    @Param('propertyId') propertyId: string,
    @Body() createDto: CreatePlanningProcessStateDto,
  ) {
    return this.planningProcessStatesService.create(propertyId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get planning process state for a property' })
  @ApiParam({ name: 'propertyId', description: 'Property UUID' })
  @ApiResponse({
    status: 200,
    description: 'Planning process state found',
    type: PlanningProcessStateEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Planning process state not found',
  })
  findByProperty(@Param('propertyId') propertyId: string) {
    return this.planningProcessStatesService.findByProperty(propertyId);
  }

  @Patch()
  @ApiOperation({ summary: 'Update planning process state for a property' })
  @ApiParam({ name: 'propertyId', description: 'Property UUID' })
  @ApiResponse({
    status: 200,
    description: 'Planning process state updated successfully',
    type: PlanningProcessStateEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'Planning process state not found',
  })
  update(
    @Param('propertyId') propertyId: string,
    @Body() updateDto: UpdatePlanningProcessStateDto,
  ) {
    return this.planningProcessStatesService.update(propertyId, updateDto);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete planning process state for a property' })
  @ApiParam({ name: 'propertyId', description: 'Property UUID' })
  @ApiResponse({
    status: 204,
    description: 'Planning process state deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Planning process state not found',
  })
  async remove(@Param('propertyId') propertyId: string) {
    await this.planningProcessStatesService.remove(propertyId);
  }
}
