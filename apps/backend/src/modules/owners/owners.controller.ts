import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  DefaultValuePipe,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { OwnersService } from './owners.service';
import { OwnersCsvService, PreviewRow } from './owners-csv.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
// Hardcoded test account ID - authentication removed for simplification
const HARDCODED_ACCOUNT_ID = 'test-account-1';

@ApiTags('owners')
@Controller('owners')
export class OwnersController {
  constructor(
    private readonly ownersService: OwnersService,
    private readonly csvService: OwnersCsvService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'יצירת בעלים חדש' })
  @ApiResponse({
    status: 201,
    description: 'הבעלים נוצר בהצלחה',
  })
  @ApiResponse({
    status: 409,
    description: 'בעלים עם אימייל זה כבר קיים',
  })
  create(
    @Body() createOwnerDto: CreateOwnerDto,
    @Request() req: any,
  ) {
    // Priority: X-Account-Id header > hardcoded
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    return this.ownersService.create(createOwnerDto, effectiveAccountId);
  }

  @Get()
  @ApiOperation({ summary: 'קבלת כל הבעלים' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'רשימת בעלים',
  })
  findAll(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    // Priority: X-Account-Id header > hardcoded
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    
    return this.ownersService.findAll(effectiveAccountId, page, limit, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'קבלת בעלים לפי מזהה' })
  @ApiResponse({
    status: 200,
    description: 'פרטי בעלים',
  })
  @ApiResponse({ status: 404, description: 'בעלים לא נמצא' })
  findOne(@Param('id') id: string, @Request() req: any) {
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    return this.ownersService.findOne(id, effectiveAccountId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'עדכון בעלים' })
  @ApiResponse({
    status: 200,
    description: 'הבעלים עודכן בהצלחה',
  })
  @ApiResponse({ status: 404, description: 'בעלים לא נמצא' })
  @ApiResponse({
    status: 409,
    description: 'בעלים עם אימייל זה כבר קיים',
  })
  update(
    @Param('id') id: string,
    @Body() updateOwnerDto: UpdateOwnerDto,
    @Request() req: any,
  ) {
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    return this.ownersService.update(id, effectiveAccountId, updateOwnerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'מחיקת בעלים' })
  @ApiResponse({ status: 200, description: 'הבעלים נמחק בהצלחה' })
  @ApiResponse({ status: 404, description: 'בעלים לא נמצא' })
  @ApiResponse({
    status: 403,
    description: 'לא ניתן למחוק בעלים עם בעלויות פעילות',
  })
  remove(@Param('id') id: string, @Request() req: any) {
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    return this.ownersService.remove(id, effectiveAccountId);
  }

  @Get(':id/properties')
  @ApiOperation({ summary: 'קבלת כל הנכסים של בעלים' })
  @ApiResponse({
    status: 200,
    description: 'רשימת נכסים של הבעלים',
  })
  @ApiResponse({ status: 404, description: 'בעלים לא נמצא' })
  getOwnerProperties(@Param('id') id: string, @Request() req: any) {
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    return this.ownersService.getOwnerProperties(id, effectiveAccountId);
  }

  @Delete('test/cleanup')
  @ApiOperation({ 
    summary: 'מחיקת כל נתוני הטסט (TEST ONLY)',
    description: 'מוחק את כל הבעלים של חשבון הטסט. ⚠️ משמש רק לטסטי E2E!'
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
    const result = await this.ownersService.deleteAllForAccount(HARDCODED_ACCOUNT_ID);
    return {
      ...result,
      message: `Deleted ${result.deletedCount} owners for test account`,
    };
  }

  @Get('csv/example')
  @ApiOperation({ summary: 'הורדת קובץ CSV לדוגמה' })
  @ApiResponse({
    status: 200,
    description: 'קובץ CSV לדוגמה',
    content: {
      'text/csv': {
        schema: { type: 'string', format: 'binary' },
      },
    },
  })
  async downloadExampleCsv(@Res() res: Response) {
    const csv = this.csvService.generateExampleCsv();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=owners-example.csv');
    res.send('\ufeff' + csv); // UTF-8 BOM
  }

  @Post('csv/preview')
  @ApiOperation({ summary: 'תצוגה מקדימה של ייבוא בעלים מקובץ CSV' })
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
  @ApiOperation({ summary: 'ייבוא בעלים מקובץ CSV' })
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
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    return this.csvService.importOwnersFromCsv(effectiveAccountId, file.buffer, skipErrors);
  }
}
