/**
 * Epic 9: Search & Advanced Filtering
 * US9.1: Search Properties - E2E Integration Tests
 * 
 * Tests search functionality for properties:
 * - Search by address (partial match)
 * - Search by file number (partial match)
 * - Case-insensitive search
 * - Debounced search (simulated)
 * - Search with pagination
 * - Empty search shows all properties
 * - Search combined with filters
 */

import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';

describe('Epic 9 - US9.1: Search Properties E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const testAccountId = '00000000-0000-0000-0000-000000000001';
  const API_URL = '/properties';

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
    await prisma.property.deleteMany({
      where: { accountId: testAccountId },
    });

    // Create test properties
    await prisma.property.createMany({
      data: [
        {
          accountId: testAccountId,
          address: 'רחוב הרצל 10, תל אביב',
          fileNumber: 'FILE-001',
        },
        {
          accountId: testAccountId,
          address: 'רחוב דיזנגוף 20, תל אביב',
          fileNumber: 'FILE-002',
        },
        {
          accountId: testAccountId,
          address: 'רחוב בן יהודה 5, ירושלים',
          fileNumber: 'FILE-003',
        },
        {
          accountId: testAccountId,
          address: 'רחוב הרצל 15, חיפה',
          fileNumber: 'FILE-004',
        },
        {
          accountId: testAccountId,
          address: 'רחוב ויצמן 30, תל אביב',
          fileNumber: 'TEL-AVIV-001',
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.property.deleteMany({
      where: { accountId: testAccountId },
    });
    await app.close();
  });

  describe('TC-E2E-9.1-001: Search input field available', () => {
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

  describe('TC-E2E-9.1-002: Search by address', () => {
    it('should find properties by address partial match', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ search: 'תל אביב' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every((p: any) =>
          p.address.includes('תל אביב'),
        ),
      ).toBe(true);
    });

    it('should find properties by partial address match', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ search: 'הרצל' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every((p: any) => p.address.includes('הרצל')),
      ).toBe(true);
    });
  });

  describe('TC-E2E-9.1-003: Search by file number', () => {
    it('should find properties by file number partial match', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ search: 'FILE-00' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every((p: any) =>
          p.fileNumber?.includes('FILE-00'),
        ),
      ).toBe(true);
    });

    it('should find properties by exact file number', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ search: 'FILE-001' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].fileNumber).toBe('FILE-001');
    });
  });

  describe('TC-E2E-9.1-004: Case-insensitive search', () => {
    it('should find properties regardless of case', async () => {
      const response1 = await request(app.getHttpServer())
        .get(API_URL)
        .query({ search: 'file-001' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      const response2 = await request(app.getHttpServer())
        .get(API_URL)
        .query({ search: 'FILE-001' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response1.body.data.length).toBe(response2.body.data.length);
      expect(response1.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('TC-E2E-9.1-005: Search with pagination', () => {
    it('should return paginated search results', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({
          search: 'תל אביב',
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

  describe('TC-E2E-9.1-006: Empty search shows all properties', () => {
    it('should return all properties when search is empty', async () => {
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

  describe('TC-E2E-9.1-007: Search combined with filters', () => {
    it('should combine search with type filter', async () => {
      // First create a property with specific type
      const property = await prisma.property.create({
        data: {
          accountId: testAccountId,
          address: 'רחוב בדיקה 1, תל אביב',
          fileNumber: 'TEST-001',
          type: 'RESIDENTIAL',
        },
      });

      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({
          search: 'תל אביב',
          type: 'RESIDENTIAL',
        })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(
        response.body.data.every(
          (p: any) =>
            p.address.includes('תל אביב') && p.type === 'RESIDENTIAL',
        ),
      ).toBe(true);

      // Cleanup
      await prisma.property.delete({ where: { id: property.id } });
    });
  });

  describe('TC-E2E-9.1-008: Search no results', () => {
    it('should return empty array when no matches found', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ search: 'NONEXISTENT-PROPERTY-12345' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBe(0);
    });
  });

  describe('TC-E2E-9.1-009: Search account isolation', () => {
    it('should only search properties from correct account', async () => {
      const otherAccountId = '00000000-0000-0000-0000-000000000002';

      // Create property in other account
      const otherProperty = await prisma.property.create({
        data: {
          accountId: otherAccountId,
          address: 'רחוב אחר 1, תל אביב',
          fileNumber: 'OTHER-001',
        },
      });

      // Search from test account
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ search: 'OTHER-001' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      // Should not find property from other account
      expect(
        response.body.data.some((p: any) => p.id === otherProperty.id),
      ).toBe(false);

      // Cleanup
      await prisma.property.delete({ where: { id: otherProperty.id } });
    });
  });
});
