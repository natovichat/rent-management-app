/**
 * Epic 9: Search & Advanced Filtering
 * US9.4: Advanced Filter Investment Companies - E2E Integration Tests
 * 
 * Tests advanced filtering for investment companies:
 * - Filter by country
 * - Filter by investment amount range
 * - Filter by ownership percentage range
 * - Filter by property count range
 * - Combine multiple advanced filters
 * - Advanced filters with search
 */

import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';

describe('Epic 9 - US9.4: Advanced Filter Investment Companies E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const testAccountId = '00000000-0000-0000-0000-000000000001';
  const API_URL = '/investment-companies';

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
    await prisma.investmentCompany.deleteMany({
      where: { accountId: testAccountId },
    });
    await prisma.property.deleteMany({
      where: { accountId: testAccountId },
    });

    // Create test investment companies with various values
    const company1 = await prisma.investmentCompany.create({
      data: {
        accountId: testAccountId,
        name: 'Company 1',
        registrationNumber: 'REG-001',
        country: 'Israel',
        investmentAmount: 2000000,
        ownershipPercentage: 50,
      },
    });

    const company2 = await prisma.investmentCompany.create({
      data: {
        accountId: testAccountId,
        name: 'Company 2',
        registrationNumber: 'REG-002',
        country: 'Germany',
        investmentAmount: 2000000,
        ownershipPercentage: 75,
      },
    });

    const company3 = await prisma.investmentCompany.create({
      data: {
        accountId: testAccountId,
        name: 'Company 3',
        registrationNumber: 'REG-003',
        country: 'Israel',
        investmentAmount: 3000000,
        ownershipPercentage: 25,
      },
    });

    // Create properties linked to companies
    await prisma.property.create({
      data: {
        accountId: testAccountId,
        address: 'Property 1',
        investmentCompanyId: company1.id,
      },
    });

    await prisma.property.createMany({
      data: [
        {
          accountId: testAccountId,
          address: 'Property 2',
          investmentCompanyId: company2.id,
        },
        {
          accountId: testAccountId,
          address: 'Property 3',
          investmentCompanyId: company2.id,
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.property.deleteMany({
      where: { accountId: testAccountId },
    });
    await prisma.investmentCompany.deleteMany({
      where: { accountId: testAccountId },
    });
    await app.close();
  });

  describe('TC-E2E-9.4-001: Filter by country', () => {
    it('should filter companies by country', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ country: 'Israel' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every((c: any) => c.country === 'Israel'),
      ).toBe(true);
    });
  });

  describe('TC-E2E-9.4-002: Filter by investment amount range', () => {
    it('should filter companies by minimum investment amount', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ minInvestmentAmount: 2000000 })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (c: any) =>
            !c.investmentAmount ||
            Number(c.investmentAmount) >= 2000000,
        ),
      ).toBe(true);
    });

    it('should filter companies by maximum investment amount', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ maxInvestmentAmount: 2000000 })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (c: any) =>
            !c.investmentAmount ||
            Number(c.investmentAmount) <= 2000000,
        ),
      ).toBe(true);
    });

    it('should filter companies by investment amount range', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({
          minInvestmentAmount: 1500000,
          maxInvestmentAmount: 2500000,
        })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (c: any) =>
            !c.investmentAmount ||
            (Number(c.investmentAmount) >= 1500000 &&
              Number(c.investmentAmount) <= 2500000),
        ),
      ).toBe(true);
    });
  });

  describe('TC-E2E-9.4-003: Filter by ownership percentage range', () => {
    it('should filter companies by minimum ownership percentage', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ minOwnershipPercentage: 50 })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (c: any) =>
            !c.ownershipPercentage ||
            Number(c.ownershipPercentage) >= 50,
        ),
      ).toBe(true);
    });

    it('should filter companies by maximum ownership percentage', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ maxOwnershipPercentage: 50 })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (c: any) =>
            !c.ownershipPercentage ||
            Number(c.ownershipPercentage) <= 50,
        ),
      ).toBe(true);
    });

    it('should filter companies by ownership percentage range', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({
          minOwnershipPercentage: 30,
          maxOwnershipPercentage: 60,
        })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (c: any) =>
            !c.ownershipPercentage ||
            (Number(c.ownershipPercentage) >= 30 &&
              Number(c.ownershipPercentage) <= 60),
        ),
      ).toBe(true);
    });
  });

  describe('TC-E2E-9.4-004: Filter by property count range', () => {
    it('should filter companies by minimum property count', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ minPropertyCount: 2 })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (c: any) => c.propertyCount >= 2,
        ),
      ).toBe(true);
    });

    it('should filter companies by maximum property count', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ maxPropertyCount: 1 })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every((c: any) => c.propertyCount <= 1),
      ).toBe(true);
    });

    it('should filter companies by property count range', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({
          minPropertyCount: 1,
          maxPropertyCount: 2,
        })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (c: any) => c.propertyCount >= 1 && c.propertyCount <= 2,
        ),
      ).toBe(true);
    });
  });

  describe('TC-E2E-9.4-005: Combine multiple advanced filters', () => {
    it('should combine investment amount and ownership percentage filters', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({
          minInvestmentAmount: 1500000,
          maxInvestmentAmount: 2500000,
          minOwnershipPercentage: 30,
          maxOwnershipPercentage: 60,
        })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (c: any) =>
            (!c.investmentAmount ||
              (Number(c.investmentAmount) >= 1500000 &&
                Number(c.investmentAmount) <= 2500000)) &&
            (!c.ownershipPercentage ||
              (Number(c.ownershipPercentage) >= 30 &&
                Number(c.ownershipPercentage) <= 60)),
        ),
      ).toBe(true);
    });
  });

  describe('TC-E2E-9.4-006: Advanced filters with search', () => {
    it('should combine advanced filters with search', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({
          search: 'Company',
          minInvestmentAmount: 1500000,
          maxInvestmentAmount: 2500000,
        })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (c: any) =>
            (c.name.includes('Company') ||
              c.registrationNumber?.includes('Company') ||
              c.country.includes('Company')) &&
            (!c.investmentAmount ||
              (Number(c.investmentAmount) >= 1500000 &&
                Number(c.investmentAmount) <= 2500000)),
        ),
      ).toBe(true);
    });
  });
});
