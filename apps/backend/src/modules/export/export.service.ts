import { Injectable } from '@nestjs/common';
import { stringify } from 'csv-stringify/sync';
import { PrismaService } from '../../database/prisma.service';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

@Injectable()
export class ExportService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Export properties to CSV.
   */
  async exportPropertiesToCsv(
    accountId: string,
    columns?: string[],
  ): Promise<string> {
    const properties = await this.prisma.property.findMany({
      where: { accountId },
      include: {
        plotInfo: true,
        ownerships: {
          include: {
            owner: true,
          },
        },
      },
    });

    const defaultColumns = [
      'address',
      'type',
      'status',
      'city',
      'country',
      'totalArea',
      'landArea',
      'estimatedValue',
      'gush',
      'helka',
      'isMortgaged',
      'fileNumber',
      'notes',
    ];

    const selectedColumns = columns && columns.length > 0 ? columns : defaultColumns;

    const rows = properties.map((property) => {
      const row: Record<string, any> = {};
      selectedColumns.forEach((col) => {
        switch (col) {
          case 'address':
            row[col] = property.address || '';
            break;
          case 'type':
            row[col] = property.type || '';
            break;
          case 'status':
            row[col] = property.status || '';
            break;
          case 'city':
            row[col] = property.city || '';
            break;
          case 'country':
            row[col] = property.country || '';
            break;
          case 'totalArea':
            row[col] = property.totalArea?.toString() || '';
            break;
          case 'landArea':
            row[col] = property.landArea?.toString() || '';
            break;
          case 'estimatedValue':
            row[col] = property.estimatedValue?.toString() || '';
            break;
          case 'gush':
            row[col] = property.plotInfo?.gush || '';
            break;
          case 'helka':
            row[col] = property.plotInfo?.chelka || '';
            break;
          case 'isMortgaged':
            row[col] = property.isMortgaged ? 'true' : 'false';
            break;
          case 'fileNumber':
            row[col] = property.fileNumber || '';
            break;
          case 'notes':
            row[col] = property.notes || '';
            break;
        }
      });
      return row;
    });

    return '\ufeff' + stringify(rows, {
      header: true,
      columns: selectedColumns,
      quoted: true,
    });
  }

  /**
   * Export financial report to Excel.
   */
  async exportFinancialReportToExcel(accountId: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Financial Report');

    // Get financial data
    const properties = await this.prisma.property.findMany({
      where: { accountId },
      include: {
        units: {
          include: {
            leases: {
              where: {
                status: 'ACTIVE',
              },
            },
          },
        },
        mortgages: {
          where: {
            status: 'ACTIVE',
          },
        },
      },
    });

    // Summary sheet
    worksheet.columns = [
      { header: 'Property', key: 'property', width: 30 },
      { header: 'Annual Income', key: 'income', width: 15 },
      { header: 'Annual Expenses', key: 'expenses', width: 15 },
      { header: 'Mortgage Payments', key: 'mortgage', width: 15 },
      { header: 'Net Income', key: 'net', width: 15 },
    ];

    properties.forEach((property) => {
      // Calculate income from all leases in all units
      const annualIncome = property.units.reduce(
        (unitSum: number, unit) =>
          unitSum +
          unit.leases.reduce(
            (leaseSum: number, lease) => leaseSum + (Number(lease.monthlyRent) || 0) * 12,
            0,
          ),
        0,
      );
      const annualExpenses = 0; // Expenses removed - not included in query
      const mortgagePayments = property.mortgages.reduce(
        (sum: number, mortgage) => sum + (Number(mortgage.monthlyPayment) || 0) * 12,
        0,
      );
      const netIncome = annualIncome - annualExpenses - mortgagePayments;

      worksheet.addRow({
        property: property.address,
        income: annualIncome,
        expenses: annualExpenses,
        mortgage: mortgagePayments,
        net: netIncome,
      });
    });

    // Totals row
    const totalIncome = properties.reduce(
      (sum: number, p) =>
        sum +
        p.units.reduce(
          (unitSum: number, unit) =>
            unitSum +
            unit.leases.reduce(
              (leaseSum: number, lease) => leaseSum + (Number(lease.monthlyRent) || 0) * 12,
              0,
            ),
          0,
        ),
      0,
    );
    const totalExpenses = 0; // Expenses removed - not included in query
    const totalMortgage = properties.reduce(
      (sum: number, p) =>
        sum + p.mortgages.reduce((s: number, m) => s + (Number(m.monthlyPayment) || 0) * 12, 0),
      0,
    );
    const totalNet = totalIncome - totalExpenses - totalMortgage;

    worksheet.addRow({
      property: 'TOTAL',
      income: totalIncome,
      expenses: totalExpenses,
      mortgage: totalMortgage,
      net: totalNet,
    });

    // Style totals row
    const totalsRow = worksheet.getRow(worksheet.rowCount);
    totalsRow.font = { bold: true };
    totalsRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Export portfolio summary to PDF.
   */
  async exportPortfolioSummaryToPdf(accountId: string): Promise<Buffer> {
    const properties = await this.prisma.property.findMany({
      where: { accountId },
      include: {
        units: {
          include: {
            leases: {
              where: {
                status: 'ACTIVE',
              },
            },
          },
        },
        mortgages: {
          where: {
            status: 'ACTIVE',
          },
        },
        ownerships: {
          include: {
            owner: true,
          },
        },
      },
    });

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
      doc.on('error', reject);

      // Title
      doc.fontSize(20).text('Portfolio Summary', { align: 'center' });
      doc.moveDown();

      // Summary statistics
      const totalProperties = properties.length;
      const totalUnits = properties.reduce((sum: number, p) => sum + p.units.length, 0);
      const occupiedUnits = properties.reduce(
        (sum: number, p) => sum + p.units.flatMap(u => u.leases).length,
        0,
      );
      const totalMortgages = properties.reduce(
        (sum: number, p) => sum + p.mortgages.length,
        0,
      );
      const totalOwners = new Set(
        properties.flatMap((p) => p.ownerships.map((o) => o.ownerId)),
      ).size;

      doc.fontSize(14).text('Summary Statistics', { underline: true });
      doc.fontSize(12);
      doc.text(`Total Properties: ${totalProperties}`);
      doc.text(`Total Units: ${totalUnits}`);
      doc.text(`Occupied Units: ${occupiedUnits}`);
      doc.text(`Vacancy Rate: ${totalUnits > 0 ? ((totalUnits - occupiedUnits) / totalUnits * 100).toFixed(1) : '0.0'}%`);
      doc.text(`Active Mortgages: ${totalMortgages}`);
      doc.text(`Total Owners: ${totalOwners}`);
      doc.moveDown();

      // Property details
      doc.fontSize(14).text('Property Details', { underline: true });
      doc.moveDown();

      properties.forEach((property, index) => {
        if (index > 0) {
          doc.addPage();
        }

        const activeLeases = property.units.flatMap(u => u.leases).length;
        
        doc.fontSize(12).font('Helvetica-Bold').text(property.address).font('Helvetica');
        doc.fontSize(10);
        doc.text(`Type: ${property.type}`);
        doc.text(`Status: ${property.status}`);
        doc.text(`City: ${property.city}`);
        doc.text(`Units: ${property.units.length}`);
        doc.text(`Active Leases: ${activeLeases}`);
        doc.text(`Mortgages: ${property.mortgages.length}`);
        doc.moveDown();
      });

      doc.end();
    });
  }
}
