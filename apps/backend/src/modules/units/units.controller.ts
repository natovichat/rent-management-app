import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { UnitResponseDto } from './dto/unit-response.dto';
// Hardcoded test account ID - authentication removed for simplification
const HARDCODED_ACCOUNT_ID = 'test-account-1';

@ApiTags('units')
@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post()
  @ApiOperation({ summary: 'יצירת יחידת דיור חדשה' })
  @ApiResponse({
    status: 201,
    description: 'היחידה נוצרה בהצלחה',
    type: UnitResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'נכס לא נמצא או לא שייך לחשבון שלך',
  })
  @ApiResponse({
    status: 400,
    description: 'מספר דירה כבר קיים בנכס זה',
  })
  create(@Body() createUnitDto: CreateUnitDto, @Request() req: any) {
    // Priority: X-Account-Id header > hardcoded
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    return this.unitsService.create(effectiveAccountId, createUnitDto);
  }

  @Get()
  @ApiOperation({ summary: 'קבלת כל יחידות הדיור' })
  @ApiQuery({
    name: 'propertyId',
    required: false,
    type: String,
    description: 'סינון לפי מזהה נכס',
  })
  @ApiQuery({
    name: 'unitType',
    required: false,
    type: String,
    description: 'סינון לפי סוג יחידה (APARTMENT, STUDIO, PENTHOUSE, COMMERCIAL, STORAGE, PARKING)',
  })
  @ApiQuery({
    name: 'floor',
    required: false,
    type: Number,
    description: 'סינון לפי קומה',
  })
  @ApiQuery({
    name: 'roomCount',
    required: false,
    type: Number,
    description: 'סינון לפי מספר חדרים',
  })
  @ApiQuery({
    name: 'occupancyStatus',
    required: false,
    type: String,
    description: 'סינון לפי סטטוס תפוסה (VACANT, OCCUPIED, UNDER_RENOVATION)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'חיפוש לפי מספר דירה או כתובת נכס',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'מספר עמוד',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'מספר תוצאות בעמוד',
  })
  @ApiResponse({
    status: 200,
    description: 'רשימת יחידות דיור',
  })
  @ApiResponse({
    status: 404,
    description: 'נכס לא נמצא או לא שייך לחשבון שלך',
  })
  findAll(
    @Request() req: any,
    @Query('propertyId') propertyId?: string,
    @Query('unitType') unitType?: string,
    @Query('floor') floor?: string,
    @Query('roomCount') roomCount?: string,
    @Query('occupancyStatus') occupancyStatus?: string,
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    // Parse optional number parameters
    const floorNum = floor ? parseInt(floor, 10) : undefined;
    const roomCountNum = roomCount ? parseInt(roomCount, 10) : undefined;
    // Priority: X-Account-Id header > hardcoded
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    return this.unitsService.findAll(
      effectiveAccountId,
      propertyId,
      unitType,
      floorNum,
      roomCountNum,
      occupancyStatus,
      search,
      page,
      limit,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'קבלת יחידת דיור לפי מזהה' })
  @ApiResponse({
    status: 200,
    description: 'פרטי יחידת דיור',
    type: UnitResponseDto,
  })
  @ApiResponse({ status: 404, description: 'יחידת דיור לא נמצאה' })
  findOne(@Param('id') id: string, @Request() req: any) {
    // Priority: X-Account-Id header > hardcoded
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    return this.unitsService.findOne(id, effectiveAccountId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'עדכון יחידת דיור' })
  @ApiResponse({
    status: 200,
    description: 'היחידה עודכנה בהצלחה',
    type: UnitResponseDto,
  })
  @ApiResponse({ status: 404, description: 'יחידת דיור לא נמצאה' })
  @ApiResponse({
    status: 400,
    description: 'מספר דירה כבר קיים בנכס זה',
  })
  update(@Param('id') id: string, @Body() updateUnitDto: UpdateUnitDto, @Request() req: any) {
    // Priority: X-Account-Id header > hardcoded
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    return this.unitsService.update(id, effectiveAccountId, updateUnitDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'מחיקת יחידת דיור' })
  @ApiResponse({ status: 200, description: 'היחידה נמחקה בהצלחה' })
  @ApiResponse({ status: 404, description: 'יחידת דיור לא נמצאה' })
  @ApiResponse({
    status: 403,
    description: 'לא ניתן למחוק יחידה עם חוזי שכירות (פעילים או היסטוריים)',
  })
  remove(@Param('id') id: string, @Request() req: any) {
    // Priority: X-Account-Id header > hardcoded
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    return this.unitsService.remove(id, effectiveAccountId);
  }
}
