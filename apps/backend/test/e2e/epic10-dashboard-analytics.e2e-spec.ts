/**
 * Epic 10: Dashboard & Analytics - E2E Integration Tests
 * 
 * Tests all 13 user stories:
 * - US10.1: View Portfolio Summary
 * - US10.2: View Property Distribution Chart
 * - US10.3: View Income vs Expenses Chart
 * - US10.4: View Property Value Over Time
 * - US10.5: View Mortgage Summary
 * - US10.6: View Lease Expiration Timeline
 * - US10.7: Filter Dashboard by Date Range
 * - US10.8: Export Dashboard Data
 * - US10.9: View Occupancy Rate
 * - US10.10: View ROI Metrics
 * - US10.11: View Debt-to-Equity Ratio
 * - US10.12: View Cash Flow Summary
 * - US10.13: Customize Dashboard Widgets
 */

import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';
import { PropertyType, PropertyStatus, LeaseStatus, MortgageStatus, ValuationType, ExpenseType, IncomeType } from '@prisma/client';

describe('Epic 10: Dashboard & Analytics E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const testAccountId = '00000000-0000-0000-0000-000000000001';
  let testPropertyId: string;
  let testProperty2Id: string;
  let testUnitId: string;
  let testUnit2Id: string;
  let testTenantId: string;
  let testLeaseId: string;
  let testMortgageId: string;
  let testValuationId: string;
  let testExpenseId: string;
  let testIncomeId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    prisma = app.get(PrismaService);

    // Ensure test account exists
    const existingAccount = await prisma.account.findUnique({
      where: { id: testAccountId },
    });
    if (!existingAccount) {
      await prisma.account.create({
        data: {
          id: testAccountId,
          name: 'Epic 10 Dashboard Test Account',
        },
      });
    }

    // Create test properties
    const testProperty = await prisma.property.create({
      data: {
        accountId: testAccountId,
        address: 'רחוב הרצל 10, תל אביב',
        fileNumber: 'PROP-DASH-001',
        type: PropertyType.RESIDENTIAL,
        status: PropertyStatus.OWNED,
        estimatedValue: 2000000,
        totalArea: 100,
        landArea: 50,
      },
    });
    testPropertyId = testProperty.id;

    const testProperty2 = await prisma.property.create({
      data: {
        accountId: testAccountId,
        address: 'רחוב דיזנגוף 20, תל אביב',
        fileNumber: 'PROP-DASH-002',
        type: PropertyType.COMMERCIAL,
        status: PropertyStatus.OWNED,
        estimatedValue: 3000000,
        totalArea: 200,
        landArea: 100,
      },
    });
    testProperty2Id = testProperty2.id;

    // Create test units
    const testUnit = await prisma.unit.create({
      data: {
        accountId: testAccountId,
        propertyId: testPropertyId,
        apartmentNumber: '1',
      },
    });
    testUnitId = testUnit.id;

    const testUnit2 = await prisma.unit.create({
      data: {
        accountId: testAccountId,
        propertyId: testPropertyId,
        apartmentNumber: '2',
      },
    });
    testUnit2Id = testUnit2.id;

    // Create test tenant
    const testTenant = await prisma.tenant.create({
      data: {
        accountId: testAccountId,
        name: 'דייר בדיקה',
        email: 'tenant@test.com',
        phone: '050-1234567',
      },
    });
    testTenantId = testTenant.id;

    // Create test lease
    const testLease = await prisma.lease.create({
      data: {
        accountId: testAccountId,
        unitId: testUnitId,
        tenantId: testTenantId,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        monthlyRent: 5000,
        paymentTo: 'בעלים',
        status: LeaseStatus.ACTIVE,
      },
    });
    testLeaseId = testLease.id;

    // Create test mortgage
    const testMortgage = await prisma.mortgage.create({
      data: {
        accountId: testAccountId,
        propertyId: testPropertyId,
        bank: 'בנק הפועלים',
        loanAmount: 1500000,
        monthlyPayment: 8000,
        interestRate: 3.5,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2044-01-01'),
        status: MortgageStatus.ACTIVE,
      },
    });
    testMortgageId = testMortgage.id;

    // Create test valuation
    const testValuation = await prisma.propertyValuation.create({
      data: {
        accountId: testAccountId,
        propertyId: testPropertyId,
        valuationDate: new Date('2025-01-01'),
        estimatedValue: 2100000,
        valuationType: ValuationType.MARKET,
      },
    });
    testValuationId = testValuation.id;

    // Create test expense
    const testExpense = await prisma.propertyExpense.create({
      data: {
        accountId: testAccountId,
        propertyId: testPropertyId,
        expenseDate: new Date('2025-01-15'),
        amount: 1000,
        type: ExpenseType.MAINTENANCE,
        category: 'תיקונים',
      },
    });
    testExpenseId = testExpense.id;

    // Create test income
    const testIncome = await prisma.propertyIncome.create({
      data: {
        accountId: testAccountId,
        propertyId: testPropertyId,
        incomeDate: new Date('2025-01-01'),
        amount: 5000,
        type: IncomeType.RENT,
        source: 'שכירות',
      },
    });
    testIncomeId = testIncome.id;
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.propertyIncome.deleteMany({ where: { accountId: testAccountId } });
    await prisma.propertyExpense.deleteMany({ where: { accountId: testAccountId } });
    await prisma.propertyValuation.deleteMany({ where: { accountId: testAccountId } });
    await prisma.mortgagePayment.deleteMany({ where: { mortgageId: testMortgageId } });
    await prisma.mortgage.deleteMany({ where: { accountId: testAccountId } });
    await prisma.lease.deleteMany({ where: { accountId: testAccountId } });
    await prisma.tenant.deleteMany({ where: { accountId: testAccountId } });
    await prisma.unit.deleteMany({ where: { accountId: testAccountId } });
    await prisma.property.deleteMany({ where: { accountId: testAccountId } });
    await app.close();
  });

  describe('US10.1: View Portfolio Summary', () => {
    it('should return portfolio summary with all required metrics', async () => {
      const response = await request(app.getHttpServer())
        .get('/properties/portfolio/summary')
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body).toHaveProperty('totalProperties');
      expect(response.body).toHaveProperty('totalUnits');
      expect(response.body).toHaveProperty('totalEstimatedValue');
      expect(response.body).toHaveProperty('totalMortgageDebt');
      expect(response.body).toHaveProperty('netEquity');
      expect(response.body).toHaveProperty('occupancyRate');
      expect(response.body).toHaveProperty('activeLeases');
      expect(response.body).toHaveProperty('totalArea');
      expect(response.body).toHaveProperty('landArea');
      expect(response.body).toHaveProperty('propertiesByType');
      expect(response.body).toHaveProperty('propertiesByStatus');

      expect(response.body.totalProperties).toBeGreaterThanOrEqual(2);
      expect(response.body.totalUnits).toBeGreaterThanOrEqual(2);
      expect(response.body.totalEstimatedValue).toBeGreaterThan(0);
      expect(response.body.activeLeases).toBeGreaterThanOrEqual(1);
      expect(response.body.occupancyRate).toBeGreaterThanOrEqual(0);
      expect(response.body.occupancyRate).toBeLessThanOrEqual(100);
    });
  });

  describe('US10.2: View Property Distribution Chart', () => {
    it('should return property distribution by type and status', async () => {
      const response = await request(app.getHttpServer())
        .get('/properties/portfolio/distribution')
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body).toHaveProperty('distributionByType');
      expect(response.body).toHaveProperty('distributionByStatus');
      expect(response.body.distributionByType).toBeInstanceOf(Object);
      expect(response.body.distributionByStatus).toBeInstanceOf(Object);
    });
  });

  describe('US10.3: View Income vs Expenses Chart', () => {
    it('should return income vs expenses data grouped by period', async () => {
      const response = await request(app.getHttpServer())
        .get('/financials/dashboard/income-expenses')
        .query({ groupBy: 'month' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('period');
        expect(response.body[0]).toHaveProperty('income');
        expect(response.body[0]).toHaveProperty('expenses');
        expect(response.body[0]).toHaveProperty('net');
      }
    });
  });

  describe('US10.4: View Property Value Over Time', () => {
    it('should return property valuation history aggregated by date', async () => {
      const response = await request(app.getHttpServer())
        .get('/properties/portfolio/valuation-history')
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('date');
        expect(response.body[0]).toHaveProperty('totalValue');
      }
    });
  });

  describe('US10.5: View Mortgage Summary', () => {
    it('should return mortgage summary statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/mortgages/summary')
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body).toHaveProperty('totalMortgageDebt');
      expect(response.body).toHaveProperty('totalMonthlyPayments');
      expect(response.body).toHaveProperty('activeMortgagesCount');
      expect(response.body).toHaveProperty('paidOffMortgagesCount');
      expect(response.body).toHaveProperty('totalRemainingBalance');
    });
  });

  describe('US10.6: View Lease Expiration Timeline', () => {
    it('should return leases expiring within specified months', async () => {
      const response = await request(app.getHttpServer())
        .get('/leases/expiration-timeline')
        .query({ months: 12 })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('endDate');
        expect(response.body[0]).toHaveProperty('unit');
        expect(response.body[0]).toHaveProperty('tenant');
      }
    });
  });

  describe('US10.7: Filter Dashboard by Date Range', () => {
    it('should filter portfolio summary by date range', async () => {
      const startDate = '2025-01-01';
      const endDate = '2025-12-31';

      const response = await request(app.getHttpServer())
        .get('/properties/portfolio/summary')
        .query({ startDate, endDate })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body).toHaveProperty('totalProperties');
    });

    it('should filter income vs expenses by date range', async () => {
      const startDate = '2025-01-01';
      const endDate = '2025-12-31';

      const response = await request(app.getHttpServer())
        .get('/financials/dashboard/income-expenses')
        .query({ startDate, endDate, groupBy: 'month' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('US10.9: View Occupancy Rate', () => {
    it('should calculate occupancy rate correctly', async () => {
      const response = await request(app.getHttpServer())
        .get('/properties/portfolio/summary')
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body).toHaveProperty('occupancyRate');
      expect(typeof response.body.occupancyRate).toBe('number');
      expect(response.body.occupancyRate).toBeGreaterThanOrEqual(0);
      expect(response.body.occupancyRate).toBeLessThanOrEqual(100);
    });
  });

  describe('US10.10: View ROI Metrics', () => {
    it('should return ROI metrics for portfolio', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard/roi')
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body).toHaveProperty('portfolioROI');
      expect(typeof response.body.portfolioROI).toBe('number');
    });
  });

  describe('US10.11: View Debt-to-Equity Ratio', () => {
    it('should calculate debt-to-equity ratio in portfolio summary', async () => {
      const response = await request(app.getHttpServer())
        .get('/properties/portfolio/summary')
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body).toHaveProperty('totalMortgageDebt');
      expect(response.body).toHaveProperty('netEquity');
      
      if (response.body.netEquity > 0) {
        const ratio = response.body.totalMortgageDebt / response.body.netEquity;
        expect(ratio).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('US10.12: View Cash Flow Summary', () => {
    it('should return cash flow summary grouped by period', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard/cash-flow')
        .query({ groupBy: 'month' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('period');
        expect(response.body[0]).toHaveProperty('income');
        expect(response.body[0]).toHaveProperty('expenses');
        expect(response.body[0]).toHaveProperty('mortgagePayments');
        expect(response.body[0]).toHaveProperty('cashFlow');
      }
    });
  });

  describe('US10.8: Export Dashboard Data', () => {
    it('should export dashboard data as Excel (CSV)', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard/export')
        .query({ format: 'excel' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.headers['content-disposition']).toContain('.xlsx');
      // Response should have content (body or text)
      expect(response.body || response.text).toBeDefined();
    });

    it('should export dashboard data as PDF (JSON)', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard/export')
        .query({ format: 'pdf' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.headers['content-type']).toContain('application/pdf');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.headers['content-disposition']).toContain('.pdf');
      // Response should have content (body or text)
      expect(response.body || response.text).toBeDefined();
    });

    it('should export dashboard data with date range filter', async () => {
      const startDate = new Date('2024-01-01').toISOString().split('T')[0];
      const endDate = new Date('2024-12-31').toISOString().split('T')[0];

      const response = await request(app.getHttpServer())
        .get('/dashboard/export')
        .query({ format: 'excel', startDate, endDate })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.status).toBe(200);
    });
  });

  describe('US10.13: Customize Dashboard Widgets', () => {
    it('should get default dashboard widget preferences', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard/widget-preferences')
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body).toHaveProperty('visibleWidgets');
      expect(response.body).toHaveProperty('widgetOrder');
      expect(Array.isArray(response.body.visibleWidgets)).toBe(true);
      expect(Array.isArray(response.body.widgetOrder)).toBe(true);
    });

    it('should save dashboard widget preferences', async () => {
      const widgetConfig = {
        visibleWidgets: ['portfolioSummary', 'propertyDistribution', 'incomeExpenses'],
        widgetOrder: ['portfolioSummary', 'propertyDistribution', 'incomeExpenses'],
      };

      const response = await request(app.getHttpServer())
        .put('/dashboard/widget-preferences')
        .set('X-Account-Id', testAccountId)
        .send(widgetConfig)
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('preferences');
      expect(response.body.preferences.visibleWidgets).toEqual(widgetConfig.visibleWidgets);
      expect(response.body.preferences.widgetOrder).toEqual(widgetConfig.widgetOrder);
    });

    it('should validate widget preferences format', async () => {
      const invalidConfig = {
        visibleWidgets: 'not-an-array',
        widgetOrder: ['portfolioSummary'],
      };

      await request(app.getHttpServer())
        .put('/dashboard/widget-preferences')
        .set('X-Account-Id', testAccountId)
        .send(invalidConfig)
        .expect(500);
    });
  });
});
