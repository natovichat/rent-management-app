import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { PlotInfoService } from './plot-info.service';
import { CreatePlotInfoDto } from './dto/create-plot-info.dto';
import { UpdatePlotInfoDto } from './dto/update-plot-info.dto';
import { PlotInfoResponseDto } from './dto/plot-info-response.dto';

// Hardcoded test account ID - authentication removed for simplification
const HARDCODED_ACCOUNT_ID = 'test-account-1';

@ApiTags('plot-info')
@Controller()
export class PlotInfoController {
  constructor(private readonly plotInfoService: PlotInfoService) {}

  @Post('properties/:propertyId/plot-info')
  @ApiOperation({ summary: 'הוספת פרטי חלקה לנכס' })
  @ApiParam({ name: 'propertyId', description: 'Property ID' })
  @ApiResponse({
    status: 201,
    description: 'פרטי החלקה נוצרו בהצלחה',
    type: PlotInfoResponseDto,
  })
  @ApiResponse({ status: 404, description: 'נכס לא נמצא' })
  @ApiResponse({ status: 409, description: 'פרטי חלקה כבר קיימים לנכס זה' })
  create(
    @Param('propertyId') propertyId: string,
    @Body() createDto: CreatePlotInfoDto,
  ) {
    return this.plotInfoService.create(HARDCODED_ACCOUNT_ID, propertyId, createDto);
  }

  @Get('properties/:propertyId/plot-info')
  @ApiOperation({ summary: 'קבלת פרטי חלקה לנכס' })
  @ApiParam({ name: 'propertyId', description: 'Property ID' })
  @ApiResponse({
    status: 200,
    description: 'פרטי החלקה',
    type: PlotInfoResponseDto,
  })
  @ApiResponse({ status: 404, description: 'פרטי חלקה לא נמצאו' })
  findOne(@Param('propertyId') propertyId: string) {
    return this.plotInfoService.findOne(HARDCODED_ACCOUNT_ID, propertyId);
  }

  @Put('plot-info/:id')
  @ApiOperation({ summary: 'עדכון פרטי חלקה' })
  @ApiParam({ name: 'id', description: 'Plot Info ID' })
  @ApiResponse({
    status: 200,
    description: 'פרטי החלקה עודכנו בהצלחה',
    type: PlotInfoResponseDto,
  })
  @ApiResponse({ status: 404, description: 'פרטי חלקה לא נמצאו' })
  update(@Param('id') id: string, @Body() updateDto: UpdatePlotInfoDto) {
    return this.plotInfoService.update(HARDCODED_ACCOUNT_ID, id, updateDto);
  }

  @Delete('plot-info/:id')
  @ApiOperation({ summary: 'מחיקת פרטי חלקה' })
  @ApiParam({ name: 'id', description: 'Plot Info ID' })
  @ApiResponse({
    status: 200,
    description: 'פרטי החלקה נמחקו בהצלחה',
  })
  @ApiResponse({ status: 404, description: 'פרטי חלקה לא נמצאו' })
  remove(@Param('id') id: string) {
    return this.plotInfoService.remove(HARDCODED_ACCOUNT_ID, id);
  }
}
