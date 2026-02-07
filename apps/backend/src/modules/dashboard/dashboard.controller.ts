import {
  Controller,
  Get,
  Put,
  Body,
  Query,
  Request,
  Res,
  Header,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { DashboardService } from './dashboard.service';
// Hardcoded test account ID - fallback if header not provided
const HARDCODED_ACCOUNT_ID = 'test-account-1';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  private getAccountId(req: any): string {
    const headerAccountId = req.headers['x-account-id'];
    return headerAccountId || HARDCODED_ACCOUNT_ID;
  }

  @Get('roi')
  @ApiOperation({ summary: 'Get ROI metrics for portfolio' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'ROI metrics for portfolio',
  })
  getROI(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.dashboardService.getROI(
      this.getAccountId(req),
      startDate,
      endDate,
    );
  }

  @Get('cash-flow')
  @ApiOperation({ summary: 'Get cash flow summary' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'groupBy', required: false, enum: ['month', 'quarter', 'year'], description: 'Group by period' })
  @ApiResponse({
    status: 200,
    description: 'Cash flow summary grouped by period',
  })
  getCashFlow(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('groupBy') groupBy: 'month' | 'quarter' | 'year' = 'month',
  ) {
    return this.dashboardService.getCashFlow(
      this.getAccountId(req),
      startDate,
      endDate,
      groupBy,
    );
  }

  @Get('export')
  @ApiOperation({ summary: 'Export dashboard data as PDF or Excel' })
  @ApiQuery({ name: 'format', required: true, enum: ['pdf', 'excel'], description: 'Export format' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Dashboard export file',
  })
  async exportDashboard(
    @Request() req: any,
    @Res() res: Response,
    @Query('format') format: 'pdf' | 'excel',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const accountId = this.getAccountId(req);
    const exportData = await this.dashboardService.exportDashboard(
      accountId,
      format,
      startDate,
      endDate,
    );

    const filename = `dashboard_export_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
    
    res.setHeader('Content-Type', format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(exportData);
  }

  @Get('widget-preferences')
  @ApiOperation({ summary: 'Get dashboard widget preferences' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard widget preferences',
  })
  getWidgetPreferences(@Request() req: any) {
    return this.dashboardService.getWidgetPreferences(this.getAccountId(req));
  }

  @Put('widget-preferences')
  @ApiOperation({ summary: 'Save dashboard widget preferences' })
  @ApiResponse({
    status: 200,
    description: 'Widget preferences saved',
  })
  saveWidgetPreferences(
    @Request() req: any,
    @Body() preferences: { visibleWidgets: string[]; widgetOrder: string[] },
  ) {
    return this.dashboardService.saveWidgetPreferences(
      this.getAccountId(req),
      preferences,
    );
  }
}
