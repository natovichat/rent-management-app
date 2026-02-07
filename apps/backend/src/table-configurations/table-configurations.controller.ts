import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TableConfigurationsService } from './table-configurations.service';
import { UpdateTableConfigDto, EntityType, VALID_ENTITY_TYPES } from './dto/update-table-config.dto';

@ApiTags('Table Configurations')
@Controller('table-configurations')
export class TableConfigurationsController {
  constructor(
    private readonly tableConfigurationsService: TableConfigurationsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all table configurations' })
  @ApiResponse({
    status: 200,
    description: 'Returns all table configurations',
  })
  async getAllConfigurations() {
    return this.tableConfigurationsService.getAllConfigurations();
  }

  @Get(':entityType')
  @ApiOperation({ summary: 'Get configuration for specific entity type' })
  @ApiParam({
    name: 'entityType',
    enum: VALID_ENTITY_TYPES,
    description: 'Entity type',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns configuration or null if not found',
  })
  async getConfiguration(@Param('entityType') entityType: EntityType) {
    return this.tableConfigurationsService.getConfiguration(entityType);
  }

  @Post()
  @ApiOperation({ summary: 'Create or update table configuration' })
  @ApiResponse({
    status: 200,
    description: 'Configuration created or updated successfully',
  })
  async upsertConfiguration(@Body() dto: UpdateTableConfigDto) {
    return this.tableConfigurationsService.upsertConfiguration(dto);
  }

  @Delete(':entityType')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete configuration (reset to defaults)',
  })
  @ApiParam({
    name: 'entityType',
    enum: VALID_ENTITY_TYPES,
    description: 'Entity type',
  })
  @ApiResponse({
    status: 204,
    description: 'Configuration deleted successfully',
  })
  async deleteConfiguration(@Param('entityType') entityType: EntityType) {
    await this.tableConfigurationsService.deleteConfiguration(entityType);
  }

  @Post(':entityType/reset')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Reset configuration to defaults',
  })
  @ApiParam({
    name: 'entityType',
    enum: VALID_ENTITY_TYPES,
    description: 'Entity type',
  })
  @ApiResponse({
    status: 204,
    description: 'Configuration reset to defaults',
  })
  async resetToDefaults(@Param('entityType') entityType: EntityType) {
    await this.tableConfigurationsService.resetToDefaults(entityType);
  }
}
