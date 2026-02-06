/**
 * US1.7 Property Filtering - E2E Integration Tests
 * Engineer 4: Filter Parameter Tests
 * 
 * Tests all filter parameters for properties API:
 * - Type filter (single and multiple)
 * - Status filter (single and multiple)
 * - City filter (case-insensitive partial match)
 * - Country filter (exact match)
 * - isMortgaged filter (boolean)
 * - Combined filters (AND logic)
 * - Filters with pagination
 */

import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';
import { PropertyType, PropertyStatus } from '@prisma/client';

describe('US1.7 - Properties Filter E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testAccountId: string;

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

    // Set up test environment
    const testAccount = await prisma.account.create({
      data: {
        name: 'US1.7 Filter Test Account',
      },
    });
    testAccountId = testAccount.id;

    // Create test properties with various filter values
    await prisma.property.createMany({
      data: [
        // Property 1: Residential, Owned, Tel Aviv, Israel, Not Mortgaged
        {
          accountId: testAccountId,
          address: 'רחוב הרצל 10, תל אביב',
          fileNumber: 'PROP-001',
          type: PropertyType.RESIDENTIAL,
          status: PropertyStatus.OWNED,
          city: 'תל אביב',
          country: 'Israel',
          isMortgaged: false,
        },
        // Property 2: Commercial, Owned, Tel Aviv, Israel, Mortgaged
        {
          accountId: testAccountId,
          address: 'רחוב דיזנגוף 50, תל אביב',
          fileNumber: 'PROP-002',
          type: PropertyType.COMMERCIAL,
          status: PropertyStatus.OWNED,
          city: 'תל אביב',
          country: 'Israel',
          isMortgaged: true,
        },
        // Property 3: Residential, In Construction, Jerusalem, Israel, Not Mortgaged
        {
          accountId: testAccountId,
          address: 'רחוב יפו 20, ירושלים',
          fileNumber: 'PROP-003',
          type: PropertyType.RESIDENTIAL,
          status: PropertyStatus.IN_CONSTRUCTION,
          city: 'ירושלים',
          country: 'Israel',
          isMortgaged: false,
        },
        // Property 4: Land, Investment, Haifa, Israel, Not Mortgaged
        {
          accountId: testAccountId,
          address: 'רחוב הרצל 5, חיפה',
          fileNumber: 'PROP-004',
          type: PropertyType.LAND,
          status: PropertyStatus.INVESTMENT,
          city: 'חיפה',
          country: 'Israel',
          isMortgaged: false,
        },
        // Property 5: Mixed Use, In Purchase, Tel Aviv, Israel, Mortgaged
        {
          accountId: testAccountId,
          address: 'רחוב אלנבי 30, תל אביב',
          fileNumber: 'PROP-005',
          type: PropertyType.MIXED_USE,
          status: PropertyStatus.IN_PURCHASE,
          city: 'תל אביב',
          country: 'Israel',
          isMortgaged: true,
        },
        // Property 6: Residential, Sold, Beersheba, Israel, Not Mortgaged
        {
          accountId: testAccountId,
          address: 'רחוב בן גוריון 15, באר שבע',
          fileNumber: 'PROP-006',
          type: PropertyType.RESIDENTIAL,
          status: PropertyStatus.SOLD,
          city: 'באר שבע',
          country: 'Israel',
          isMortgaged: false,
        },
      ],
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.property.deleteMany({ where: { accountId: testAccountId } });
    await prisma.account.deleteMany({ where: { id: testAccountId } });
    await app.close();
  });

  describe('TC-FILTER-001: Type filter (single value)', () => {
    it('should filter properties by single type (RESIDENTIAL)', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ type: PropertyType.RESIDENTIAL })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (p: any) => p.type === PropertyType.RESIDENTIAL,
        ),
      ).toBe(true);
    });

    it('should filter properties by single type (COMMERCIAL)', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ type: PropertyType.COMMERCIAL })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(
        response.body.data.every(
          (p: any) => p.type === PropertyType.COMMERCIAL,
        ),
      ).toBe(true);
    });
  });

  describe('TC-FILTER-002: Type filter (multiple values)', () => {
    it('should filter properties by multiple types', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({
          type: [PropertyType.RESIDENTIAL, PropertyType.COMMERCIAL].join(','),
        })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(
        response.body.data.every((p: any) =>
          [PropertyType.RESIDENTIAL, PropertyType.COMMERCIAL].includes(
            p.type,
          ),
        ),
      ).toBe(true);
    });
  });

  describe('TC-FILTER-003: Status filter (single value)', () => {
    it('should filter properties by single status (OWNED)', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ status: PropertyStatus.OWNED })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(
        response.body.data.every(
          (p: any) => p.status === PropertyStatus.OWNED,
        ),
      ).toBe(true);
    });
  });

  describe('TC-FILTER-004: Status filter (multiple values)', () => {
    it('should filter properties by multiple statuses', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({
          status: [
            PropertyStatus.OWNED,
            PropertyStatus.IN_CONSTRUCTION,
          ].join(','),
        })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(
        response.body.data.every((p: any) =>
          [PropertyStatus.OWNED, PropertyStatus.IN_CONSTRUCTION].includes(
            p.status,
          ),
        ),
      ).toBe(true);
    });
  });

  describe('TC-FILTER-005: City filter (case-insensitive partial match)', () => {
    it('should filter properties by city (exact match)', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ city: 'תל אביב' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(
        response.body.data.every((p: any) => p.city === 'תל אביב'),
      ).toBe(true);
    });

    it('should filter properties by city (partial match)', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ city: 'תל' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(
        response.body.data.every((p: any) => p.city?.includes('תל')),
      ).toBe(true);
    });
  });

  describe('TC-FILTER-006: Country filter (exact match)', () => {
    it('should filter properties by country', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ country: 'Israel' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(
        response.body.data.every((p: any) => p.country === 'Israel'),
      ).toBe(true);
    });
  });

  describe('TC-FILTER-007: isMortgaged filter (boolean)', () => {
    it('should filter properties by isMortgaged=true', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ isMortgaged: 'true' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(
        response.body.data.every((p: any) => p.isMortgaged === true),
      ).toBe(true);
    });

    it('should filter properties by isMortgaged=false', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ isMortgaged: 'false' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(
        response.body.data.every((p: any) => p.isMortgaged === false),
      ).toBe(true);
    });
  });

  describe('TC-FILTER-008: Combined filters (AND logic)', () => {
    it('should filter by type AND status', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({
          type: PropertyType.RESIDENTIAL,
          status: PropertyStatus.OWNED,
        })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(
        response.body.data.every(
          (p: any) =>
            p.type === PropertyType.RESIDENTIAL &&
            p.status === PropertyStatus.OWNED,
        ),
      ).toBe(true);
    });

    it('should filter by type AND city AND isMortgaged', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({
          type: PropertyType.COMMERCIAL,
          city: 'תל אביב',
          isMortgaged: 'true',
        })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(
        response.body.data.every(
          (p: any) =>
            p.type === PropertyType.COMMERCIAL &&
            p.city === 'תל אביב' &&
            p.isMortgaged === true,
        ),
      ).toBe(true);
    });

    it('should filter by multiple types AND status', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({
          type: [PropertyType.RESIDENTIAL, PropertyType.LAND].join(','),
          status: PropertyStatus.OWNED,
        })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(
        response.body.data.every(
          (p: any) =>
            [PropertyType.RESIDENTIAL, PropertyType.LAND].includes(p.type) &&
            p.status === PropertyStatus.OWNED,
        ),
      ).toBe(true);
    });
  });

  describe('TC-FILTER-009: Filters with pagination', () => {
    it('should apply filters with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({
          type: PropertyType.RESIDENTIAL,
          page: 1,
          limit: 2,
        })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(
        response.body.data.every(
          (p: any) => p.type === PropertyType.RESIDENTIAL,
        ),
      ).toBe(true);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(2);
    });
  });

  describe('TC-FILTER-010: Filters with search', () => {
    it('should combine filters with search parameter', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({
          search: 'תל אביב',
          type: PropertyType.RESIDENTIAL,
        })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(
        response.body.data.every(
          (p: any) =>
            p.type === PropertyType.RESIDENTIAL &&
            (p.address.includes('תל אביב') ||
              p.fileNumber?.includes('תל אביב')),
        ),
      ).toBe(true);
    });
  });

  describe('TC-FILTER-011: Empty results', () => {
    it('should return empty array when no properties match filters', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({
          type: PropertyType.COMMERCIAL,
          city: 'ירושלים',
        })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta.total).toBe(0);
    });
  });
});
