/**
 * Epic 3: Tenant Management - E2E Integration Tests
 * 
 * Tests all 6 user stories:
 * - US3.1: Create Tenant
 * - US3.2: View All Tenants
 * - US3.3: Edit Tenant Details
 * - US3.4: Delete Tenant
 * - US3.5: Search Tenants
 * - US3.6: View Tenant's Lease History
 */

import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';
import { LeaseStatus } from '@prisma/client';

describe('Epic 3: Tenant Management E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  // Use hardcoded account ID that matches controller
  const testAccountId = '00000000-0000-0000-0000-000000000001';
  let testPropertyId: string;
  let testUnitId: string;

  const API_URL = '/tenants';

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

    // Ensure test account exists (create if doesn't exist)
    const existingAccount = await prisma.account.findUnique({
      where: { id: testAccountId },
    });
    if (!existingAccount) {
      await prisma.account.create({
        data: {
          id: testAccountId,
          name: 'Epic 3 Tenant Test Account',
        },
      });
    }

    // Create test property and unit for lease history tests
    const testProperty = await prisma.property.create({
      data: {
        accountId: testAccountId,
        address: 'רחוב הרצל 10, תל אביב',
        fileNumber: 'PROP-TEST-001',
      },
    });
    testPropertyId = testProperty.id;

    const testUnit = await prisma.unit.create({
      data: {
        accountId: testAccountId,
        propertyId: testPropertyId,
        apartmentNumber: '3A',
        floor: 3,
        roomCount: 3,
      },
    });
    testUnitId = testUnit.id;
  });

  afterAll(async () => {
    // Cleanup (don't delete account as it's shared/hardcoded)
    await prisma.lease.deleteMany({ where: { accountId: testAccountId } });
    await prisma.tenant.deleteMany({ where: { accountId: testAccountId } });
    await prisma.unit.deleteMany({ where: { accountId: testAccountId } });
    await prisma.property.deleteMany({ where: { accountId: testAccountId } });
    await app.close();
  });

  describe('US3.1: Create Tenant', () => {
    it('should create tenant with all fields', async () => {
      const createDto = {
        name: 'יוסי כהן',
        email: 'yossi@example.com',
        phone: '050-1234567',
        notes: 'דייר מצוין',
      };

      const response = await request(app.getHttpServer())
        .post(API_URL)
        .send(createDto)
        .expect(201);

      expect(response.body).toMatchObject({
        name: createDto.name,
        email: createDto.email,
        phone: createDto.phone,
        notes: createDto.notes,
        accountId: testAccountId,
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });

    it('should create tenant with only required name field', async () => {
      const createDto = {
        name: 'דני לוי',
      };

      const response = await request(app.getHttpServer())
        .post(API_URL)
        .send(createDto)
        .expect(201);

      expect(response.body.name).toBe(createDto.name);
      expect(response.body.email).toBeNull();
      expect(response.body.phone).toBeNull();
    });

    it('should reject tenant with name less than 2 characters', async () => {
      const createDto = {
        name: 'א',
      };

      await request(app.getHttpServer())
        .post(API_URL)
        .send(createDto)
        .expect(400);
    });

    it('should reject tenant with invalid email format', async () => {
      const createDto = {
        name: 'יוסי כהן',
        email: 'invalid-email',
      };

      await request(app.getHttpServer())
        .post(API_URL)
        .send(createDto)
        .expect(400);
    });

    it('should reject duplicate email in same account', async () => {
      const createDto = {
        name: 'יוסי כהן',
        email: 'duplicate@example.com',
      };

      await request(app.getHttpServer())
        .post(API_URL)
        .send(createDto)
        .expect(201);

      // Try to create another tenant with same email
      await request(app.getHttpServer())
        .post(API_URL)
        .send({ ...createDto, name: 'אחר' })
        .expect(409);
    });
  });

  describe('US3.2: View All Tenants', () => {
    let tenant1Id: string;
    let tenant2Id: string;

    beforeAll(async () => {
      // Create test tenants
      const tenant1 = await prisma.tenant.create({
        data: {
          accountId: testAccountId,
          name: 'אבי ישראלי',
          email: 'avi@example.com',
          phone: '050-1111111',
        },
      });
      tenant1Id = tenant1.id;

      const tenant2 = await prisma.tenant.create({
        data: {
          accountId: testAccountId,
          name: 'בני כהן',
          email: 'beni@example.com',
          phone: '050-2222222',
        },
      });
      tenant2Id = tenant2.id;
    });

    it('should return all tenants for account', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      
      const tenantNames = response.body.map((t: any) => t.name);
      expect(tenantNames).toContain('אבי ישראלי');
      expect(tenantNames).toContain('בני כהן');
    });

    it('should include lease count in response', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .expect(200);

      const tenant = response.body.find((t: any) => t.id === tenant1Id);
      expect(tenant).toBeDefined();
      expect(Array.isArray(tenant.leases)).toBe(true);
    });

    it('should return tenants sorted alphabetically by name', async () => {
      const response = await request(app.getHttpServer())
        .get(API_URL)
        .expect(200);

      const tenants = response.body;
      for (let i = 0; i < tenants.length - 1; i++) {
        const current = tenants[i].name.toLowerCase();
        const next = tenants[i + 1].name.toLowerCase();
        expect(current <= next).toBe(true);
      }
    });
  });

  describe('US3.3: Edit Tenant Details', () => {
    let tenantId: string;

    beforeAll(async () => {
      const tenant = await prisma.tenant.create({
        data: {
          accountId: testAccountId,
          name: 'גיל דוד',
          email: 'gil@example.com',
          phone: '050-3333333',
        },
      });
      tenantId = tenant.id;
    });

    it('should update tenant name', async () => {
      const updateDto = {
        name: 'גיל דוד - מעודכן',
      };

      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${tenantId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.name).toBe(updateDto.name);
      expect(response.body.updatedAt).toBeDefined();
    });

    it('should update tenant email', async () => {
      const updateDto = {
        email: 'gil.updated@example.com',
      };

      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${tenantId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.email).toBe(updateDto.email);
    });

    it('should update tenant phone', async () => {
      const updateDto = {
        phone: '050-9999999',
      };

      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${tenantId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.phone).toBe(updateDto.phone);
    });

    it('should update tenant notes', async () => {
      const updateDto = {
        notes: 'הערות מעודכנות',
      };

      const response = await request(app.getHttpServer())
        .patch(`${API_URL}/${tenantId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.notes).toBe(updateDto.notes);
    });

    it('should reject update with invalid email', async () => {
      const updateDto = {
        email: 'invalid-email',
      };

      await request(app.getHttpServer())
        .patch(`${API_URL}/${tenantId}`)
        .send(updateDto)
        .expect(400);
    });

    it('should reject update with duplicate email', async () => {
      // Create another tenant
      const otherTenant = await prisma.tenant.create({
        data: {
          accountId: testAccountId,
          name: 'אחר',
          email: 'other@example.com',
        },
      });

      // Try to update first tenant with same email
      await request(app.getHttpServer())
        .patch(`${API_URL}/${tenantId}`)
        .send({ email: 'other@example.com' })
        .expect(409);

      // Cleanup
      await prisma.tenant.delete({ where: { id: otherTenant.id } });
    });

    it('should return 404 for non-existent tenant', async () => {
      await request(app.getHttpServer())
        .patch(`${API_URL}/00000000-0000-0000-0000-000000000000`)
        .send({ name: 'Test' })
        .expect(404);
    });
  });

  describe('US3.4: Delete Tenant', () => {
    let tenantWithLeaseId: string;
    let tenantWithoutLeaseId: string;

    beforeAll(async () => {
      // Create tenant with active lease
      const tenantWithLease = await prisma.tenant.create({
        data: {
          accountId: testAccountId,
          name: 'דייר עם חוזה',
          email: 'withlease@example.com',
        },
      });
      tenantWithLeaseId = tenantWithLease.id;

      await prisma.lease.create({
        data: {
          accountId: testAccountId,
          tenantId: tenantWithLeaseId,
          unitId: testUnitId,
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-12-31'),
          monthlyRent: 5000,
          paymentTo: 'OWNER',
          status: LeaseStatus.ACTIVE,
        },
      });

      // Create tenant without lease
      const tenantWithoutLease = await prisma.tenant.create({
        data: {
          accountId: testAccountId,
          name: 'דייר בלי חוזה',
          email: 'withoutlease@example.com',
        },
      });
      tenantWithoutLeaseId = tenantWithoutLease.id;
    });

    it('should delete tenant without active leases', async () => {
      await request(app.getHttpServer())
        .delete(`${API_URL}/${tenantWithoutLeaseId}`)
        .expect(200);

      // Verify tenant is deleted
      await request(app.getHttpServer())
        .get(`${API_URL}/${tenantWithoutLeaseId}`)
        .expect(404);
    });

    it('should reject deletion of tenant with active leases', async () => {
      const response = await request(app.getHttpServer())
        .delete(`${API_URL}/${tenantWithLeaseId}`)
        .expect(409);

      expect(response.body.message).toContain('active');
    });

    it('should return 404 for non-existent tenant', async () => {
      await request(app.getHttpServer())
        .delete(`${API_URL}/00000000-0000-0000-0000-000000000000`)
        .expect(404);
    });
  });

  describe('US3.5: Search Tenants', () => {
    beforeAll(async () => {
      // Create test tenants for search
      await prisma.tenant.createMany({
        data: [
          {
            accountId: testAccountId,
            name: 'יוסי כהן',
            email: 'yossi.cohen@example.com',
            phone: '050-1111111',
          },
          {
            accountId: testAccountId,
            name: 'יוסי לוי',
            email: 'yossi.levi@example.com',
            phone: '050-2222222',
          },
          {
            accountId: testAccountId,
            name: 'דני כהן',
            email: 'dani@example.com',
            phone: '050-3333333',
          },
        ],
      });
    });

    it('should search tenants by name (partial match)', async () => {
      const searchTerm = encodeURIComponent('יוסי');
      const response = await request(app.getHttpServer())
        .get(`${API_URL}?search=${searchTerm}`)
        .expect(200);

      expect(response.body.length).toBeGreaterThanOrEqual(2);
      response.body.forEach((tenant: any) => {
        expect(tenant.name).toContain('יוסי');
      });
    });

    it('should search tenants by email (partial match)', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API_URL}?search=cohen`)
        .expect(200);

      expect(response.body.length).toBeGreaterThanOrEqual(1);
      response.body.forEach((tenant: any) => {
        expect(tenant.email?.toLowerCase()).toContain('cohen');
      });
    });

    it('should search tenants by phone (partial match)', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API_URL}?search=1111111`)
        .expect(200);

      expect(response.body.length).toBeGreaterThanOrEqual(1);
      response.body.forEach((tenant: any) => {
        expect(tenant.phone).toContain('1111111');
      });
    });

    it('should return empty array for no matches', async () => {
      const searchTerm = encodeURIComponent('לא קיים');
      const response = await request(app.getHttpServer())
        .get(`${API_URL}?search=${searchTerm}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all tenants when search is empty', async () => {
      const allResponse = await request(app.getHttpServer())
        .get(API_URL)
        .expect(200);

      const searchResponse = await request(app.getHttpServer())
        .get(`${API_URL}?search=`)
        .expect(200);

      expect(searchResponse.body.length).toBe(allResponse.body.length);
    });

    it('should be case-insensitive', async () => {
      const lowerResponse = await request(app.getHttpServer())
        .get(`${API_URL}?search=yossi`)
        .expect(200);

      const upperResponse = await request(app.getHttpServer())
        .get(`${API_URL}?search=YOSSI`)
        .expect(200);

      expect(lowerResponse.body.length).toBe(upperResponse.body.length);
    });
  });

  describe('US3.6: View Tenant Lease History', () => {
    let tenantId: string;
    let lease1Id: string;
    let lease2Id: string;

    beforeAll(async () => {
      // Create tenant
      const tenant = await prisma.tenant.create({
        data: {
          accountId: testAccountId,
          name: 'דייר עם היסטוריה',
          email: 'history@example.com',
        },
      });
      tenantId = tenant.id;

      // Create multiple leases
      const lease1 = await prisma.lease.create({
        data: {
          accountId: testAccountId,
          tenantId: tenantId,
          unitId: testUnitId,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          monthlyRent: 4000,
          paymentTo: 'OWNER',
          status: LeaseStatus.EXPIRED,
        },
      });
      lease1Id = lease1.id;

      const lease2 = await prisma.lease.create({
        data: {
          accountId: testAccountId,
          tenantId: tenantId,
          unitId: testUnitId,
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-12-31'),
          monthlyRent: 5000,
          paymentTo: 'OWNER',
          status: LeaseStatus.ACTIVE,
        },
      });
      lease2Id = lease2.id;
    });

    it('should return tenant with lease history', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API_URL}/${tenantId}`)
        .expect(200);

      expect(response.body.id).toBe(tenantId);
      expect(response.body.name).toBe('דייר עם היסטוריה');
      expect(Array.isArray(response.body.leases)).toBe(true);
      expect(response.body.leases.length).toBeGreaterThanOrEqual(2);
    });

    it('should include unit and property in lease data', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API_URL}/${tenantId}`)
        .expect(200);

      const lease = response.body.leases[0];
      expect(lease.unit).toBeDefined();
      expect(lease.unit.id).toBe(testUnitId);
      expect(lease.unit.property).toBeDefined();
      expect(lease.unit.property.id).toBe(testPropertyId);
      expect(lease.unit.property.address).toBeDefined();
    });

    it('should include all lease fields', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API_URL}/${tenantId}`)
        .expect(200);

      const lease = response.body.leases.find((l: any) => l.id === lease2Id);
      expect(lease).toBeDefined();
      expect(lease.startDate).toBeDefined();
      expect(lease.endDate).toBeDefined();
      // monthlyRent is Decimal type, returned as string
      expect(Number(lease.monthlyRent)).toBe(5000);
      expect(lease.status).toBe(LeaseStatus.ACTIVE);
    });

    it('should return 404 for non-existent tenant', async () => {
      await request(app.getHttpServer())
        .get(`${API_URL}/00000000-0000-0000-0000-000000000000`)
        .expect(404);
    });
  });
});
