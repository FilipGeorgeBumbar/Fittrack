import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { app } from '../src/index.js';
import { ensureRolesAndPermissions } from '../src/auth/roles.js';
import { hashPassword } from '../src/auth/password.js';

const prisma = new PrismaClient();
const TEST_EMAIL = 'bronze-test@fittrack.test';
const TEST_PASSWORD = 'testpass123';

describe('Auth API (Bronze)', () => {
  beforeAll(async () => {
    await ensureRolesAndPermissions();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
    await prisma.$disconnect();
  });

  describe('POST /auth/register', () => {
    it('registers a Normal User and returns a JWT', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          name: 'Bronze Tester',
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
          roleName: 'Normal User',
        });

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(TEST_EMAIL);
      expect(res.body.user.password).toBeUndefined();
      expect(res.body.user.role.name).toBe('Normal User');
      expect(res.body.expiresIn).toBeGreaterThan(0);
    });

    it('rejects duplicate email', async () => {
      await request(app).post('/auth/register').send({
        name: 'First',
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        roleName: 'Normal User',
      });

      const res = await request(app).post('/auth/register').send({
        name: 'Second',
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        roleName: 'Normal User',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/already exists/i);
    });

    it('rejects missing fields', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ email: TEST_EMAIL });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      const roles = await ensureRolesAndPermissions();
      await prisma.user.create({
        data: {
          name: 'Login Tester',
          email: TEST_EMAIL,
          password: await hashPassword(TEST_PASSWORD),
          roleId: roles['Normal User'].id,
        },
      });
    });

    it('logs in with valid credentials and returns JWT', async () => {
      const res = await request(app).post('/auth/login').send({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        roleName: 'Normal User',
      });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role.name).toBe('Normal User');
    });

    it('rejects wrong password', async () => {
      const res = await request(app).post('/auth/login').send({
        email: TEST_EMAIL,
        password: 'wrong',
        roleName: 'Normal User',
      });

      expect(res.status).toBe(401);
    });

    it('rejects wrong role', async () => {
      const res = await request(app).post('/auth/login').send({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        roleName: 'Admin',
      });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /auth/me and POST /auth/refresh', () => {
    let token;

    beforeEach(async () => {
      const reg = await request(app).post('/auth/register').send({
        name: 'Me Tester',
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        roleName: 'Normal User',
      });
      token = reg.body.token;
    });

    it('returns current user with valid token', async () => {
      const res = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(TEST_EMAIL);
    });

    it('rejects requests without token', async () => {
      const res = await request(app).get('/auth/me');
      expect(res.status).toBe(401);
    });

    it('refreshes session token', async () => {
      const res = await request(app)
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });
  });
});
