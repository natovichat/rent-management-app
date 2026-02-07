import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Request,
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
    @Request() req: any,
    @Param('propertyId') propertyId: string,
    @Body() createDto: CreatePlotInfoDto,
  ) {
    const accountId = req.headers['x-account-id'] || HARDCODED_ACCOUNT_ID;
    return this.plotInfoService.create(accountId, propertyId, createDto);
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
  findOne(@Request() req: any, @Param('propertyId') propertyId: string) {
    const accountId = req.headers['x-account-id'] || HARDCODED_ACCOUNT_ID;
    return this.plotInfoService.findOne(accountId, propertyId);
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
  update(@Request() req: any, @Param('id') id: string, @Body() updateDto: UpdatePlotInfoDto) {
    const accountId = req.headers['x-account-id'] || HARDCODED_ACCOUNT_ID;
    return this.plotInfoService.update(accountId, id, updateDto);
  }

  @Delete('plot-info/:id')
  @ApiOperation({ summary: 'מחיקת פרטי חלקה' })
  @ApiParam({ name: 'id', description: 'Plot Info ID' })
  @ApiResponse({
    status: 200,
    description: 'פרטי החלקה נמחקו בהצלחה',
  })
  @ApiResponse({ status: 404, description: 'פרטי חלקה לא נמצאו' })
  remove(@Request() req: any, @Param('id') id: string) {
    const accountId = req.headers['x-account-id'] || HARDCODED_ACCOUNT_ID;
    return this.plotInfoService.remove(accountId, id);
  }
}
