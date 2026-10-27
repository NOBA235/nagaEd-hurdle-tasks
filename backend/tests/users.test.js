import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import { env } from '../src/config/env.js';
import { pool, closeDatabasePool } from '../src/config/database.js';

describe('Protected User API Endpoints (GET /api/users/:id)', () => {
  let isDbAvailable = false;
  let testUserId = null;
  let testUserToken = null;
  const uniqueId = Date.now();

  before(async () => {
    try {
      const conn = await pool.getConnection();
      await conn.ping();
      conn.release();
      isDbAvailable = true;

      // Register a test user for live DB tests
      const regRes = await request(app)
        .post('/api/register')
        .send({
          username: `user_${uniqueId}`,
          email: `profile_${uniqueId}@example.com`,
          password: 'StrongPassword123!',
          address: 'Dimapur, Nagaland',
        });

      if (regRes.status === 201) {
        testUserId = regRes.body.data.id;
        // Generate valid token for this user
        testUserToken = jwt.sign(
          {
            sub: String(testUserId),
            id: testUserId,
            username: `user_${uniqueId}`,
            email: `profile_${uniqueId}@example.com`,
          },
          env.JWT_SECRET,
          { algorithm: 'HS256', expiresIn: '1h' }
        );
      }
    } catch {
      isDbAvailable = false;
    }
  });

  after(async () => {
    if (isDbAvailable) {
      try {
        await pool.execute('DELETE FROM users WHERE email LIKE "profile_%"');
      } catch (err) {
        console.error('Error cleaning up test profile user:', err.message);
      }
    }
    await closeDatabasePool();
  });

  describe('Authentication & Token Verification (HTTP 401)', () => {
    it('should return 401 when Authorization header is missing', async () => {
      const res = await request(app).get('/api/users/1').expect(401);

      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'UNAUTHORIZED');
      assert.match(res.body.error.message, /missing Authorization header/i);
    });

    it('should return 401 when Authorization scheme is not Bearer', async () => {
      const res = await request(app)
        .get('/api/users/1')
        .set('Authorization', 'Basic dXNlcjpwYXNz')
        .expect(401);

      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'UNAUTHORIZED');
    });

    it('should return 401 when Bearer token is malformed', async () => {
      const res = await request(app)
        .get('/api/users/1')
        .set('Authorization', 'Bearer this.is.not.a.valid.jwt')
        .expect(401);

      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'INVALID_TOKEN');
    });

    it('should return 401 when token was signed with a different secret', async () => {
      const fakeToken = jwt.sign(
        { sub: '1', id: 1, email: 'fake@example.com' },
        'wrong_secret_wrong_secret_wrong_secret_32char',
        { algorithm: 'HS256', expiresIn: '1h' }
      );

      const res = await request(app)
        .get('/api/users/1')
        .set('Authorization', `Bearer ${fakeToken}`)
        .expect(401);

      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'INVALID_TOKEN');
    });

    it('should return 401 when token is expired', async () => {
      const expiredToken = jwt.sign(
        { sub: '1', id: 1, email: 'expired@example.com' },
        env.JWT_SECRET,
        { algorithm: 'HS256', expiresIn: '-10s' } // Expired in past
      );

      const res = await request(app)
        .get('/api/users/1')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'TOKEN_EXPIRED');
      assert.match(res.body.error.message, /expired/i);
    });
  });

  describe('Route Parameter Validation (HTTP 400)', () => {
    it('should return 400 when user ID parameter is not numeric', async () => {
      const validToken = jwt.sign(
        { sub: '1', id: 1, email: 'user@example.com' },
        env.JWT_SECRET,
        { algorithm: 'HS256', expiresIn: '1h' }
      );

      const res = await request(app)
        .get('/api/users/abc')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(400);

      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
      const idIssue = res.body.error.details.find((d) => d.field === 'id');
      assert.ok(idIssue);
    });

    it('should return 400 when user ID parameter is negative or zero', async () => {
      const validToken = jwt.sign(
        { sub: '1', id: 1, email: 'user@example.com' },
        env.JWT_SECRET,
        { algorithm: 'HS256', expiresIn: '1h' }
      );

      const res = await request(app)
        .get('/api/users/0')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(400);

      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
    });
  });

  describe('Authorisation & Ownership Control (HTTP 403)', () => {
    it('should return 403 Forbidden when authenticated user tries to view another user profile', async () => {
      // User 1 requests User 2's profile
      const user1Token = jwt.sign(
        { sub: '1', id: 1, username: 'user1', email: 'user1@example.com' },
        env.JWT_SECRET,
        { algorithm: 'HS256', expiresIn: '1h' }
      );

      const res = await request(app)
        .get('/api/users/2')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(403);

      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'FORBIDDEN');
      assert.match(res.body.error.message, /not authorised/i);
    });
  });

  describe('Live Database User Retrieval (HTTP 200 & HTTP 404)', () => {
    it('should return 200 and user data excluding password hash for own profile', async (t) => {
      if (!isDbAvailable || !testUserId || !testUserToken) {
        t.skip('MySQL database is not running locally');
        return;
      }

      const res = await request(app)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.message, 'User profile retrieved successfully');
      assert.strictEqual(res.body.data.id, testUserId);
      assert.strictEqual(res.body.data.address, 'Dimapur, Nagaland');
      assert.strictEqual(res.body.data.password, undefined);
      assert.strictEqual(res.body.data.password_hash, undefined);
    });

    it('should return 404 USER_NOT_FOUND when user ID does not exist in database', async (t) => {
      if (!isDbAvailable) {
        t.skip('MySQL database is not running locally');
        return;
      }

      const nonExistentId = 999999;
      const ghostToken = jwt.sign(
        {
          sub: String(nonExistentId),
          id: nonExistentId,
          email: 'ghost@example.com',
        },
        env.JWT_SECRET,
        { algorithm: 'HS256', expiresIn: '1h' }
      );

      const res = await request(app)
        .get(`/api/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${ghostToken}`)
        .expect(404);

      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'USER_NOT_FOUND');
    });
  });

  describe('404 Route Not Found', () => {
    it('should return 404 JSON for non-existent route', async () => {
      const res = await request(app).get('/api/nonexistent-route').expect(404);

      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'NOT_FOUND');
    });
  });
});

