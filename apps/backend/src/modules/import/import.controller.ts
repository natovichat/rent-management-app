import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Request,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { ImportService, PreviewRow } from './import.service';

const HARDCODED_ACCOUNT_ID = '00000000-0000-0000-0000-000000000001';

@ApiTags('import')
@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('ownerships/preview')
  @ApiOperation({ summary: 'תצוגה מקדימה של ייבוא בעלויות מקובץ CSV' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async previewOwnerships(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ): Promise<{ valid: boolean; rows: PreviewRow[]; summary: { total: number; valid: number; invalid: number } }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    return this.importService.validateOwnershipsCsv(effectiveAccountId, file.buffer);
  }

  @Post('ownerships')
  @ApiOperation({ summary: 'ייבוא בעלויות מקובץ CSV' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async importOwnerships(
    @UploadedFile() file: Express.Multer.File,
    @Body('skipErrors') skipErrors: boolean = true,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    return this.importService.importOwnershipsFromCsv(effectiveAccountId, file.buffer, skipErrors);
  }

  @Post('mortgages/preview')
  @ApiOperation({ summary: 'תצוגה מקדימה של ייבוא משכנתאות מקובץ CSV' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async previewMortgages(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ): Promise<{ valid: boolean; rows: PreviewRow[]; summary: { total: number; valid: number; invalid: number } }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    return this.importService.validateMortgagesCsv(effectiveAccountId, file.buffer);
  }

  @Post('mortgages')
  @ApiOperation({ summary: 'ייבוא משכנתאות מקובץ CSV' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async importMortgages(
    @UploadedFile() file: Express.Multer.File,
    @Body('skipErrors') skipErrors: boolean = true,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    return this.importService.importMortgagesFromCsv(effectiveAccountId, file.buffer, skipErrors);
  }

  @Post('plot-info/preview')
  @ApiOperation({ summary: 'תצוגה מקדימה של ייבוא פרטי חלקה מקובץ CSV' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async previewPlotInfo(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ): Promise<{ valid: boolean; rows: PreviewRow[]; summary: { total: number; valid: number; invalid: number } }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    return this.importService.validatePlotInfoCsv(effectiveAccountId, file.buffer);
  }

  @Post('plot-info')
  @ApiOperation({ summary: 'ייבוא פרטי חלקה מקובץ CSV' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async importPlotInfo(
    @UploadedFile() file: Express.Multer.File,
    @Body('skipErrors') skipErrors: boolean = true,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    return this.importService.importPlotInfoFromCsv(effectiveAccountId, file.buffer, skipErrors);
  }
}
