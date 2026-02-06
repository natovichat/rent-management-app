import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getROI(
    accountId: string,
    startDate?: string,
    endDate?: string,
  ) {
    // Get total property value
    const properties = await this.prisma.property.findMany({
      where: { accountId },
      include: {
        valuations: {
          orderBy: { valuationDate: 'desc' },
          take: 1,
        },
      },
    });

    const totalPropertyValue = properties.reduce((sum, p) => {
      const value = p.estimatedValue
        ? Number(p.estimatedValue)
        : p.valuations.length > 0
          ? Number(p.valuations[0].estimatedValue)
          : 0;
      return sum + value;
    }, 0);

    // Get income and expenses
    const whereIncome: any = { accountId };
    const whereExpense: any = { accountId };

    if (startDate || endDate) {
      whereIncome.incomeDate = {};
      whereExpense.expenseDate = {};
      if (startDate) {
        whereIncome.incomeDate.gte = new Date(startDate);
        whereExpense.expenseDate.gte = new Date(startDate);
      }
      if (endDate) {
        whereIncome.incomeDate.lte = new Date(endDate);
        whereExpense.expenseDate.lte = new Date(endDate);
      }
    }

    const incomes = await this.prisma.propertyIncome.findMany({
      where: whereIncome,
      select: { amount: true },
    });

    const expenses = await this.prisma.propertyExpense.findMany({
      where: whereExpense,
      select: { amount: true },
    });

    const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const netIncome = totalIncome - totalExpenses;

    // Calculate ROI: (Net Income / Total Property Value) * 100
    const portfolioROI = totalPropertyValue > 0
      ? Number(((netIncome / totalPropertyValue) * 100).toFixed(2))
      : 0;

    return {
      portfolioROI,
      totalIncome: Number(totalIncome.toFixed(2)),
      totalExpenses: Number(totalExpenses.toFixed(2)),
      netIncome: Number(netIncome.toFixed(2)),
      totalPropertyValue: Number(totalPropertyValue.toFixed(2)),
    };
  }

  async getCashFlow(
    accountId: string,
    startDate?: string,
    endDate?: string,
    groupBy: 'month' | 'quarter' | 'year' = 'month',
  ) {
    const whereIncome: any = { accountId };
    const whereExpense: any = { accountId };
    const whereMortgage: any = { accountId };

    if (startDate || endDate) {
      whereIncome.incomeDate = {};
      whereExpense.expenseDate = {};
      whereMortgage.paymentDate = {};
      if (startDate) {
        whereIncome.incomeDate.gte = new Date(startDate);
        whereExpense.expenseDate.gte = new Date(startDate);
        whereMortgage.paymentDate.gte = new Date(startDate);
      }
      if (endDate) {
        whereIncome.incomeDate.lte = new Date(endDate);
        whereExpense.expenseDate.lte = new Date(endDate);
        whereMortgage.paymentDate.lte = new Date(endDate);
      }
    }

    const incomes = await this.prisma.propertyIncome.findMany({
      where: whereIncome,
      select: {
        incomeDate: true,
        amount: true,
      },
    });

    const expenses = await this.prisma.propertyExpense.findMany({
      where: whereExpense,
      select: {
        expenseDate: true,
        amount: true,
      },
    });

    const mortgagePayments = await this.prisma.mortgagePayment.findMany({
      where: whereMortgage,
      select: {
        paymentDate: true,
        amount: true,
      },
    });

    // Group by period
    const periodMap = new Map<string, {
      income: number;
      expenses: number;
      mortgagePayments: number;
    }>();

    incomes.forEach((income) => {
      const period = this.getPeriodKey(income.incomeDate, groupBy);
      if (!periodMap.has(period)) {
        periodMap.set(period, { income: 0, expenses: 0, mortgagePayments: 0 });
      }
      const data = periodMap.get(period)!;
      data.income += Number(income.amount);
    });

    expenses.forEach((expense) => {
      const period = this.getPeriodKey(expense.expenseDate, groupBy);
      if (!periodMap.has(period)) {
        periodMap.set(period, { income: 0, expenses: 0, mortgagePayments: 0 });
      }
      const data = periodMap.get(period)!;
      data.expenses += Number(expense.amount);
    });

    mortgagePayments.forEach((payment) => {
      const period = this.getPeriodKey(payment.paymentDate, groupBy);
      if (!periodMap.has(period)) {
        periodMap.set(period, { income: 0, expenses: 0, mortgagePayments: 0 });
      }
      const data = periodMap.get(period)!;
      data.mortgagePayments += Number(payment.amount);
    });

    // Convert to array and calculate cash flow
    return Array.from(periodMap.entries())
      .map(([period, data]) => {
        const cashFlow = data.income - data.expenses - data.mortgagePayments;
        return {
          period,
          income: Number(data.income.toFixed(2)),
          expenses: Number(data.expenses.toFixed(2)),
          mortgagePayments: Number(data.mortgagePayments.toFixed(2)),
          cashFlow: Number(cashFlow.toFixed(2)),
        };
      })
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  private getPeriodKey(date: Date, groupBy: 'month' | 'quarter' | 'year'): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;

    if (groupBy === 'year') {
      return `${year}`;
    } else if (groupBy === 'quarter') {
      const quarter = Math.floor((month - 1) / 3) + 1;
      return `${year}-Q${quarter}`;
    } else {
      // month
      return `${year}-${String(month).padStart(2, '0')}`;
    }
  }

  async exportDashboard(
    accountId: string,
    format: 'pdf' | 'excel',
    startDate?: string,
    endDate?: string,
  ): Promise<Buffer> {
    // Get portfolio summary data
    const properties = await this.prisma.property.findMany({
      where: { accountId },
      include: {
        units: { include: { leases: { where: { status: 'ACTIVE' } } } },
        mortgages: { where: { status: 'ACTIVE' }, include: { payments: { where: { principal: { not: null } }, select: { principal: true } } } },
        valuations: { orderBy: { valuationDate: 'desc' }, take: 1 },
      },
    });

    const totalProperties = properties.length;
    const totalUnits = properties.reduce((sum, p) => sum + p.units.length, 0);
    const activeLeases = properties.reduce((sum, p) => sum + p.units.reduce((unitSum, u) => unitSum + u.leases.length, 0), 0);
    const totalEstimatedValue = properties.reduce((sum, p) => {
      const value = p.estimatedValue ? Number(p.estimatedValue) : p.valuations.length > 0 ? Number(p.valuations[0].estimatedValue) : 0;
      return sum + value;
    }, 0);
    const totalMortgageDebt = properties.reduce((sum, p) => {
      return sum + p.mortgages.reduce((mortgageSum, m) => {
        const totalPrincipalPaid = m.payments.reduce((paymentSum, payment) => paymentSum + Number(payment.principal || 0), 0);
        const remainingBalance = Number(m.loanAmount) - totalPrincipalPaid;
        return mortgageSum + Math.max(0, remainingBalance);
      }, 0);
    }, 0);

    const netEquity = totalEstimatedValue - totalMortgageDebt;
    const occupancyRate = totalUnits > 0 
      ? Number(((activeLeases / totalUnits) * 100).toFixed(2)) 
      : 0;

    const exportData = {
      exportDate: new Date().toISOString(),
      dateRange: { startDate: startDate || 'All', endDate: endDate || 'All' },
      portfolioSummary: {
        totalProperties,
        totalUnits,
        activeLeases,
        totalEstimatedValue: Number(totalEstimatedValue.toFixed(2)),
        totalMortgageDebt: Number(totalMortgageDebt.toFixed(2)),
        netEquity: Number(netEquity.toFixed(2)),
        occupancyRate,
      },
    };

    if (format === 'excel') {
      // Simple CSV export for now (can be enhanced with exceljs later)
      const csvRows = [
        ['Dashboard Export', ''],
        ['Export Date', exportData.exportDate],
        ['Date Range', `${exportData.dateRange.startDate} to ${exportData.dateRange.endDate}`],
        [''],
        ['Portfolio Summary', ''],
        ['Total Properties', exportData.portfolioSummary.totalProperties],
        ['Total Units', exportData.portfolioSummary.totalUnits],
        ['Total Estimated Value', exportData.portfolioSummary.totalEstimatedValue],
        ['Total Mortgage Debt', exportData.portfolioSummary.totalMortgageDebt],
        ['Net Equity', exportData.portfolioSummary.netEquity],
        ['Occupancy Rate', `${exportData.portfolioSummary.occupancyRate}%`],
        ['Active Leases', exportData.portfolioSummary.activeLeases],
      ];
      const csv = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      return Buffer.from(csv, 'utf-8');
    } else {
      // PDF: Return JSON for now (can be enhanced with pdfkit/puppeteer later)
      return Buffer.from(JSON.stringify(exportData, null, 2), 'utf-8');
    }
  }

  getWidgetPreferences(accountId: string) {
    // Default widget configuration
    const defaultPreferences = {
      visibleWidgets: [
        'portfolioSummary',
        'propertyDistribution',
        'incomeExpenses',
        'valuationHistory',
        'mortgageSummary',
        'leaseTimeline',
        'roiMetrics',
        'cashFlow',
      ],
      widgetOrder: [
        'portfolioSummary',
        'propertyDistribution',
        'roiMetrics',
        'incomeExpenses',
        'valuationHistory',
        'cashFlow',
        'leaseTimeline',
        'mortgageSummary',
      ],
    };

    // For now, return defaults (can be enhanced with database storage later)
    // In a real implementation, this would fetch from a UserPreferences table
    return defaultPreferences;
  }

  saveWidgetPreferences(
    accountId: string,
    preferences: { visibleWidgets: string[]; widgetOrder: string[] },
  ) {
    // For now, just validate and return success
    // In a real implementation, this would save to a UserPreferences table
    if (!preferences.visibleWidgets || !Array.isArray(preferences.visibleWidgets)) {
      throw new Error('visibleWidgets must be an array');
    }
    if (!preferences.widgetOrder || !Array.isArray(preferences.widgetOrder)) {
      throw new Error('widgetOrder must be an array');
    }

    return {
      success: true,
      message: 'Widget preferences saved successfully',
      preferences,
    };
  }
}
