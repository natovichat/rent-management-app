/**
 * Epic 9: Search & Advanced Filtering
 * US9.2: Advanced Filter Properties - E2E Integration Tests
 * 
 * Tests advanced filtering for properties:
 * - Filter by date range (created date, last valuation date)
 * - Filter by value range (estimated value min/max)
 * - Filter by area range (total area, land area)
 * - Combine multiple advanced filters
 * - Advanced filters with search
 * - Advanced filters with basic filters
 */

import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';

describe('Epic 9 - US9.2: Advanced Filter Properties E2E Tests', () => {
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

    // Create test properties with various values and dates
    const baseDate = new Date('2024-01-01');
    await prisma.property.createMany({
      data: [
        {
          accountId: testAccountId,
          address: 'Property 1',
          fileNumber: 'P1',
          estimatedValue: 1000000,
          totalArea: 100,
          landArea: 80,
          createdAt: new Date(baseDate.getTime() + 0 * 24 * 60 * 60 * 1000), // Day 0
          lastValuationDate: new Date(baseDate.getTime() + 10 * 24 * 60 * 60 * 1000), // Day 10
        },
        {
          accountId: testAccountId,
          address: 'Property 2',
          fileNumber: 'P2',
          estimatedValue: 2000000,
          totalArea: 200,
          landArea: 150,
          createdAt: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000), // Day 5
          lastValuationDate: new Date(baseDate.getTime() + 15 * 24 * 60 * 60 * 1000), // Day 15
        },
        {
          accountId: testAccountId,
          address: 'Property 3',
          fileNumber: 'P3',
          estimatedValue: 3000000,
          totalArea: 300,
          landArea: 250,
          createdAt: new Date(baseDate.getTime() + 10 * 24 * 60 * 60 * 1000), // Day 10
          lastValuationDate: new Date(baseDate.getTime() + 20 * 24 * 60 * 60 * 1000), // Day 20
        },
        {
          accountId: testAccountId,
          address: 'Property 4',
          fileNumber: 'P4',
          estimatedValue: 500000,
          totalArea: 50,
          landArea: 40,
          createdAt: new Date(baseDate.getTime() + 15 * 24 * 60 * 60 * 1000), // Day 15
          lastValuationDate: new Date(baseDate.getTime() + 25 * 24 * 60 * 60 * 1000), // Day 25
        },
        {
          accountId: testAccountId,
          address: 'Property 5',
          fileNumber: 'P5',
          estimatedValue: 4000000,
          totalArea: 400,
          landArea: 350,
          createdAt: new Date(baseDate.getTime() + 20 * 24 * 60 * 60 * 1000), // Day 20
          lastValuationDate: new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000), // Day 30
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

  describe('TC-E2E-9.2-001: Filter by estimated value range', () => {
    it('should filter properties by minimum estimated value', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ minEstimatedValue: 2000000 })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (p: any) => p.estimatedValue >= 2000000,
        ),
      ).toBe(true);
    });

    it('should filter properties by maximum estimated value', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ maxEstimatedValue: 2000000 })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (p: any) => p.estimatedValue <= 2000000,
        ),
      ).toBe(true);
    });

    it('should filter properties by estimated value range', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({
          minEstimatedValue: 1500000,
          maxEstimatedValue: 3500000,
        })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (p: any) =>
            p.estimatedValue >= 1500000 && p.estimatedValue <= 3500000,
        ),
      ).toBe(true);
    });
  });

  describe('TC-E2E-9.2-002: Filter by total area range', () => {
    it('should filter properties by minimum total area', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ minTotalArea: 200 })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every((p: any) => p.totalArea >= 200),
      ).toBe(true);
    });

    it('should filter properties by maximum total area', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ maxTotalArea: 200 })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every((p: any) => p.totalArea <= 200),
      ).toBe(true);
    });

    it('should filter properties by total area range', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({
          minTotalArea: 150,
          maxTotalArea: 350,
        })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (p: any) => p.totalArea >= 150 && p.totalArea <= 350,
        ),
      ).toBe(true);
    });
  });

  describe('TC-E2E-9.2-003: Filter by land area range', () => {
    it('should filter properties by minimum land area', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ minLandArea: 150 })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every((p: any) => p.landArea >= 150),
      ).toBe(true);
    });

    it('should filter properties by maximum land area', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ maxLandArea: 150 })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every((p: any) => p.landArea <= 150),
      ).toBe(true);
    });

    it('should filter properties by land area range', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({
          minLandArea: 100,
          maxLandArea: 300,
        })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (p: any) => p.landArea >= 100 && p.landArea <= 300,
        ),
      ).toBe(true);
    });
  });

  describe('TC-E2E-9.2-004: Filter by created date range', () => {
    it('should filter properties by created date from', async () => {
      const fromDate = new Date('2024-01-06');
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ createdFrom: fromDate.toISOString() })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (p: any) => new Date(p.createdAt) >= fromDate,
        ),
      ).toBe(true);
    });

    it('should filter properties by created date to', async () => {
      const toDate = new Date('2024-01-16');
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ createdTo: toDate.toISOString() })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (p: any) => new Date(p.createdAt) <= toDate,
        ),
      ).toBe(true);
    });

    it('should filter properties by created date range', async () => {
      const fromDate = new Date('2024-01-06');
      const toDate = new Date('2024-01-16');
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({
          createdFrom: fromDate.toISOString(),
          createdTo: toDate.toISOString(),
        })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (p: any) =>
            new Date(p.createdAt) >= fromDate &&
            new Date(p.createdAt) <= toDate,
        ),
      ).toBe(true);
    });
  });

  describe('TC-E2E-9.2-005: Filter by last valuation date range', () => {
    it('should filter properties by last valuation date from', async () => {
      const fromDate = new Date('2024-01-16');
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ valuationFrom: fromDate.toISOString() })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (p: any) =>
            p.lastValuationDate &&
            new Date(p.lastValuationDate) >= fromDate,
        ),
      ).toBe(true);
    });

    it('should filter properties by last valuation date to', async () => {
      const toDate = new Date('2024-01-26');
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ valuationTo: toDate.toISOString() })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (p: any) =>
            !p.lastValuationDate ||
            new Date(p.lastValuationDate) <= toDate,
        ),
      ).toBe(true);
    });

    it('should filter properties by last valuation date range', async () => {
      const fromDate = new Date('2024-01-16');
      const toDate = new Date('2024-01-26');
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({
          valuationFrom: fromDate.toISOString(),
          valuationTo: toDate.toISOString(),
        })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (p: any) =>
            p.lastValuationDate &&
            new Date(p.lastValuationDate) >= fromDate &&
            new Date(p.lastValuationDate) <= toDate,
        ),
      ).toBe(true);
    });
  });

  describe('TC-E2E-9.2-006: Combine multiple advanced filters', () => {
    it('should combine value range and area range filters', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({
          minEstimatedValue: 1500000,
          maxEstimatedValue: 3500000,
          minTotalArea: 150,
          maxTotalArea: 350,
        })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (p: any) =>
            p.estimatedValue >= 1500000 &&
            p.estimatedValue <= 3500000 &&
            p.totalArea >= 150 &&
            p.totalArea <= 350,
        ),
      ).toBe(true);
    });
  });

  describe('TC-E2E-9.2-007: Advanced filters with search', () => {
    it('should combine advanced filters with search', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({
          search: 'Property',
          minEstimatedValue: 1500000,
          maxEstimatedValue: 3500000,
        })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (p: any) =>
            (p.address.includes('Property') ||
              p.fileNumber?.includes('Property')) &&
            p.estimatedValue >= 1500000 &&
            p.estimatedValue <= 3500000,
        ),
      ).toBe(true);
    });
  });

  describe('TC-E2E-9.2-008: Advanced filters with basic filters', () => {
    it('should combine advanced filters with type filter', async () => {
      // Create property with type
      const property = await prisma.property.create({
        data: {
          accountId: testAccountId,
          address: 'Test Property',
          fileNumber: 'TEST',
          type: 'RESIDENTIAL',
          estimatedValue: 2500000,
          totalArea: 250,
        },
      });

      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({
          type: 'RESIDENTIAL',
          minEstimatedValue: 2000000,
          maxEstimatedValue: 3000000,
        })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(
        response.body.data.every(
          (p: any) =>
            p.type === 'RESIDENTIAL' &&
            p.estimatedValue >= 2000000 &&
            p.estimatedValue <= 3000000,
        ),
      ).toBe(true);

      // Cleanup
      await prisma.property.delete({ where: { id: property.id } });
    });
  });
});
