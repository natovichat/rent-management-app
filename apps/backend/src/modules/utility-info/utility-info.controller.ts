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
import { UtilityInfoService } from './utility-info.service';
import { CreateUtilityInfoDto } from './dto/create-utility-info.dto';
import { UpdateUtilityInfoDto } from './dto/update-utility-info.dto';
import { UtilityInfoEntity } from './entities/utility-info.entity';

@ApiTags('utility-info')
@Controller('properties/:propertyId/utility-info')
export class UtilityInfoController {
  constructor(private readonly utilityInfoService: UtilityInfoService) {}

  @Post()
  @ApiOperation({ summary: 'Create utility info for a property' })
  @ApiParam({ name: 'propertyId', description: 'Property UUID' })
  @ApiResponse({
    status: 201,
    description: 'Utility info created successfully',
    type: UtilityInfoEntity,
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
    description: 'Conflict - utility info already exists for this property',
  })
  create(
    @Param('propertyId') propertyId: string,
    @Body() createUtilityInfoDto: CreateUtilityInfoDto,
  ) {
    return this.utilityInfoService.create(propertyId, createUtilityInfoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get utility info for a property' })
  @ApiParam({ name: 'propertyId', description: 'Property UUID' })
  @ApiResponse({
    status: 200,
    description: 'Utility info found',
    type: UtilityInfoEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Utility info not found for this property',
  })
  findByProperty(@Param('propertyId') propertyId: string) {
    return this.utilityInfoService.findByProperty(propertyId);
  }

  @Patch()
  @ApiOperation({ summary: 'Update utility info for a property' })
  @ApiParam({ name: 'propertyId', description: 'Property UUID' })
  @ApiResponse({
    status: 200,
    description: 'Utility info updated successfully',
    type: UtilityInfoEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'Utility info not found for this property',
  })
  update(
    @Param('propertyId') propertyId: string,
    @Body() updateUtilityInfoDto: UpdateUtilityInfoDto,
  ) {
    return this.utilityInfoService.update(propertyId, updateUtilityInfoDto);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete utility info for a property' })
  @ApiParam({ name: 'propertyId', description: 'Property UUID' })
  @ApiResponse({
    status: 204,
    description: 'Utility info deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Utility info not found for this property',
  })
  async remove(@Param('propertyId') propertyId: string) {
    await this.utilityInfoService.remove(propertyId);
  }
}
