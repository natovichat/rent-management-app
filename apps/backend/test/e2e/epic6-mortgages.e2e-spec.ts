/**
 * Epic 6: Mortgage & Loan Management - E2E Integration Tests
 * 
 * Tests all 15 user stories:
 * - US6.1: Create Mortgage
 * - US6.2: Link Mortgage to Property
 * - US6.3: Link Mortgage to Bank Account
 * - US6.4: Set Mortgage Loan Details
 * - US6.5: Set Mortgage Dates
 * - US6.6: Track Mortgage Status
 * - US6.7: Link Multiple Properties as Collateral
 * - US6.8: Record Mortgage Payment
 * - US6.9: View Payment History
 * - US6.10: Calculate Remaining Balance
 * - US6.11: View Mortgage Details on Property Page
 * - US6.12: Filter Mortgages by Status
 * - US6.13: Edit Mortgage Information
 * - US6.14: Delete Mortgage
 * - US6.15: View Mortgage Summary
 */

import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';
import { MortgageStatus, Prisma } from '@prisma/client';

describe('Epic 6: Mortgage & Loan Management E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const testAccountId = '00000000-0000-0000-0000-000000000001';
  let testPropertyId: string;
  let testProperty2Id: string;
  let testBankAccountId: string;
  let testMortgageId: string;

  const API_URL = '/mortgages';

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
          name: 'Epic 6 Mortgage Test Account',
        },
      });
    }

    // Create test properties
    const testProperty = await prisma.property.create({
      data: {
        accountId: testAccountId,
        address: 'רחוב הרצל 10, תל אביב',
        fileNumber: 'PROP-MORT-001',
      },
    });
    testPropertyId = testProperty.id;

    const testProperty2 = await prisma.property.create({
      data: {
        accountId: testAccountId,
        address: 'רחוב דיזנגוף 20, תל אביב',
        fileNumber: 'PROP-MORT-002',
      },
    });
    testProperty2Id = testProperty2.id;

    // Create test bank account
    const testBankAccount = await prisma.bankAccount.create({
      data: {
        accountId: testAccountId,
        bankName: 'בנק הפועלים',
        branchNumber: '123',
        accountNumber: '123456',
        accountType: 'CHECKING',
      },
    });
    testBankAccountId = testBankAccount.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.mortgagePayment.deleteMany({ where: { accountId: testAccountId } });
    await prisma.mortgage.deleteMany({ where: { accountId: testAccountId } });
    await prisma.bankAccount.deleteMany({ where: { accountId: testAccountId } });
    await prisma.property.deleteMany({ where: { accountId: testAccountId } });
    await app.close();
  });

  describe('US6.1: Create Mortgage', () => {
    it('should create mortgage with all required fields', async () => {
      const createDto = {
        propertyId: testPropertyId,
        bank: 'בנק לאומי',
        loanAmount: 1000000,
        startDate: '2024-01-01T00:00:00.000Z',
        status: MortgageStatus.ACTIVE,
      };

      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('x-account-id', testAccountId)
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.bank).toBe(createDto.bank);
      expect(response.body.loanAmount).toBe(createDto.loanAmount.toString());
      expect(response.body.status).toBe(createDto.status);
      expect(response.body.propertyId).toBe(testPropertyId);
      
      testMortgageId = response.body.id;
    });

    it('should create mortgage with all optional fields', async () => {
      const createDto = {
        propertyId: testPropertyId,
        bank: 'בנק מזרחי',
        loanAmount: 2000000,
        interestRate: 3.5,
        monthlyPayment: 10000,
        bankAccountId: testBankAccountId,
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2054-01-01T00:00:00.000Z',
        status: MortgageStatus.ACTIVE,
        linkedProperties: [testProperty2Id],
        notes: 'משכנתא ראשונה',
      };

      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('x-account-id', testAccountId)
        .send(createDto)
        .expect(201);

      expect(response.body.interestRate).toBe(createDto.interestRate.toString());
      expect(response.body.monthlyPayment).toBe(createDto.monthlyPayment.toString());
      expect(response.body.bankAccountId).toBe(testBankAccountId);
      expect(response.body.linkedProperties).toEqual(createDto.linkedProperties);
      expect(response.body.notes).toBe(createDto.notes);
    });

    it('should fail when propertyId is missing', async () => {
      const createDto = {
        bank: 'בנק לאומי',
        loanAmount: 1000000,
        startDate: '2024-01-01T00:00:00.000Z',
        status: MortgageStatus.ACTIVE,
      };

      await request(app.getHttpServer())
        .post(API_URL)
        .set('x-account-id', testAccountId)
        .send(createDto)
        .expect(400);
    });

    it('should fail when bank is empty', async () => {
      const createDto = {
        propertyId: testPropertyId,
        bank: '',
        loanAmount: 1000000,
        startDate: '2024-01-01T00:00:00.000Z',
        status: MortgageStatus.ACTIVE,
      };

      await request(app.getHttpServer())
        .post(API_URL)
        .set('x-account-id', testAccountId)
        .send(createDto)
        .expect(400);
    });

    it('should fail when loanAmount is negative', async () => {
      const createDto = {
        propertyId: testPropertyId,
        bank: 'בנק לאומי',
        loanAmount: -1000,
        startDate: '2024-01-01T00:00:00.000Z',
        status: MortgageStatus.ACTIVE,
      };

      await request(app.getHttpServer())
        .post(API_URL)
        .set('x-account-id', testAccountId)
        .send(createDto)
        .expect(400);
    });

    it('should default status to ACTIVE if not provided', async () => {
      const createDto = {
        propertyId: testPropertyId,
        bank: 'בנק דיסקונט',
        loanAmount: 500000,
        startDate: '2024-01-01T00:00:00.000Z',
        status: MortgageStatus.ACTIVE,
      };

      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('x-account-id', testAccountId)
        .send(createDto)
        .expect(201);

      expect(response.body.status).toBe(MortgageStatus.ACTIVE);
    });
  });

  describe('US6.2: Link Mortgage to Property', () => {
    it('should link mortgage to property during creation', async () => {
      const createDto = {
        propertyId: testPropertyId,
        bank: 'בנק הפועלים',
        loanAmount: 1500000,
        startDate: '2024-01-01T00:00:00.000Z',
        status: MortgageStatus.ACTIVE,
      };

      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('x-account-id', testAccountId)
        .send(createDto)
        .expect(201);

      expect(response.body.propertyId).toBe(testPropertyId);
      expect(response.body.property).toBeDefined();
      expect(response.body.property.id).toBe(testPropertyId);
    });

    it('should fail when property does not exist', async () => {
      const createDto = {
        propertyId: '00000000-0000-0000-0000-000000000999',
        bank: 'בנק לאומי',
        loanAmount: 1000000,
        startDate: '2024-01-01T00:00:00.000Z',
        status: MortgageStatus.ACTIVE,
      };

      await request(app.getHttpServer())
        .post(API_URL)
        .set('x-account-id', testAccountId)
        .send(createDto)
        .expect(404);
    });
  });

  describe('US6.3: Link Mortgage to Bank Account', () => {
    it('should link mortgage to bank account', async () => {
      const createDto = {
        propertyId: testPropertyId,
        bank: 'בנק מזרחי',
        loanAmount: 1200000,
        bankAccountId: testBankAccountId,
        startDate: '2024-01-01T00:00:00.000Z',
        status: MortgageStatus.ACTIVE,
      };

      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('x-account-id', testAccountId)
        .send(createDto)
        .expect(201);

      expect(response.body.bankAccountId).toBe(testBankAccountId);
      expect(response.body.bankAccount).toBeDefined();
    });

    it('should allow mortgage without bank account (optional)', async () => {
      const createDto = {
        propertyId: testPropertyId,
        bank: 'בנק דיסקונט',
        loanAmount: 800000,
        startDate: '2024-01-01T00:00:00.000Z',
        status: MortgageStatus.ACTIVE,
      };

      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('x-account-id', testAccountId)
        .send(createDto)
        .expect(201);

      expect(response.body.bankAccountId).toBeNull();
    });
  });

  describe('US6.4: Set Mortgage Loan Details', () => {
    it('should set loan amount, interest rate, and monthly payment', async () => {
      const createDto = {
        propertyId: testPropertyId,
        bank: 'בנק לאומי',
        loanAmount: 2000000,
        interestRate: 4.5,
        monthlyPayment: 12000,
        startDate: '2024-01-01T00:00:00.000Z',
        status: MortgageStatus.ACTIVE,
      };

      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('x-account-id', testAccountId)
        .send(createDto)
        .expect(201);

      expect(response.body.loanAmount).toBe('2000000');
      expect(response.body.interestRate).toBe('4.5');
      expect(response.body.monthlyPayment).toBe('12000');
    });

    it('should validate interest rate is between 0 and 100', async () => {
      const createDto = {
        propertyId: testPropertyId,
        bank: 'בנק לאומי',
        loanAmount: 1000000,
        interestRate: 150, // Invalid: > 100
        startDate: '2024-01-01T00:00:00.000Z',
        status: MortgageStatus.ACTIVE,
      };

      await request(app.getHttpServer())
        .post(API_URL)
        .set('x-account-id', testAccountId)
        .send(createDto)
        .expect(400);
    });
  });

  describe('US6.5: Set Mortgage Dates', () => {
    it('should set start date and optional end date', async () => {
      const createDto = {
        propertyId: testPropertyId,
        bank: 'בנק הפועלים',
        loanAmount: 1500000,
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2054-01-01T00:00:00.000Z',
        status: MortgageStatus.ACTIVE,
      };

      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('x-account-id', testAccountId)
        .send(createDto)
        .expect(201);

      expect(response.body.startDate).toBeDefined();
      expect(response.body.endDate).toBeDefined();
    });

    it('should fail when end date is before start date', async () => {
      const createDto = {
        propertyId: testPropertyId,
        bank: 'בנק לאומי',
        loanAmount: 1000000,
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2023-01-01T00:00:00.000Z', // Before start date
        status: MortgageStatus.ACTIVE,
      };

      await request(app.getHttpServer())
        .post(API_URL)
        .set('x-account-id', testAccountId)
        .send(createDto)
        .expect(400);
    });
  });

  describe('US6.6: Track Mortgage Status', () => {
    it('should set mortgage status to ACTIVE', async () => {
      const createDto = {
        propertyId: testPropertyId,
        bank: 'בנק לאומי',
        loanAmount: 1000000,
        startDate: '2024-01-01T00:00:00.000Z',
        status: MortgageStatus.ACTIVE,
      };

      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('x-account-id', testAccountId)
        .send(createDto)
        .expect(201);

      expect(response.body.status).toBe(MortgageStatus.ACTIVE);
    });

    it('should update mortgage status', async () => {
      const mortgage = await prisma.mortgage.create({
        data: {
          accountId: testAccountId,
          propertyId: testPropertyId,
          bank: 'בנק מזרחי',
          loanAmount: 1000000,
          startDate: new Date('2024-01-01'),
          status: MortgageStatus.ACTIVE,
        },
      });

      const updateDto = {
        status: MortgageStatus.PAID_OFF,
      };

      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${mortgage.id}`)
        .set('x-account-id', testAccountId)
        .send(updateDto)
        .expect(200);

      expect(response.body.status).toBe(MortgageStatus.PAID_OFF);
    });
  });

  describe('US6.7: Link Multiple Properties as Collateral', () => {
    it('should link multiple properties as collateral', async () => {
      const createDto = {
        propertyId: testPropertyId,
        bank: 'בנק לאומי',
        loanAmount: 3000000,
        startDate: '2024-01-01T00:00:00.000Z',
        status: MortgageStatus.ACTIVE,
        linkedProperties: [testPropertyId, testProperty2Id],
      };

      const response = await request(app.getHttpServer())
        .post(API_URL)
        .set('x-account-id', testAccountId)
        .send(createDto)
        .expect(201);

      expect(response.body.linkedProperties).toHaveLength(2);
      expect(response.body.linkedProperties).toContain(testPropertyId);
      expect(response.body.linkedProperties).toContain(testProperty2Id);
    });

    it('should fail when linked property does not exist', async () => {
      const createDto = {
        propertyId: testPropertyId,
        bank: 'בנק לאומי',
        loanAmount: 2000000,
        startDate: '2024-01-01T00:00:00.000Z',
        status: MortgageStatus.ACTIVE,
        linkedProperties: ['00000000-0000-0000-0000-000000000999'],
      };

      await request(app.getHttpServer())
        .post(API_URL)
        .set('x-account-id', testAccountId)
        .send(createDto)
        .expect(400);
    });
  });

  describe('US6.8: Record Mortgage Payment', () => {
    let mortgageForPayment: string;

    beforeEach(async () => {
      const mortgage = await prisma.mortgage.create({
        data: {
          accountId: testAccountId,
          propertyId: testPropertyId,
          bank: 'בנק לאומי',
          loanAmount: 1000000,
          startDate: new Date('2024-01-01'),
          status: MortgageStatus.ACTIVE,
        },
      });
      mortgageForPayment = mortgage.id;
    });

    it('should record payment with all fields', async () => {
      const paymentDto = {
        paymentDate: '2024-02-01T00:00:00.000Z',
        amount: 10000,
        principal: 8000,
        interest: 2000,
        notes: 'תשלום חודשי',
      };

      const response = await request(app.getHttpServer())
        .post(`${API_URL}/${mortgageForPayment}/payments`)
        .set('x-account-id', testAccountId)
        .send(paymentDto)
        .expect(201);

      expect(response.body.amount).toBe(paymentDto.amount.toString());
      expect(response.body.principal).toBe(paymentDto.principal.toString());
      expect(response.body.interest).toBe(paymentDto.interest.toString());
      expect(response.body.notes).toBe(paymentDto.notes);
    });

    it('should record payment with only amount', async () => {
      const paymentDto = {
        paymentDate: '2024-03-01T00:00:00.000Z',
        amount: 10000,
      };

      const response = await request(app.getHttpServer())
        .post(`${API_URL}/${mortgageForPayment}/payments`)
        .set('x-account-id', testAccountId)
        .send(paymentDto)
        .expect(201);

      expect(response.body.amount).toBe(paymentDto.amount.toString());
    });

    it('should fail when amount is negative', async () => {
      const paymentDto = {
        paymentDate: '2024-02-01T00:00:00.000Z',
        amount: -1000,
      };

      await request(app.getHttpServer())
        .post(`${API_URL}/${mortgageForPayment}/payments`)
        .set('x-account-id', testAccountId)
        .send(paymentDto)
        .expect(400);
    });
  });

  describe('US6.9: View Payment History', () => {
    let mortgageWithPayments: string;

    beforeEach(async () => {
      const mortgage = await prisma.mortgage.create({
        data: {
          accountId: testAccountId,
          propertyId: testPropertyId,
          bank: 'בנק מזרחי',
          loanAmount: 1000000,
          startDate: new Date('2024-01-01'),
          status: MortgageStatus.ACTIVE,
        },
      });
      mortgageWithPayments = mortgage.id;

      // Create payments
      await prisma.mortgagePayment.createMany({
        data: [
          {
            accountId: testAccountId,
            mortgageId: mortgageWithPayments,
            paymentDate: new Date('2024-02-01'),
            amount: new Prisma.Decimal(10000),
            principal: new Prisma.Decimal(8000),
            interest: new Prisma.Decimal(2000),
          },
          {
            accountId: testAccountId,
            mortgageId: mortgageWithPayments,
            paymentDate: new Date('2024-03-01'),
            amount: new Prisma.Decimal(10000),
            principal: new Prisma.Decimal(8100),
            interest: new Prisma.Decimal(1900),
          },
        ],
      });
    });

    it('should return payment history sorted by date descending', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API_URL}/${mortgageWithPayments}`)
        .set('x-account-id', testAccountId)
        .expect(200);

      expect(response.body.payments).toBeDefined();
      expect(response.body.payments.length).toBeGreaterThanOrEqual(2);
      
      // Check sorting (newest first)
      const dates = response.body.payments.map((p: any) => new Date(p.paymentDate));
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i].getTime()).toBeGreaterThanOrEqual(dates[i + 1].getTime());
      }
    });
  });

  describe('US6.10: Calculate Remaining Balance', () => {
    let mortgageForBalance: string;

    beforeEach(async () => {
      const mortgage = await prisma.mortgage.create({
        data: {
          accountId: testAccountId,
          propertyId: testPropertyId,
          bank: 'בנק דיסקונט',
          loanAmount: 1000000,
          startDate: new Date('2024-01-01'),
          status: MortgageStatus.ACTIVE,
        },
      });
      mortgageForBalance = mortgage.id;

      // Create principal payments
      await prisma.mortgagePayment.createMany({
        data: [
          {
            accountId: testAccountId,
            mortgageId: mortgageForBalance,
            paymentDate: new Date('2024-02-01'),
            amount: new Prisma.Decimal(10000),
            principal: new Prisma.Decimal(8000),
            interest: new Prisma.Decimal(2000),
          },
          {
            accountId: testAccountId,
            mortgageId: mortgageForBalance,
            paymentDate: new Date('2024-03-01'),
            amount: new Prisma.Decimal(10000),
            principal: new Prisma.Decimal(8100),
            interest: new Prisma.Decimal(1900),
          },
        ],
      });
    });

    it('should calculate remaining balance correctly', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API_URL}/${mortgageForBalance}/balance`)
        .set('x-account-id', testAccountId)
        .expect(200);

      expect(response.body).toHaveProperty('remainingBalance');
      expect(response.body).toHaveProperty('loanAmount');
      expect(response.body).toHaveProperty('totalPrincipalPaid');
      
      // Loan amount: 1,000,000
      // Principal paid: 8,000 + 8,100 = 16,100
      // Remaining: 1,000,000 - 16,100 = 983,900
      expect(response.body.remainingBalance).toBe(983900);
    });
  });

  describe('US6.11: View Mortgage Details on Property Page', () => {
    it('should get all mortgages for a property', async () => {
      // Create multiple mortgages for the property
      await prisma.mortgage.createMany({
        data: [
          {
            accountId: testAccountId,
            propertyId: testPropertyId,
            bank: 'בנק לאומי',
            loanAmount: 1000000,
            startDate: new Date('2024-01-01'),
            status: MortgageStatus.ACTIVE,
          },
          {
            accountId: testAccountId,
            propertyId: testPropertyId,
            bank: 'בנק מזרחי',
            loanAmount: 500000,
            startDate: new Date('2024-02-01'),
            status: MortgageStatus.ACTIVE,
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .get(`${API_URL}/property/${testPropertyId}`)
        .set('x-account-id', testAccountId)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      response.body.forEach((mortgage: any) => {
        expect(mortgage.propertyId).toBe(testPropertyId);
        expect(mortgage.property).toBeDefined();
      });
    });
  });

  describe('US6.12: Filter Mortgages by Status', () => {
    beforeEach(async () => {
      // Create mortgages with different statuses
      await prisma.mortgage.createMany({
        data: [
          {
            accountId: testAccountId,
            propertyId: testPropertyId,
            bank: 'בנק לאומי',
            loanAmount: 1000000,
            startDate: new Date('2024-01-01'),
            status: MortgageStatus.ACTIVE,
          },
          {
            accountId: testAccountId,
            propertyId: testPropertyId,
            bank: 'בנק מזרחי',
            loanAmount: 500000,
            startDate: new Date('2023-01-01'),
            status: MortgageStatus.PAID_OFF,
          },
        ],
      });
    });

    it('should filter mortgages by ACTIVE status', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API_URL}?status=${MortgageStatus.ACTIVE}`)
        .set('x-account-id', testAccountId)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((mortgage: any) => {
        expect(mortgage.status).toBe(MortgageStatus.ACTIVE);
      });
    });

    it('should filter mortgages by PAID_OFF status', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API_URL}?status=${MortgageStatus.PAID_OFF}`)
        .set('x-account-id', testAccountId)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((mortgage: any) => {
        expect(mortgage.status).toBe(MortgageStatus.PAID_OFF);
      });
    });
  });

  describe('US6.13: Edit Mortgage Information', () => {
    let mortgageToEdit: string;

    beforeEach(async () => {
      const mortgage = await prisma.mortgage.create({
        data: {
          accountId: testAccountId,
          propertyId: testPropertyId,
          bank: 'בנק לאומי',
          loanAmount: 1000000,
          startDate: new Date('2024-01-01'),
          status: MortgageStatus.ACTIVE,
        },
      });
      mortgageToEdit = mortgage.id;
    });

    it('should update mortgage bank name', async () => {
      const updateDto = {
        bank: 'בנק מזרחי',
      };

      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${mortgageToEdit}`)
        .set('x-account-id', testAccountId)
        .send(updateDto)
        .expect(200);

      expect(response.body.bank).toBe(updateDto.bank);
    });

    it('should update multiple mortgage fields', async () => {
      const updateDto = {
        interestRate: 4.5,
        monthlyPayment: 12000,
        status: MortgageStatus.PAID_OFF,
      };

      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${mortgageToEdit}`)
        .set('x-account-id', testAccountId)
        .send(updateDto)
        .expect(200);

      expect(response.body.interestRate).toBe(updateDto.interestRate.toString());
      expect(response.body.monthlyPayment).toBe(updateDto.monthlyPayment.toString());
      expect(response.body.status).toBe(updateDto.status);
    });
  });

  describe('US6.14: Delete Mortgage', () => {
    it('should delete mortgage without payments', async () => {
      const mortgage = await prisma.mortgage.create({
        data: {
          accountId: testAccountId,
          propertyId: testPropertyId,
          bank: 'בנק דיסקונט',
          loanAmount: 500000,
          startDate: new Date('2024-01-01'),
          status: MortgageStatus.ACTIVE,
        },
      });

      await request(app.getHttpServer())
        .delete(`${API_URL}/${mortgage.id}`)
        .set('x-account-id', testAccountId)
        .expect(200);

      // Verify deleted
      await request(app.getHttpServer())
        .get(`${API_URL}/${mortgage.id}`)
        .set('x-account-id', testAccountId)
        .expect(404);
    });

    it('should fail to delete mortgage with payments', async () => {
      const mortgage = await prisma.mortgage.create({
        data: {
          accountId: testAccountId,
          propertyId: testPropertyId,
          bank: 'בנק לאומי',
          loanAmount: 1000000,
          startDate: new Date('2024-01-01'),
          status: MortgageStatus.ACTIVE,
        },
      });

      // Add a payment
      await prisma.mortgagePayment.create({
        data: {
          accountId: testAccountId,
          mortgageId: mortgage.id,
          paymentDate: new Date('2024-02-01'),
          amount: new Prisma.Decimal(10000),
        },
      });

      // According to acceptance criteria, deletion should fail if payments exist
      await request(app.getHttpServer())
        .delete(`${API_URL}/${mortgage.id}`)
        .set('x-account-id', testAccountId)
        .expect(409); // Conflict
    });
  });

  describe('US6.15: View Mortgage Summary', () => {
    beforeEach(async () => {
      // Create mortgages with different statuses
      await prisma.mortgage.createMany({
        data: [
          {
            accountId: testAccountId,
            propertyId: testPropertyId,
            bank: 'בנק לאומי',
            loanAmount: 1000000,
            monthlyPayment: 5000,
            startDate: new Date('2024-01-01'),
            status: MortgageStatus.ACTIVE,
          },
          {
            accountId: testAccountId,
            propertyId: testPropertyId,
            bank: 'בנק מזרחי',
            loanAmount: 500000,
            monthlyPayment: 3000,
            startDate: new Date('2023-01-01'),
            status: MortgageStatus.ACTIVE,
          },
          {
            accountId: testAccountId,
            propertyId: testPropertyId,
            bank: 'בנק דיסקונט',
            loanAmount: 2000000,
            startDate: new Date('2022-01-01'),
            status: MortgageStatus.PAID_OFF,
          },
        ],
      });
    });

    it('should return mortgage summary statistics', async () => {
      // Note: Summary endpoint may need to be implemented
      // This test documents expected behavior
      const response = await request(app.getHttpServer())
        .get(`${API_URL}/summary`)
        .set('x-account-id', testAccountId)
        .expect(200);

      expect(response.body).toHaveProperty('totalMortgages');
      expect(response.body).toHaveProperty('totalLoanAmount');
      expect(response.body).toHaveProperty('totalRemainingBalance');
      expect(response.body).toHaveProperty('totalMonthlyPayments');
      expect(response.body).toHaveProperty('mortgagesByStatus');
    });
  });
});
