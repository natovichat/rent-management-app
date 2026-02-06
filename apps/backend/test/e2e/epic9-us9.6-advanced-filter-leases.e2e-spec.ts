/**
 * Epic 9: Search & Advanced Filtering
 * US9.6: Advanced Filter Leases - E2E Integration Tests
 * 
 * Tests advanced filtering for leases:
 * - Filter by start date range
 * - Filter by end date range
 * - Filter by monthly rent range
 * - Filter by property
 * - Filter by tenant
 * - Combine multiple advanced filters
 * - Advanced filters with search
 */

import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';

describe('Epic 9 - US9.6: Advanced Filter Leases E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const testAccountId = '00000000-0000-0000-0000-000000000001';
  const API_URL = '/leases';

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
    await prisma.lease.deleteMany({
      where: { accountId: testAccountId },
    });
    await prisma.tenant.deleteMany({
      where: { accountId: testAccountId },
    });
    await prisma.property.deleteMany({
      where: { accountId: testAccountId },
    });

    // Clean up units
    await prisma.unit.deleteMany({
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

    // Create test units
    const unit1 = await prisma.unit.create({
      data: {
        accountId: testAccountId,
        propertyId: property1.id,
        apartmentNumber: '1',
      },
    });

    const unit2 = await prisma.unit.create({
      data: {
        accountId: testAccountId,
        propertyId: property2.id,
        apartmentNumber: '2',
      },
    });

    // Create test tenants
    const tenant1 = await prisma.tenant.create({
      data: {
        accountId: testAccountId,
        name: 'Tenant 1',
        email: 'tenant1@example.com',
        phone: '050-1111111',
      },
    });

    const tenant2 = await prisma.tenant.create({
      data: {
        accountId: testAccountId,
        name: 'Tenant 2',
        email: 'tenant2@example.com',
        phone: '050-2222222',
      },
    });

    // Create test leases
    await prisma.lease.create({
      data: {
        accountId: testAccountId,
        unitId: unit1.id,
        tenantId: tenant1.id,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyRent: 6000,
        paymentTo: 'OWNER',
      },
    });

    await prisma.lease.create({
      data: {
        accountId: testAccountId,
        unitId: unit2.id,
        tenantId: tenant2.id,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2025-05-31'),
        monthlyRent: 8000,
        paymentTo: 'OWNER',
      },
    });

    await prisma.lease.create({
      data: {
        accountId: testAccountId,
        unitId: unit1.id,
        tenantId: tenant2.id,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        monthlyRent: 6000,
        paymentTo: 'OWNER',
      },
    });
  });

  afterAll(async () => {
    await prisma.lease.deleteMany({
      where: { accountId: testAccountId },
    });
    await prisma.unit.deleteMany({
      where: { accountId: testAccountId },
    });
    await prisma.tenant.deleteMany({
      where: { accountId: testAccountId },
    });
    await prisma.property.deleteMany({
      where: { accountId: testAccountId },
    });
    await app.close();
  });

  describe('TC-E2E-9.6-001: Filter by start date range', () => {
    it('should filter leases by minimum start date', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ startDateFrom: '2024-01-01' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every((l: any) => {
          const startDate = new Date(l.startDate);
          return startDate >= new Date('2024-01-01');
        }),
      ).toBe(true);
    });

    it('should filter leases by maximum start date', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ startDateTo: '2024-01-01' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every((l: any) => {
          const startDate = new Date(l.startDate);
          return startDate <= new Date('2024-01-01');
        }),
      ).toBe(true);
    });

    it('should filter leases by start date range', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({
          startDateFrom: '2024-01-01',
          startDateTo: '2024-12-31',
        })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every((l: any) => {
          const startDate = new Date(l.startDate);
          return (
            startDate >= new Date('2024-01-01') &&
            startDate <= new Date('2024-12-31')
          );
        }),
      ).toBe(true);
    });
  });

  describe('TC-E2E-9.6-002: Filter by end date range', () => {
    it('should filter leases by minimum end date', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ endDateFrom: '2024-12-31' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every((l: any) => {
          const endDate = new Date(l.endDate);
          return endDate >= new Date('2024-12-31');
        }),
      ).toBe(true);
    });

    it('should filter leases by maximum end date', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ endDateTo: '2024-12-31' })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every((l: any) => {
          const endDate = new Date(l.endDate);
          return endDate <= new Date('2024-12-31');
        }),
      ).toBe(true);
    });
  });

  describe('TC-E2E-9.6-003: Filter by monthly rent range', () => {
    it('should filter leases by minimum monthly rent', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ minMonthlyRent: 6000 })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (l: any) => !l.monthlyRent || Number(l.monthlyRent) >= 6000,
        ),
      ).toBe(true);
    });

    it('should filter leases by maximum monthly rent', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ maxMonthlyRent: 6000 })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (l: any) => !l.monthlyRent || Number(l.monthlyRent) <= 6000,
        ),
      ).toBe(true);
    });

    it('should filter leases by monthly rent range', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({
          minMonthlyRent: 5500,
          maxMonthlyRent: 6500,
        })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (l: any) =>
            !l.monthlyRent ||
            (Number(l.monthlyRent) >= 5500 &&
              Number(l.monthlyRent) <= 6500),
        ),
      ).toBe(true);
    });
  });

  describe('TC-E2E-9.6-004: Filter by property', () => {
    it('should filter leases by property ID', async () => {
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
        response.body.data.every(
          (l: any) => l.unit?.property?.id === propertyId,
        ),
      ).toBe(true);
    });
  });

  describe('TC-E2E-9.6-005: Filter by tenant', () => {
    it('should filter leases by tenant ID', async () => {
      const tenants = await prisma.tenant.findMany({
        where: { accountId: testAccountId },
      });
      const tenantId = tenants[0].id;

      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({ tenantId })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every((l: any) => l.tenantId === tenantId),
      ).toBe(true);
    });
  });

  describe('TC-E2E-9.6-006: Combine multiple advanced filters', () => {
    it('should combine rent range and start date filters', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .query({
          minMonthlyRent: 5500,
          maxMonthlyRent: 6500,
          startDateFrom: '2024-01-01',
        })
        .set('X-Account-Id', testAccountId)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (l: any) =>
            (!l.monthlyRent ||
              (Number(l.monthlyRent) >= 5500 &&
                Number(l.monthlyRent) <= 6500)) &&
            new Date(l.startDate) >= new Date('2024-01-01'),
        ),
      ).toBe(true);
    });
  });
});
