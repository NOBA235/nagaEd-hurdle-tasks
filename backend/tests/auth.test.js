import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { pool, closeDatabasePool } from '../src/config/database.js';

describe('Auth API Endpoints (/api/register, /api/login)', () => {
  let isDbAvailable = false;
  const uniqueId = Date.now();
  const testUser = {
    username: `testuser_${uniqueId}`,
    email: `test_${uniqueId}@example.com`,
    password: 'StrongPassword123!',
    address: 'Kohima, Nagaland',
  };

  before(async () => {
    try {
      const conn = await pool.getConnection();
      await conn.ping();
      conn.release();
      isDbAvailable = true;
    } catch {
      isDbAvailable = false;
      console.warn(
        '\n[NOTICE] MySQL 8 is not running locally. Live DB tests will be skipped, but all validation and security tests will run.'
      );
    }
  });

  after(async () => {
    if (isDbAvailable) {
      try {
        await pool.execute('DELETE FROM users WHERE email LIKE "test_%"');
      } catch (err) {
        console.error('Error cleaning up test users:', err.message);
      }
    }
    await closeDatabasePool();
  });

  describe('POST /api/register — Validation Failures', () => {
    it('should return 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
      assert.ok(Array.isArray(res.body.error.details));
      assert.ok(res.body.error.details.length >= 4);
    });

    it('should return 400 when email format is invalid', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({
          username: 'validuser',
          email: 'not-an-email',
          password: 'StrongPassword123!',
          address: 'Kohima',
        })
        .expect(400);

      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
      const emailIssue = res.body.error.details.find((d) => d.field === 'email');
      assert.ok(emailIssue, 'Expected validation error on email field');
    });

    it('should return 400 when password is shorter than 8 characters', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({
          username: 'validuser',
          email: 'user@example.com',
          password: 'short',
          address: 'Kohima',
        })
        .expect(400);

      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
      const pwdIssue = res.body.error.details.find((d) => d.field === 'password');
      assert.ok(pwdIssue, 'Expected validation error on password field');
    });

    it('should return 400 when username is shorter than 2 characters', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({
          username: 'a',
          email: 'user@example.com',
          password: 'StrongPassword123!',
          address: 'Kohima',
        })
        .expect(400);

      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
      const userIssue = res.body.error.details.find((d) => d.field === 'username');
      assert.ok(userIssue, 'Expected validation error on username field');
    });
  });

  describe('POST /api/login — Validation Failures', () => {
    it('should return 400 when email is invalid in login body', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);

      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
    });

    it('should return 400 when password is missing in login body', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          email: 'user@example.com',
        })
        .expect(400);

      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
    });
  });

  describe('POST /api/register & /api/login — Live Database Flow', () => {
    it('should register a new user successfully with HTTP 201 and never return password hash', async (t) => {
      if (!isDbAvailable) {
        t.skip('MySQL database is not running locally');
        return;
      }

      const res = await request(app)
        .post('/api/register')
        .send(testUser)
        .expect(201);

      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.message, 'Registration successful');
      assert.ok(res.body.data.id);
      assert.strictEqual(res.body.data.username, testUser.username);
      assert.strictEqual(res.body.data.email, testUser.email.toLowerCase());
      assert.strictEqual(res.body.data.address, testUser.address);
      assert.strictEqual(res.body.data.password, undefined);
      assert.strictEqual(res.body.data.password_hash, undefined);
    });

    it('should reject duplicate email registration with HTTP 409 Conflict', async (t) => {
      if (!isDbAvailable) {
        t.skip('MySQL database is not running locally');
        return;
      }

      // Try registering the exact same email (even with uppercase letters)
      const res = await request(app)
        .post('/api/register')
        .send({
          ...testUser,
          username: 'another_name',
          email: testUser.email.toUpperCase(),
        })
        .expect(409);

      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'EMAIL_ALREADY_EXISTS');
    });

    it('should authenticate registered user via POST /api/login and return JWT token', async (t) => {
      if (!isDbAvailable) {
        t.skip('MySQL database is not running locally');
        return;
      }

      const res = await request(app)
        .post('/api/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.message, 'Login successful');
      assert.ok(typeof res.body.data.token === 'string');
      assert.ok(res.body.data.token.length > 20);
      assert.strictEqual(res.body.data.user.email, testUser.email);
      assert.strictEqual(res.body.data.user.password, undefined);
      assert.strictEqual(res.body.data.user.password_hash, undefined);
    });

    it('should return HTTP 401 on login with incorrect password', async (t) => {
      if (!isDbAvailable) {
        t.skip('MySQL database is not running locally');
        return;
      }

      const res = await request(app)
        .post('/api/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword999!',
        })
        .expect(401);

      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'INVALID_CREDENTIALS');
      assert.strictEqual(res.body.error.message, 'Invalid email or password');
    });

    it('should return HTTP 401 on login with non-existent email', async (t) => {
      if (!isDbAvailable) {
        t.skip('MySQL database is not running locally');
        return;
      }

      const res = await request(app)
        .post('/api/login')
        .send({
          email: 'completely_unknown_9999@example.com',
          password: 'AnyPassword123!',
        })
        .expect(401);

      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'INVALID_CREDENTIALS');
      // Must not reveal whether email exists
      assert.strictEqual(res.body.error.message, 'Invalid email or password');
    });
  });
});

