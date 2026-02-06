/**
 * Epic 9: Search & Advanced Filtering
 * US9.3: Search Investment Companies - E2E Integration Tests
 * 
 * Tests search functionality for investment companies:
 * - Search by name (partial match)
 * - Search by registration number (partial match)
 * - Search by country (partial match)
 * - Case-insensitive search
 * - Search with pagination
 * - Empty search shows all companies
 * - Search account isolation
 */

import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';

describe('Epic 9 - US9.3: Search Investment Companies E2E Tests', () => {
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

    // Create test investment companies
    await prisma.investmentCompany.createMany({
      data: [
        {
          accountId: testAccountId,
          name: 'חברת השקעות תל אביב',
          registrationNumber: 'REG-001',
          country: 'Israel',
        },
        {
          accountId: testAccountId,
          name: 'Investment Company Germany',
          registrationNumber: 'REG-002',
          country: 'Germany',
        },
        {
          accountId: testAccountId,
          name: 'חברת נדל"ן ירושלים',
          registrationNumber: 'REG-003',
          country: 'Israel',
        },
        {
          accountId: testAccountId,
          name: 'Real Estate Holdings',
          registrationNumber: 'GERMANY-001',
          country: 'Germany',
        },
        {
          accountId: testAccountId,
          name: 'חברת השקעות חיפה',
          registrationNumber: 'REG-004',
          country: 'Israel',
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.investmentCompany.deleteMany({
      where: { accountId: testAccountId },
    });
    await app.close();
  });

  describe('TC-E2E-9.3-001: Search input field available', () => {
    it('should accept search query parameter', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ search: 'תל אביב' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('TC-E2E-9.3-002: Search by name', () => {
    it('should find companies by name partial match', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ search: 'תל אביב' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every((c: any) => c.name.includes('תל אביב')),
      ).toBe(true);
    });

    it('should find companies by partial name match', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ search: 'השקעות' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every((c: any) => c.name.includes('השקעות')),
      ).toBe(true);
    });
  });

  describe('TC-E2E-9.3-003: Search by registration number', () => {
    it('should find companies by registration number partial match', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ search: 'REG-00' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every((c: any) =>
          c.registrationNumber?.includes('REG-00'),
        ),
      ).toBe(true);
    });

    it('should find companies by exact registration number', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ search: 'REG-001' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].registrationNumber).toBe('REG-001');
    });
  });

  describe('TC-E2E-9.3-004: Search by country', () => {
    it('should find companies by country', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ search: 'Germany' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every((c: any) => c.country === 'Germany'),
      ).toBe(true);
    });
  });

  describe('TC-E2E-9.3-005: Case-insensitive search', () => {
    it('should find companies regardless of case', async () => {
      const response1 = await request(app.getHttpServer())
        .get(API_URL)
        .query({ search: 'germany' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      const response2 = await request(app.getHttpServer())
        .get(API_URL)
        .query({ search: 'GERMANY' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response1.body.data.length).toBe(response2.body.data.length);
      expect(response1.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('TC-E2E-9.3-006: Search with pagination', () => {
    it('should return paginated search results', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({
          search: 'Israel',
          page: 1,
          limit: 2,
        })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(2);
    });
  });

  describe('TC-E2E-9.3-007: Empty search shows all companies', () => {
    it('should return all companies when search is empty', async () => {
      const response1 = await request(app.getHttpServer())
        .get(API_URL)
        .set('X-Account-Id', testAccountId)
        .expect(200);

      const response2 = await request(app.getHttpServer())
        .get(API_URL)
        .query({ search: '' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response1.body.data.length).toBe(response2.body.data.length);
    });
  });

  describe('TC-E2E-9.3-008: Search account isolation', () => {
    it('should only search companies from correct account', async () => {
      const otherAccountId = '00000000-0000-0000-0000-000000000002';

      // Create company in other account
      const otherCompany = await prisma.investmentCompany.create({
        data: {
          accountId: otherAccountId,
          name: 'Other Account Company',
          registrationNumber: 'OTHER-001',
          country: 'Israel',
        },
      });

      // Search from test account
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ search: 'OTHER-001' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      // Should not find company from other account
      expect(
        response.body.data.some((c: any) => c.id === otherCompany.id),
      ).toBe(false);

      // Cleanup
      await prisma.investmentCompany.delete({ where: { id: otherCompany.id } });
    });
  });
});
