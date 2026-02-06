/**
 * Epic 9: Search & Advanced Filtering
 * US9.8: Advanced Filter Mortgages - E2E Integration Tests
 * 
 * Tests advanced filtering for mortgages:
 * - Filter by bank
 * - Filter by property
 * - Filter by loan amount range
 * - Filter by interest rate range
 * - Filter by status
 * - Combine multiple advanced filters
 * - Advanced filters with search
 */

import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';

describe('Epic 9 - US9.8: Advanced Filter Mortgages E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const testAccountId = '00000000-0000-0000-0000-000000000001';
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

    // Clean up test data
    await prisma.mortgage.deleteMany({
      where: { accountId: testAccountId },
    });
    await prisma.property.deleteMany({
      where: { accountId: testAccountId },
    });

    // Create test properties
    const property1 = await prisma.property.create({
      data: {
        accountId: testAccountId,
        address: 'Property 1',
      },
    });

    const property2 = await prisma.property.create({
      data: {
        accountId: testAccountId,
        address: 'Property 2',
      },
    });

    // Create test mortgages
    await prisma.mortgage.create({
      data: {
        accountId: testAccountId,
        propertyId: property1.id,
        bank: 'Bank of Israel',
        loanAmount: 500000,
        interestRate: 3.5,
        startDate: new Date('2024-01-01'),
        status: 'ACTIVE',
      },
    });

    await prisma.mortgage.create({
      data: {
        accountId: testAccountId,
        propertyId: property2.id,
        bank: 'Hapoalim Bank',
        loanAmount: 800000,
        interestRate: 4.0,
        startDate: new Date('2024-01-01'),
        status: 'ACTIVE',
      },
    });

    await prisma.mortgage.create({
      data: {
        accountId: testAccountId,
        propertyId: property1.id,
        bank: 'Bank of Israel',
        loanAmount: 300000,
        interestRate: 5.0,
        startDate: new Date('2023-01-01'),
        status: 'PAID_OFF',
      },
    });
  });

  afterAll(async () => {
    await prisma.mortgage.deleteMany({
      where: { accountId: testAccountId },
    });
    await prisma.property.deleteMany({
      where: { accountId: testAccountId },
    });
    await app.close();
  });

  describe('TC-E2E-9.8-001: Filter by bank', () => {
    it('should filter mortgages by bank name', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ bank: 'Bank of Israel' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every((m: any) => m.bank === 'Bank of Israel'),
      ).toBe(true);
    });
  });

  describe('TC-E2E-9.8-002: Filter by property', () => {
    it('should filter mortgages by property ID', async () => {
      const properties = await prisma.property.findMany({
        where: { accountId: testAccountId },
      });
      const propertyId = properties[0].id;

      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ propertyId })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every((m: any) => m.propertyId === propertyId),
      ).toBe(true);
    });
  });

  describe('TC-E2E-9.8-003: Filter by loan amount range', () => {
    it('should filter mortgages by minimum loan amount', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ minLoanAmount: 600000 })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (m: any) =>
            !m.loanAmount || Number(m.loanAmount) >= 600000,
        ),
      ).toBe(true);
    });

    it('should filter mortgages by maximum loan amount', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ maxLoanAmount: 600000 })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (m: any) =>
            !m.loanAmount || Number(m.loanAmount) <= 600000,
        ),
      ).toBe(true);
    });

    it('should filter mortgages by loan amount range', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({
          minLoanAmount: 400000,
          maxLoanAmount: 600000,
        })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (m: any) =>
            !m.loanAmount ||
            (Number(m.loanAmount) >= 400000 &&
              Number(m.loanAmount) <= 600000),
        ),
      ).toBe(true);
    });
  });

  describe('TC-E2E-9.8-004: Filter by interest rate range', () => {
    it('should filter mortgages by minimum interest rate', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ minInterestRate: 4.0 })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (m: any) =>
            !m.interestRate || Number(m.interestRate) >= 4.0,
        ),
      ).toBe(true);
    });

    it('should filter mortgages by maximum interest rate', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ maxInterestRate: 4.0 })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (m: any) =>
            !m.interestRate || Number(m.interestRate) <= 4.0,
        ),
      ).toBe(true);
    });

    it('should filter mortgages by interest rate range', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({
          minInterestRate: 3.0,
          maxInterestRate: 4.5,
        })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (m: any) =>
            !m.interestRate ||
            (Number(m.interestRate) >= 3.0 &&
              Number(m.interestRate) <= 4.5),
        ),
      ).toBe(true);
    });
  });

  describe('TC-E2E-9.8-005: Filter by status', () => {
    it('should filter mortgages by status', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ status: 'ACTIVE' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every((m: any) => m.status === 'ACTIVE'),
      ).toBe(true);
    });
  });

  describe('TC-E2E-9.8-006: Combine multiple advanced filters', () => {
    it('should combine loan amount and interest rate filters', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({
          minLoanAmount: 400000,
          maxLoanAmount: 600000,
          minInterestRate: 3.0,
          maxInterestRate: 4.0,
        })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (m: any) =>
            (!m.loanAmount ||
              (Number(m.loanAmount) >= 400000 &&
                Number(m.loanAmount) <= 600000)) &&
            (!m.interestRate ||
              (Number(m.interestRate) >= 3.0 &&
                Number(m.interestRate) <= 4.0)),
        ),
      ).toBe(true);
    });
  });

  describe('TC-E2E-9.8-007: Advanced filters with search', () => {
    it('should combine advanced filters with search', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({
          search: 'Israel',
          minLoanAmount: 400000,
          maxLoanAmount: 600000,
        })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (m: any) =>
            (m.bank?.toLowerCase().includes('israel') ||
              m.property?.address?.toLowerCase().includes('israel')) &&
            (!m.loanAmount ||
              (Number(m.loanAmount) >= 400000 &&
                Number(m.loanAmount) <= 600000)),
        ),
      ).toBe(true);
    });
  });
});
