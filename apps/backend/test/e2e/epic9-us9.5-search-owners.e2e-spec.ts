/**
 * Epic 9: Search & Advanced Filtering
 * US9.5: Search Owners - E2E Integration Tests
 * 
 * Tests search functionality for owners:
 * - Search by name
 * - Search by email
 * - Search by phone
 * - Case-insensitive search
 * - Search with pagination
 * - Empty search shows all owners
 * - Search combined with filters
 * - Account isolation
 */

import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';

describe('Epic 9 - US9.5: Search Owners E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const testAccountId = '00000000-0000-0000-0000-000000000001';
  const otherAccountId = '00000000-0000-0000-0000-000000000002';
  const API_URL = '/owners';

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
    await prisma.owner.deleteMany({
      where: { accountId: { in: [testAccountId, otherAccountId] } },
    });

    // Create test owners
    await prisma.owner.createMany({
      data: [
        {
          accountId: testAccountId,
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '050-1234567',
          type: 'INDIVIDUAL',
        },
        {
          accountId: testAccountId,
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '052-9876543',
          type: 'INDIVIDUAL',
        },
        {
          accountId: testAccountId,
          name: 'Bob Johnson',
          email: 'bob.johnson@test.com',
          phone: '054-5555555',
          type: 'INDIVIDUAL',
        },
        {
          accountId: otherAccountId,
          name: 'Other Account Owner',
          email: 'other@example.com',
          phone: '050-0000000',
          type: 'INDIVIDUAL',
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.owner.deleteMany({
      where: { accountId: { in: [testAccountId, otherAccountId] } },
    });
    await app.close();
  });

  describe('TC-E2E-9.5-001: Search by name', () => {
    it('should find owners by name (partial match)', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ search: 'John' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every((o: any) =>
          o.name.toLowerCase().includes('john'),
        ),
      ).toBe(true);
    });

    it('should find owners by full name', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ search: 'Jane Smith' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.some((o: any) => o.name === 'Jane Smith'),
      ).toBe(true);
    });
  });

  describe('TC-E2E-9.5-002: Search by email', () => {
    it('should find owners by email (partial match)', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ search: 'example.com' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every((o: any) =>
          o.email?.toLowerCase().includes('example.com'),
        ),
      ).toBe(true);
    });

    it('should find owners by email domain', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ search: 'test.com' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.some((o: any) => o.email === 'bob.johnson@test.com'),
      ).toBe(true);
    });
  });

  describe('TC-E2E-9.5-003: Search by phone', () => {
    it('should find owners by phone number (partial match)', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ search: '050' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every((o: any) =>
          o.phone?.includes('050'),
        ),
      ).toBe(true);
    });

    it('should find owners by full phone number', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ search: '052-9876543' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.some((o: any) => o.phone === '052-9876543'),
      ).toBe(true);
    });
  });

  describe('TC-E2E-9.5-004: Case-insensitive search', () => {
    it('should find owners regardless of case', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ search: 'JOHN' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.some((o: any) =>
          o.name.toLowerCase().includes('john'),
        ),
      ).toBe(true);
    });

    it('should find owners with lowercase search', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ search: 'jane' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.some((o: any) => o.name === 'Jane Smith'),
      ).toBe(true);
    });
  });

  describe('TC-E2E-9.5-005: Search with pagination', () => {
    it('should return paginated search results', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ search: 'o', page: 1, limit: 2 })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(2);
    });
  });

  describe('TC-E2E-9.5-006: Empty search shows all owners', () => {
    it('should return all owners when search is empty', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThanOrEqual(3);
    });

    it('should return all owners when search is whitespace', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ search: '   ' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('TC-E2E-9.5-007: Account isolation', () => {
    it('should only return owners from the specified account', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ search: 'Owner' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(
        response.body.data.every((o: any) => o.accountId === testAccountId),
      ).toBe(true);
      expect(
        response.body.data.some((o: any) => o.name === 'Other Account Owner'),
      ).toBe(false);
    });
  });
});
