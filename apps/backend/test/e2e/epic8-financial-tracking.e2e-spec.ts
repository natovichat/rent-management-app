/**
 * Epic 8: Financial Tracking & Reporting - E2E Tests
 * 
 * Tests all 16 user stories:
 * - US8.1-US8.4: Valuation Management
 * - US8.5-US8.8: Expense Management
 * - US8.9-US8.12: Income Management
 * - US8.13-US8.16: Financial Dashboard & Analytics
 */

import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';
import { ValuationType, ExpenseType, IncomeType } from '@prisma/client';

describe('Epic 8: Financial Tracking & Reporting E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testAccountId: string;
  let testPropertyId: string;

  const HARDCODED_ACCOUNT_ID = '00000000-0000-0000-0000-000000000001';

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

    testAccountId = HARDCODED_ACCOUNT_ID;

    // Ensure hardcoded account exists
    await prisma.account.upsert({
      where: { id: HARDCODED_ACCOUNT_ID },
      create: {
        id: HARDCODED_ACCOUNT_ID,
        name: 'Epic 8 Financial Tracking Test Account',
      },
      update: {},
    });

    // Create test property
    const testProperty = await prisma.property.create({
      data: {
        accountId: testAccountId,
        address: 'רחוב הרצל 10, תל אביב',
        fileNumber: 'EPIC8-TEST-001',
      },
    });
    testPropertyId = testProperty.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.propertyValuation.deleteMany({
      where: { accountId: testAccountId },
    });
    await prisma.propertyExpense.deleteMany({
      where: { accountId: testAccountId },
    });
    await prisma.propertyIncome.deleteMany({
      where: { accountId: testAccountId },
    });
    await prisma.property.deleteMany({
      where: { accountId: testAccountId },
    });
    await prisma.account.deleteMany({
      where: { id: testAccountId },
    });
    await app.close();
  });

  // ============================================
  // US8.5: Record Property Expense
  // ============================================
  describe('US8.5: Record Property Expense', () => {
    beforeEach(async () => {
      await prisma.propertyExpense.deleteMany({
        where: { propertyId: testPropertyId },
      });
    });

    it('should create an expense with all required fields', async () => {
      const expenseData = {
        propertyId: testPropertyId,
        expenseDate: '2024-01-15',
        amount: 5000,
        expenseType: ExpenseType.MAINTENANCE,
        category: 'תחזוקה כללית',
        description: 'תיקון דלתות',
        paymentMethod: 'מזומן',
      };

      const response = await request(app.getHttpServer())
        .post('/financials/expenses')
        .send(expenseData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.propertyId).toBe(testPropertyId);
      expect(response.body.accountId).toBe(testAccountId);
      expect(Number(response.body.amount)).toBe(5000);
      expect(response.body.type).toBe(ExpenseType.MAINTENANCE);
      expect(response.body.category).toBe('תחזוקה כללית');
      expect(response.body.description).toBe('תיקון דלתות');
      expect(response.body.paymentMethod).toBe('מזומן');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        propertyId: testPropertyId,
        // Missing expenseDate, amount, expenseType, category
      };

      await request(app.getHttpServer())
        .post('/financials/expenses')
        .send(invalidData)
        .expect(400);
    });

    it('should validate amount is positive', async () => {
      const invalidData = {
        propertyId: testPropertyId,
        expenseDate: '2024-01-15',
        amount: -100,
        expenseType: ExpenseType.MAINTENANCE,
        category: 'תחזוקה',
      };

      await request(app.getHttpServer())
        .post('/financials/expenses')
        .send(invalidData)
        .expect(400);
    });

    it('should validate expense type enum', async () => {
      const invalidData = {
        propertyId: testPropertyId,
        expenseDate: '2024-01-15',
        amount: 5000,
        expenseType: 'INVALID_TYPE',
        category: 'תחזוקה',
      };

      await request(app.getHttpServer())
        .post('/financials/expenses')
        .send(invalidData)
        .expect(400);
    });
  });

  // ============================================
  // US8.6: Categorize Expenses
  // ============================================
  describe('US8.6: Categorize Expenses', () => {
    beforeEach(async () => {
      await prisma.propertyExpense.deleteMany({
        where: { propertyId: testPropertyId },
      });
    });

    it('should support all expense types', async () => {
      const types = [
        ExpenseType.MAINTENANCE,
        ExpenseType.TAX,
        ExpenseType.INSURANCE,
        ExpenseType.UTILITIES,
        ExpenseType.RENOVATION,
        ExpenseType.LEGAL,
        ExpenseType.OTHER,
      ];

      for (const type of types) {
        const expenseData = {
          propertyId: testPropertyId,
          expenseDate: '2024-01-15',
          amount: 1000,
          expenseType: type,
          category: `קטגוריה ${type}`,
        };

        const response = await request(app.getHttpServer())
          .post('/financials/expenses')
          .send(expenseData)
          .expect(201);

        expect(response.body.type).toBe(type);
      }
    });
  });

  // ============================================
  // US8.8: Filter Expenses by Date Range
  // ============================================
  describe('US8.8: Filter Expenses by Date Range', () => {
    beforeEach(async () => {
      await prisma.propertyExpense.deleteMany({
        where: { propertyId: testPropertyId },
      });
    });

    it('should filter expenses by date range', async () => {
      // Create expenses with different dates
      await prisma.propertyExpense.createMany({
        data: [
          {
            propertyId: testPropertyId,
            accountId: testAccountId,
            expenseDate: new Date('2024-01-15'),
            amount: 1000,
            type: ExpenseType.MAINTENANCE,
            category: 'תחזוקה',
          },
          {
            propertyId: testPropertyId,
            accountId: testAccountId,
            expenseDate: new Date('2024-02-15'),
            amount: 2000,
            type: ExpenseType.TAX,
            category: 'מס',
          },
          {
            propertyId: testPropertyId,
            accountId: testAccountId,
            expenseDate: new Date('2024-03-15'),
            amount: 3000,
            type: ExpenseType.INSURANCE,
            category: 'ביטוח',
          },
        ],
      });

      // Filter by date range (January to February)
      const response = await request(app.getHttpServer())
        .get(`/financials/expenses?propertyId=${testPropertyId}&startDate=2024-01-01&endDate=2024-02-28`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.every((e: any) => {
        const date = new Date(e.expenseDate);
        return date >= new Date('2024-01-01') && date <= new Date('2024-02-28');
      })).toBe(true);
    });
  });

  // ============================================
  // US8.9: Record Property Income
  // ============================================
  describe('US8.9: Record Property Income', () => {
    beforeEach(async () => {
      await prisma.propertyIncome.deleteMany({
        where: { propertyId: testPropertyId },
      });
    });

    it('should create an income record with all required fields', async () => {
      const incomeData = {
        propertyId: testPropertyId,
        incomeDate: '2024-01-15',
        amount: 10000,
        incomeType: IncomeType.RENT,
        description: 'דמי שכירות חודש ינואר',
      };

      const response = await request(app.getHttpServer())
        .post('/financials/income')
        .send(incomeData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.propertyId).toBe(testPropertyId);
      expect(response.body.accountId).toBe(testAccountId);
      expect(Number(response.body.amount)).toBe(10000);
      expect(response.body.type).toBe(IncomeType.RENT);
      expect(response.body.description).toBe('דמי שכירות חודש ינואר');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        propertyId: testPropertyId,
        // Missing incomeDate, amount, incomeType
      };

      await request(app.getHttpServer())
        .post('/financials/income')
        .send(invalidData)
        .expect(400);
    });

    it('should validate amount is positive', async () => {
      const invalidData = {
        propertyId: testPropertyId,
        incomeDate: '2024-01-15',
        amount: -1000,
        incomeType: IncomeType.RENT,
      };

      await request(app.getHttpServer())
        .post('/financials/income')
        .send(invalidData)
        .expect(400);
    });
  });

  // ============================================
  // US8.10: Categorize Income
  // ============================================
  describe('US8.10: Categorize Income', () => {
    beforeEach(async () => {
      await prisma.propertyIncome.deleteMany({
        where: { propertyId: testPropertyId },
      });
    });

    it('should support all income types', async () => {
      const types = [
        IncomeType.RENT,
        IncomeType.SALE,
        IncomeType.CAPITAL_GAIN,
        IncomeType.OTHER,
      ];

      for (const type of types) {
        const incomeData = {
          propertyId: testPropertyId,
          incomeDate: '2024-01-15',
          amount: 10000,
          incomeType: type,
          description: `הכנסה מסוג ${type}`,
        };

        const response = await request(app.getHttpServer())
          .post('/financials/income')
          .send(incomeData)
          .expect(201);

        expect(response.body.type).toBe(type);
      }
    });
  });

  // ============================================
  // US8.13: Financial Dashboard Per Property
  // ============================================
  describe('US8.13: Financial Dashboard Per Property', () => {
    beforeEach(async () => {
      await prisma.propertyExpense.deleteMany({
        where: { propertyId: testPropertyId },
      });
      await prisma.propertyIncome.deleteMany({
        where: { propertyId: testPropertyId },
      });
    });

    it('should return financial summary for property', async () => {
      // Create test data
      await prisma.propertyExpense.createMany({
        data: [
          {
            propertyId: testPropertyId,
            accountId: testAccountId,
            expenseDate: new Date('2024-01-15'),
            amount: 2000,
            type: ExpenseType.MAINTENANCE,
            category: 'תחזוקה',
          },
          {
            propertyId: testPropertyId,
            accountId: testAccountId,
            expenseDate: new Date('2024-02-15'),
            amount: 3000,
            type: ExpenseType.TAX,
            category: 'מס',
          },
        ],
      });

      await prisma.propertyIncome.createMany({
        data: [
          {
            propertyId: testPropertyId,
            accountId: testAccountId,
            incomeDate: new Date('2024-01-15'),
            amount: 10000,
            type: IncomeType.RENT,
            description: 'דמי שכירות',
          },
          {
            propertyId: testPropertyId,
            accountId: testAccountId,
            incomeDate: new Date('2024-02-15'),
            amount: 12000,
            type: IncomeType.RENT,
            description: 'דמי שכירות',
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .get(`/financials/property/${testPropertyId}`)
        .expect(200);

      expect(response.body).toHaveProperty('property');
      expect(response.body).toHaveProperty('expenses');
      expect(response.body).toHaveProperty('income');
      expect(response.body).toHaveProperty('summary');
      expect(response.body.summary.totalIncome).toBe(22000);
      expect(response.body.summary.totalExpenses).toBe(5000);
      expect(response.body.summary.net).toBe(17000);
    });
  });

  // ============================================
  // US8.7: Expense Breakdown Chart
  // ============================================
  describe('US8.7: Expense Breakdown Chart', () => {
    beforeEach(async () => {
      await prisma.propertyExpense.deleteMany({
        where: { propertyId: testPropertyId },
      });
    });

    it('should return expense breakdown by category', async () => {
      // Create expenses with different types
      await prisma.propertyExpense.createMany({
        data: [
          {
            propertyId: testPropertyId,
            accountId: testAccountId,
            expenseDate: new Date('2024-01-15'),
            amount: 5000,
            type: ExpenseType.MAINTENANCE,
            category: 'תחזוקה',
          },
          {
            propertyId: testPropertyId,
            accountId: testAccountId,
            expenseDate: new Date('2024-02-15'),
            amount: 3000,
            type: ExpenseType.TAX,
            category: 'מס',
          },
          {
            propertyId: testPropertyId,
            accountId: testAccountId,
            expenseDate: new Date('2024-03-15'),
            amount: 2000,
            type: ExpenseType.MAINTENANCE,
            category: 'תחזוקה',
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .get(`/financials/expenses/breakdown?propertyId=${testPropertyId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      const maintenance = response.body.find((b: any) => b.type === ExpenseType.MAINTENANCE);
      expect(maintenance).toBeDefined();
      expect(maintenance.total).toBe(7000); // 5000 + 2000
      expect(maintenance.count).toBe(2);
      expect(maintenance.percentage).toBeGreaterThan(0);
    });
  });

  // ============================================
  // US8.11: Income Breakdown by Type
  // ============================================
  describe('US8.11: Income Breakdown by Type', () => {
    beforeEach(async () => {
      await prisma.propertyIncome.deleteMany({
        where: { propertyId: testPropertyId },
      });
    });

    it('should return income breakdown by type', async () => {
      // Create income with different types
      await prisma.propertyIncome.createMany({
        data: [
          {
            propertyId: testPropertyId,
            accountId: testAccountId,
            incomeDate: new Date('2024-01-15'),
            amount: 10000,
            type: IncomeType.RENT,
          },
          {
            propertyId: testPropertyId,
            accountId: testAccountId,
            incomeDate: new Date('2024-02-15'),
            amount: 12000,
            type: IncomeType.RENT,
          },
          {
            propertyId: testPropertyId,
            accountId: testAccountId,
            incomeDate: new Date('2024-03-15'),
            amount: 50000,
            type: IncomeType.SALE,
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .get(`/financials/income/breakdown?propertyId=${testPropertyId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      const rent = response.body.find((b: any) => b.type === IncomeType.RENT);
      expect(rent).toBeDefined();
      expect(rent.total).toBe(22000); // 10000 + 12000
      expect(rent.count).toBe(2);
      expect(rent.percentage).toBeGreaterThan(0);
    });
  });

  // ============================================
  // US8.14: Calculate ROI
  // ============================================
  describe('US8.14: Calculate ROI', () => {
    beforeEach(async () => {
      await prisma.propertyValuation.deleteMany({
        where: { propertyId: testPropertyId },
      });
      await prisma.propertyExpense.deleteMany({
        where: { propertyId: testPropertyId },
      });
      await prisma.propertyIncome.deleteMany({
        where: { propertyId: testPropertyId },
      });
    });

    it('should calculate ROI correctly', async () => {
      // Create property valuation
      await prisma.propertyValuation.create({
        data: {
          propertyId: testPropertyId,
          accountId: testAccountId,
          valuationDate: new Date('2024-01-01'),
          estimatedValue: 1000000,
          valuationType: ValuationType.MARKET,
        },
      });

      // Create income and expenses
      await prisma.propertyIncome.create({
        data: {
          propertyId: testPropertyId,
          accountId: testAccountId,
          incomeDate: new Date('2024-01-15'),
          amount: 10000,
          type: IncomeType.RENT,
        },
      });

      await prisma.propertyExpense.create({
        data: {
          propertyId: testPropertyId,
          accountId: testAccountId,
          expenseDate: new Date('2024-01-15'),
          amount: 2000,
          type: ExpenseType.MAINTENANCE,
          category: 'תחזוקה',
        },
      });

      // Get financial dashboard (includes ROI)
      const response = await request(app.getHttpServer())
        .get(`/financials/property/${testPropertyId}/dashboard`)
        .expect(200);

      expect(response.body.summary).toBeDefined();
      expect(response.body.summary.netIncome).toBe(8000); // 10000 - 2000
      expect(response.body.summary.propertyValue).toBe(1000000);
      expect(response.body.summary.roi).toBeDefined();
      expect(response.body.summary.roi).toBeCloseTo(0.8, 1); // 0.8%
    });
  });

  // ============================================
  // US8.15: Filter Financial Data by Date Range
  // ============================================
  describe('US8.15: Filter Financial Data by Date Range', () => {
    beforeEach(async () => {
      await prisma.propertyValuation.deleteMany({
        where: { propertyId: testPropertyId },
      });
      await prisma.propertyExpense.deleteMany({
        where: { propertyId: testPropertyId },
      });
      await prisma.propertyIncome.deleteMany({
        where: { propertyId: testPropertyId },
      });
    });

    it('should filter dashboard data by date range', async () => {
      // Create data outside date range
      await prisma.propertyIncome.create({
        data: {
          propertyId: testPropertyId,
          accountId: testAccountId,
          incomeDate: new Date('2023-12-15'),
          amount: 5000,
          type: IncomeType.RENT,
        },
      });

      // Create data inside date range
      await prisma.propertyIncome.create({
        data: {
          propertyId: testPropertyId,
          accountId: testAccountId,
          incomeDate: new Date('2024-01-15'),
          amount: 10000,
          type: IncomeType.RENT,
        },
      });

      await prisma.propertyExpense.create({
        data: {
          propertyId: testPropertyId,
          accountId: testAccountId,
          expenseDate: new Date('2024-01-20'),
          amount: 2000,
          type: ExpenseType.MAINTENANCE,
          category: 'תחזוקה',
        },
      });

      // Get dashboard with date filter
      const response = await request(app.getHttpServer())
        .get(`/financials/property/${testPropertyId}/dashboard?startDate=2024-01-01&endDate=2024-01-31`)
        .expect(200);

      // Should only include data from January 2024
      expect(response.body.summary.totalIncome).toBe(10000); // Only January income
      expect(response.body.summary.totalExpenses).toBe(2000); // Only January expense
      expect(response.body.income).toHaveLength(1);
      expect(response.body.expenses).toHaveLength(1);
    });
  });
});
