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
  UseInterceptors,
  UploadedFile,
  Res,
  Header,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Response } from 'express';
import { PropertiesService } from './properties.service';
import { PropertiesCsvService, PreviewRow } from './properties-csv.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyResponseDto } from './dto/property-response.dto';
import { FindAllPropertiesDto } from './dto/find-all-properties.dto';
import { PropertyType, PropertyStatus } from '@prisma/client';
import { OwnershipsService } from '../ownerships/ownerships.service';
import { CreateOwnershipDto } from '../ownerships/dto/create-ownership.dto';
// Hardcoded test account ID - authentication removed for simplification
const HARDCODED_ACCOUNT_ID = 'test-account-1';

@ApiTags('properties')
@Controller('properties')
export class PropertiesController {
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly csvService: PropertiesCsvService,
    private readonly ownershipsService: OwnershipsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'יצירת נכס חדש' })
  @ApiResponse({
    status: 201,
    description: 'הנכס נוצר בהצלחה',
    type: PropertyResponseDto,
  })
  create(@Body() createPropertyDto: CreatePropertyDto, @Request() req: any) {
    console.log('[PropertiesController] req.headers:', req.headers);
    console.log('[PropertiesController] createPropertyDto.accountId:', createPropertyDto.accountId);
    
    // Priority: X-Account-Id header > DTO > hardcoded
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || createPropertyDto.accountId || HARDCODED_ACCOUNT_ID;
    
    // Remove accountId from DTO before passing to service (service expects it as separate parameter)
    const { accountId, ...dtoWithoutAccountId } = createPropertyDto;
    
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/5f8ed50f-0709-4648-bb8f-261a88441c96',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'properties.controller.ts:60',message:'Controller received create request',data:{accountId:effectiveAccountId,dtoKeys:Object.keys(dtoWithoutAccountId),dtoSample:{address:dtoWithoutAccountId.address,type:dtoWithoutAccountId.type,status:dtoWithoutAccountId.status,totalArea:dtoWithoutAccountId.totalArea,floors:dtoWithoutAccountId.floors,totalUnits:dtoWithoutAccountId.totalUnits,parkingSpaces:dtoWithoutAccountId.parkingSpaces}},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,B'})}).catch(()=>{});
    // #endregion
    console.log('[PropertiesController] About to call service.create()');
    console.log('[PropertiesController] effectiveAccountId:', effectiveAccountId);
    console.log('[PropertiesController] DTO:', dtoWithoutAccountId);
    return this.propertiesService.create(effectiveAccountId, dtoWithoutAccountId);
  }

  @Get()
  @ApiOperation({ summary: 'קבלת כל הנכסים' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, enum: PropertyType, isArray: true })
  @ApiQuery({ name: 'status', required: false, enum: PropertyStatus, isArray: true })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiQuery({ name: 'country', required: false, type: String })
  @ApiQuery({ name: 'isMortgaged', required: false, type: Boolean })
  @ApiQuery({ name: 'accountId', required: false, type: String, description: 'Account ID for filtering (multi-account support)' })
  @ApiQuery({ name: 'minEstimatedValue', required: false, type: Number })
  @ApiQuery({ name: 'maxEstimatedValue', required: false, type: Number })
  @ApiQuery({ name: 'minTotalArea', required: false, type: Number })
  @ApiQuery({ name: 'maxTotalArea', required: false, type: Number })
  @ApiQuery({ name: 'minLandArea', required: false, type: Number })
  @ApiQuery({ name: 'maxLandArea', required: false, type: Number })
  @ApiQuery({ name: 'createdFrom', required: false, type: String })
  @ApiQuery({ name: 'createdTo', required: false, type: String })
  @ApiQuery({ name: 'valuationFrom', required: false, type: String })
  @ApiQuery({ name: 'valuationTo', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'רשימת נכסים',
  })
  findAll(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('type') type?: PropertyType | PropertyType[] | string,
    @Query('status') status?: PropertyStatus | PropertyStatus[] | string,
    @Query('city') city?: string,
    @Query('country') country?: string,
    @Query('isMortgaged') isMortgaged?: string,
    @Query('accountId') accountId?: string,
    @Query('minEstimatedValue') minEstimatedValue?: string,
    @Query('maxEstimatedValue') maxEstimatedValue?: string,
    @Query('minTotalArea') minTotalArea?: string,
    @Query('maxTotalArea') maxTotalArea?: string,
    @Query('minLandArea') minLandArea?: string,
    @Query('maxLandArea') maxLandArea?: string,
    @Query('createdFrom') createdFrom?: string,
    @Query('createdTo') createdTo?: string,
    @Query('valuationFrom') valuationFrom?: string,
    @Query('valuationTo') valuationTo?: string,
  ) {
    // Parse array query parameters (handle comma-separated strings)
    const parseArrayParam = <T>(
      param: T | T[] | string | undefined,
    ): T | T[] | undefined => {
      if (!param) return undefined;
      if (Array.isArray(param)) return param as T[];
      if (typeof param === 'string' && param.includes(',')) {
        return param.split(',') as T[];
      }
      return param as T;
    };

    const parsedType = parseArrayParam<PropertyType>(type);
    const parsedStatus = parseArrayParam<PropertyStatus>(status);

    // Parse isMortgaged string to boolean
    const isMortgagedBoolean =
      isMortgaged !== undefined
        ? isMortgaged === 'true' || isMortgaged === '1'
        : undefined;

    // Priority: X-Account-Id header > query parameter > hardcoded
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || accountId || HARDCODED_ACCOUNT_ID;

    // Parse advanced filter parameters
    const minEstimatedValueNum = minEstimatedValue
      ? parseFloat(minEstimatedValue)
      : undefined;
    const maxEstimatedValueNum = maxEstimatedValue
      ? parseFloat(maxEstimatedValue)
      : undefined;
    const minTotalAreaNum = minTotalArea ? parseFloat(minTotalArea) : undefined;
    const maxTotalAreaNum = maxTotalArea ? parseFloat(maxTotalArea) : undefined;
    const minLandAreaNum = minLandArea ? parseFloat(minLandArea) : undefined;
    const maxLandAreaNum = maxLandArea ? parseFloat(maxLandArea) : undefined;

    return this.propertiesService.findAll(
      effectiveAccountId,
      page,
      limit,
      search,
      parsedType,
      parsedStatus,
      city,
      country,
      isMortgagedBoolean,
      minEstimatedValueNum,
      maxEstimatedValueNum,
      minTotalAreaNum,
      maxTotalAreaNum,
      minLandAreaNum,
      maxLandAreaNum,
      createdFrom,
      createdTo,
      valuationFrom,
      valuationTo,
    );
  }

  @Get('statistics')
  @ApiOperation({ summary: 'קבלת סטטיסטיקות נכסים' })
  getStatistics(@Request() req: any) {
    // Priority: X-Account-Id header > hardcoded
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    return this.propertiesService.getStatistics(effectiveAccountId);
  }

  @Get('portfolio/summary')
  @ApiOperation({ summary: 'קבלת סיכום תיק נכסים' })
  @ApiResponse({
    status: 200,
    description: 'סיכום תיק נכסים כולל סטטיסטיקות מפורטות',
    schema: {
      type: 'object',
      properties: {
        totalProperties: { type: 'number' },
        totalUnits: { type: 'number' },
        activeLeases: { type: 'number' },
        occupancyRate: { type: 'number' },
        totalEstimatedValue: { type: 'number' },
        totalMortgageDebt: { type: 'number' },
        netEquity: { type: 'number' },
        totalArea: { type: 'number' },
        landArea: { type: 'number' },
        propertiesByType: { type: 'object' },
        propertiesByStatus: { type: 'object' },
      },
    },
  })
  getPortfolioSummary(@Request() req: any) {
    // Priority: X-Account-Id header > hardcoded
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    return this.propertiesService.getPortfolioSummary(effectiveAccountId);
  }

  @Get('portfolio/distribution')
  @ApiOperation({ summary: 'קבלת התפלגות נכסים לפי סוג וסטטוס' })
  @ApiResponse({
    status: 200,
    description: 'התפלגות נכסים לפי סוג וסטטוס',
  })
  getPortfolioDistribution(@Request() req: any) {
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    return this.propertiesService.getPortfolioDistribution(effectiveAccountId);
  }

  @Get('portfolio/valuation-history')
  @ApiOperation({ summary: 'קבלת היסטוריית הערכות נכסים' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'היסטוריית הערכות נכסים',
  })
  getValuationHistory(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    return this.propertiesService.getValuationHistory(
      effectiveAccountId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get(':id/ownerships')
  @ApiOperation({ summary: 'קבלת כל הבעלויות של נכס' })
  @ApiResponse({
    status: 200,
    description: 'רשימת בעלויות',
  })
  @ApiResponse({
    status: 404,
    description: 'נכס לא נמצא',
  })
  getPropertyOwnerships(
    @Param('id') propertyId: string,
    @Request() req: any,
  ) {
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    return this.ownershipsService.findAllByProperty(propertyId, effectiveAccountId);
  }

  @Post(':id/ownerships')
  @ApiOperation({ summary: 'יצירת בעלות חדשה לנכס' })
  @ApiResponse({
    status: 201,
    description: 'הבעלות נוצרה בהצלחה',
  })
  @ApiResponse({
    status: 400,
    description: 'סך כל אחוזי הבעלות חייב להיות 100%',
  })
  @ApiResponse({
    status: 404,
    description: 'נכס או בעלים לא נמצאו',
  })
  createPropertyOwnership(
    @Param('id') propertyId: string,
    @Body() createOwnershipDto: Omit<CreateOwnershipDto, 'propertyId'>,
    @Request() req: any,
  ) {
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    // Add propertyId from URL to the DTO
    const fullDto: CreateOwnershipDto = {
      ...createOwnershipDto,
      propertyId,
    };
    return this.ownershipsService.create(fullDto, effectiveAccountId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'קבלת נכס לפי מזהה' })
  @ApiResponse({
    status: 200,
    description: 'פרטי נכס',
    type: PropertyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'נכס לא נמצא' })
  findOne(
    @Request() req: any,
    @Param('id') id: string,
    @Query('accountId') accountId?: string,
  ) {
    // Priority: X-Account-Id header > query parameter > hardcoded
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || accountId || HARDCODED_ACCOUNT_ID;
    return this.propertiesService.findOne(id, effectiveAccountId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'עדכון נכס' })
  @ApiResponse({
    status: 200,
    description: 'הנכס עודכן בהצלחה',
    type: PropertyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'נכס לא נמצא' })
  update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @Request() req: any,
  ) {
    // Priority: X-Account-Id header > DTO > hardcoded
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || (updatePropertyDto as any).accountId || HARDCODED_ACCOUNT_ID;
    
    // Remove accountId from DTO before passing to service
    const { accountId, ...dtoWithoutAccountId } = updatePropertyDto as any;
    
    return this.propertiesService.update(id, effectiveAccountId, dtoWithoutAccountId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'מחיקת נכס' })
  @ApiResponse({ status: 200, description: 'הנכס נמחק בהצלחה' })
  @ApiResponse({ status: 404, description: 'נכס לא נמצא' })
  @ApiResponse({
    status: 403,
    description: 'לא ניתן למחוק נכס עם יחידות קיימות',
  })
  remove(@Param('id') id: string, @Request() req: any) {
    // Priority: X-Account-Id header > hardcoded
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    return this.propertiesService.remove(id, effectiveAccountId);
  }

  @Get('csv/example')
  @ApiOperation({ summary: 'הורדת קובץ CSV לדוגמה' })
  @ApiResponse({ status: 200, description: 'קובץ CSV לדוגמה' })
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="properties-example.csv"')
  downloadExampleCsv(@Res() res: Response) {
    const csv = this.csvService.generateExampleCsv();
    res.send(csv);
  }

  @Get('csv/export')
  @ApiOperation({ summary: 'ייצוא נכסים לקובץ CSV' })
  @ApiResponse({ status: 200, description: 'קובץ CSV עם כל הנכסים' })
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="properties-export.csv"')
  async exportToCsv(@Res() res: Response, @Request() req: any) {
    // Priority: X-Account-Id header > hardcoded
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    const csv = await this.csvService.exportPropertiesToCsv(effectiveAccountId);
    res.send(csv);
  }

  @Post('csv/preview')
  @ApiOperation({ summary: 'תצוגה מקדימה של ייבוא נכסים מקובץ CSV' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'תצוגה מקדימה עם שגיאות אימות',
  })
  @UseInterceptors(FileInterceptor('file'))
  async previewCsvImport(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ valid: boolean; rows: PreviewRow[]; summary: { total: number; valid: number; invalid: number } }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.csvService.validateCsvPreview(file.buffer);
  }

  @Post('csv/import')
  @ApiOperation({ summary: 'ייבוא נכסים מקובץ CSV' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        skipErrors: {
          type: 'boolean',
          default: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'תוצאות הייבוא',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'number' },
        failed: { type: 'number' },
        errors: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async importFromCsv(
    @UploadedFile() file: Express.Multer.File,
    @Body('skipErrors') skipErrors: boolean = true,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Priority: X-Account-Id header > hardcoded
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    return this.csvService.importPropertiesFromCsv(effectiveAccountId, file.buffer, skipErrors);
  }

  @Delete('test/cleanup')
  @ApiOperation({ 
    summary: 'מחיקת כל נתוני הטסט (TEST ONLY)',
    description: 'מוחק את כל הנכסים של חשבון הטסט. ⚠️ משמש רק לטסטי E2E!'
  })
  @ApiResponse({
    status: 200,
    description: 'נתונים נמחקו בהצלחה',
    schema: {
      type: 'object',
      properties: {
        deletedCount: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'ניתן למחוק רק נתוני חשבון טסט',
  })
  async deleteTestData() {
    // Only allow deletion for test account
    const result = await this.propertiesService.deleteAllForAccount(HARDCODED_ACCOUNT_ID);
    return {
      ...result,
      message: `Deleted ${result.deletedCount} properties for test account`,
    };
  }
}
