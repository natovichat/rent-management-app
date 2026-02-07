import {
  Controller,
  Get,
  Post,
  Query,
  Res,
  Request,
  Body,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ExportService } from './export.service';

const HARDCODED_ACCOUNT_ID = 'test-account-1';

@ApiTags('export')
@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('properties/csv')
  @ApiOperation({ summary: 'ייצוא נכסים לקובץ CSV' })
  @ApiQuery({ name: 'columns', required: false, type: String, isArray: true })
  async exportPropertiesCsv(
    @Query('columns') columns: string[],
    @Res() res: Response,
    @Request() req: any,
  ) {
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    const csv = await this.exportService.exportPropertiesToCsv(
      effectiveAccountId,
      columns,
    );
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=properties-export.csv');
    res.send(csv);
  }

  @Get('financial/excel')
  @ApiOperation({ summary: 'ייצוא דוח כספי לקובץ Excel' })
  async exportFinancialExcel(@Res() res: Response, @Request() req: any) {
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    const excel = await this.exportService.exportFinancialReportToExcel(
      effectiveAccountId,
    );
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=financial-report.xlsx');
    res.send(excel);
  }

  @Get('portfolio/pdf')
  @ApiOperation({ summary: 'ייצוא סיכום תיק לקובץ PDF' })
  async exportPortfolioPdf(@Res() res: Response, @Request() req: any) {
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    const pdf = await this.exportService.exportPortfolioSummaryToPdf(
      effectiveAccountId,
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=portfolio-summary.pdf');
    res.send(pdf);
  }

  @Post('properties/csv/configure')
  @ApiOperation({ summary: 'הגדרת עמודות לייצוא CSV' })
  async configureExportColumns(
    @Body('columns') columns: string[],
    @Request() req: any,
  ) {
    // Store configuration (could be saved to database per user)
    const headerAccountId = req.headers['x-account-id'];
    const effectiveAccountId = headerAccountId || HARDCODED_ACCOUNT_ID;
    // For now, just return success
    return { success: true, columns };
  }
}
