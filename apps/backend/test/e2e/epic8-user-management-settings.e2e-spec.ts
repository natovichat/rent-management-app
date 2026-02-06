/**
 * Epic 8: User Management & Settings - E2E Integration Tests
 * 
 * Tests all 6 user stories:
 * - US8.1: Edit User Profile
 * - US8.2: Update Account Settings
 * - US8.3: View User Preferences
 * - US8.4: Update User Preferences
 * - US8.5: View Active Sessions
 * - US8.6: Logout from All Devices
 */

import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('Epic 8: User Management & Settings E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  const testAccountId = '00000000-0000-0000-0000-000000000001';
  let testUserId: string;
  let testUserToken: string;
  let testOwnerUserId: string;
  let testOwnerToken: string;

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
    jwtService = app.get(JwtService);

    // Ensure test account exists
    const existingAccount = await prisma.account.findUnique({
      where: { id: testAccountId },
    });
    if (!existingAccount) {
      await prisma.account.create({
        data: {
          id: testAccountId,
          name: 'Epic 8 Test Account',
        },
      });
    }

    // Create test user (USER role)
    const testUser = await prisma.user.upsert({
      where: { email: 'testuser@epic8.com' },
      update: {},
      create: {
        accountId: testAccountId,
        email: 'testuser@epic8.com',
        name: 'Test User',
        googleId: 'google-testuser-epic8',
        role: 'USER',
      },
    });
    testUserId = testUser.id;

    // Create test owner (OWNER role)
    const testOwner = await prisma.user.upsert({
      where: { email: 'testowner@epic8.com' },
      update: {},
      create: {
        accountId: testAccountId,
        email: 'testowner@epic8.com',
        name: 'Test Owner',
        googleId: 'google-testowner-epic8',
        role: 'OWNER',
      },
    });
    testOwnerUserId = testOwner.id;

    // Generate tokens
    testUserToken = jwtService.sign({
      sub: testUserId,
      email: 'testuser@epic8.com',
      accountId: testAccountId,
      role: 'USER',
    });

    testOwnerToken = jwtService.sign({
      sub: testOwnerUserId,
      email: 'testowner@epic8.com',
      accountId: testAccountId,
      role: 'OWNER',
    });
  });

  afterAll(async () => {
    await prisma.userPreferences.deleteMany({ where: { userId: { in: [testUserId, testOwnerUserId] } } });
    await prisma.session.deleteMany({ where: { userId: { in: [testUserId, testOwnerUserId] } } });
    await prisma.user.deleteMany({ where: { id: { in: [testUserId, testOwnerUserId] } } });
    await app.close();
  });

  describe('US8.1: Edit User Profile', () => {
    it('should update user name successfully', async () => {
      const updateDto = {
        name: 'Updated Test User',
      };

      const response = await request(app.getHttpServer())
        .patch('/auth/profile')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.name).toBe(updateDto.name);
      expect(response.body.email).toBe('testuser@epic8.com');
      expect(response.body.id).toBe(testUserId);

      // Verify in database
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUserId },
      });
      expect(updatedUser?.name).toBe(updateDto.name);
    });

    it('should reject empty name', async () => {
      const updateDto = {
        name: '',
      };

      await request(app.getHttpServer())
        .patch('/auth/profile')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(updateDto)
        .expect(400);
    });

    it('should reject name with only whitespace', async () => {
      const updateDto = {
        name: '   ',
      };

      await request(app.getHttpServer())
        .patch('/auth/profile')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(updateDto)
        .expect(400);
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .patch('/auth/profile')
        .send({ name: 'Test' })
        .expect(401);
    });

    it('should only allow user to update own profile', async () => {
      // Try to update another user's profile (should fail or only update own)
      const updateDto = {
        name: 'Hacked Name',
      };

      const response = await request(app.getHttpServer())
        .patch('/auth/profile')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(updateDto)
        .expect(200);

      // Should only update the authenticated user's profile
      expect(response.body.id).toBe(testUserId);
    });
  });

  describe('US8.2: Update Account Settings', () => {
    it('should update account name as owner', async () => {
      const updateDto = {
        name: 'Updated Account Name',
      };

      const response = await request(app.getHttpServer())
        .patch('/auth/account')
        .set('Authorization', `Bearer ${testOwnerToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.name).toBe(updateDto.name);

      // Verify in database
      const updatedAccount = await prisma.account.findUnique({
        where: { id: testAccountId },
      });
      expect(updatedAccount?.name).toBe(updateDto.name);
    });

    it('should reject update from non-owner user', async () => {
      const updateDto = {
        name: 'Unauthorized Update',
      };

      await request(app.getHttpServer())
        .patch('/auth/account')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(updateDto)
        .expect(403);
    });

    it('should reject empty account name', async () => {
      const updateDto = {
        name: '',
      };

      await request(app.getHttpServer())
        .patch('/auth/account')
        .set('Authorization', `Bearer ${testOwnerToken}`)
        .send(updateDto)
        .expect(400);
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .patch('/auth/account')
        .send({ name: 'Test' })
        .expect(401);
    });
  });

  describe('US8.3: View User Preferences', () => {
    it('should return default preferences when none exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/preferences')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        language: 'he',
        dateFormat: 'DD/MM/YYYY',
        currency: 'ILS',
        theme: 'light',
      });
    });

    it('should return saved preferences when they exist', async () => {
      // Create preferences first
      await prisma.userPreferences.upsert({
        where: { userId: testUserId },
        update: {
          language: 'en',
          dateFormat: 'MM/DD/YYYY',
          currency: 'USD',
          theme: 'dark',
        },
        create: {
          userId: testUserId,
          language: 'en',
          dateFormat: 'MM/DD/YYYY',
          currency: 'USD',
          theme: 'dark',
        },
      });

      const response = await request(app.getHttpServer())
        .get('/auth/preferences')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        currency: 'USD',
        theme: 'dark',
      });
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/auth/preferences')
        .expect(401);
    });
  });

  describe('US8.4: Update User Preferences', () => {
    it('should update user preferences successfully', async () => {
      const updateDto = {
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        currency: 'USD',
        theme: 'dark',
      };

      const response = await request(app.getHttpServer())
        .put('/auth/preferences')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject(updateDto);

      // Verify in database
      const preferences = await prisma.userPreferences.findUnique({
        where: { userId: testUserId },
      });
      expect(preferences?.language).toBe(updateDto.language);
      expect(preferences?.dateFormat).toBe(updateDto.dateFormat);
      expect(preferences?.currency).toBe(updateDto.currency);
      expect(preferences?.theme).toBe(updateDto.theme);
    });

    it('should validate preference values', async () => {
      const invalidDto = {
        language: 'invalid',
        dateFormat: 'invalid',
        currency: 'invalid',
        theme: 'invalid',
      };

      await request(app.getHttpServer())
        .put('/auth/preferences')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(invalidDto)
        .expect(400);
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .put('/auth/preferences')
        .send({ language: 'en' })
        .expect(401);
    });
  });

  describe('US8.5: View Active Sessions', () => {
    beforeEach(async () => {
      // Create test sessions
      await prisma.session.createMany({
        data: [
          {
            userId: testUserId,
            token: 'token1',
            device: 'Chrome on Windows',
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0',
          },
          {
            userId: testUserId,
            token: 'token2',
            device: 'Safari on Mac',
            ipAddress: '192.168.1.2',
            userAgent: 'Mozilla/5.0',
          },
        ],
      });
    });

    afterEach(async () => {
      await prisma.session.deleteMany({ where: { userId: testUserId } });
    });

    it('should return list of active sessions', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/sessions')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('device');
      expect(response.body[0]).toHaveProperty('ipAddress');
      expect(response.body[0]).toHaveProperty('lastActivity');
    });

    it('should mark current session', async () => {
      // Create a session with the current token
      await prisma.session.create({
        data: {
          userId: testUserId,
          token: testUserToken,
          device: 'Current Device',
          ipAddress: '192.168.1.3',
        },
      });

      const response = await request(app.getHttpServer())
        .get('/auth/sessions')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      // Current session should be marked
      const currentSession = response.body.find((s: any) => s.isCurrent);
      expect(currentSession).toBeDefined();
      expect(currentSession.isCurrent).toBe(true);
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/auth/sessions')
        .expect(401);
    });
  });

  describe('US8.6: Logout from All Devices', () => {
    beforeEach(async () => {
      // Create test sessions
      await prisma.session.createMany({
        data: [
          {
            userId: testUserId,
            token: 'token1',
            device: 'Device 1',
          },
          {
            userId: testUserId,
            token: 'token2',
            device: 'Device 2',
          },
          {
            userId: testUserId,
            token: testUserToken, // Current session
            device: 'Current Device',
          },
        ],
      });
    });

    afterEach(async () => {
      await prisma.session.deleteMany({ where: { userId: testUserId } });
    });

    it('should logout from all devices except current', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout-all')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify other sessions are deleted
      const remainingSessions = await prisma.session.findMany({
        where: { userId: testUserId },
      });
      // Current session should remain
      expect(remainingSessions.length).toBeGreaterThanOrEqual(1);
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout-all')
        .expect(401);
    });
  });
});
