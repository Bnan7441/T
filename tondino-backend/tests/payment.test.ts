import request from 'supertest';
import app from '../src/server';
import pool from '../src/config/database';

// Skip tests if required environment variables are not set
const shouldRun = process.env.DATABASE_URL && process.env.JWT_SECRET;
const describeIf = shouldRun ? describe : describe.skip;

describeIf('Payment Integration Tests', () => {
  let authToken: string;
  let testUserId: number;
  const testEmail = `payment_test_${Date.now()}@example.com`;
  const password = 'paymentTest123!';

  beforeAll(async () => {
    // Register and authenticate test user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password,
        name: 'Payment Test User'
      });
    
    // authToken = registerRes.body.token;
    const cookies = registerRes.headers['set-cookie'];
    if (Array.isArray(cookies)) {
      authToken = cookies.find((c: string) => c.startsWith('auth_token=')) || '';
    }
    
    // Get user ID
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [testEmail]);
    testUserId = userResult.rows[0].id;
  });

  afterAll(async () => {
    // Cleanup test data
    if (testUserId) {
      await pool.query('DELETE FROM payment_intents WHERE user_id = $1', [testUserId]);
      await pool.query('DELETE FROM user_courses WHERE user_id = $1', [testUserId]);
      await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
    }
  });

  describe('POST /api/payment/create-intent', () => {
    test('should create payment intent for valid course', async () => {
      // Get a paid course
      const courseResult = await pool.query(
        'SELECT course_id, price FROM courses WHERE is_free = false AND is_active = true LIMIT 1'
      );
      
      if (courseResult.rows.length === 0) {
        console.log('No paid courses available for testing');
        return;
      }

      const course = courseResult.rows[0];
      const price = typeof course.price === 'string' ? parseFloat(course.price) : Number(course.price);

      const res = await request(app)
        .post('/api/payment/create-intent')
        .set('Cookie', [authToken])
        .send({
          courseId: course.course_id,
          amount: price,
          currency: 'usd'
        });

      // If Stripe is not configured, should return error
      if (!process.env.STRIPE_SECRET_KEY) {
        expect(res.status).toBe(400);
        expect(res.body.error).toContain('not configured');
      } else {
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.paymentIntent).toBeDefined();
        expect(res.body.paymentIntent.clientSecret).toBeDefined();
      }
    });

    test('should reject payment intent without authentication', async () => {
      const res = await request(app)
        .post('/api/payment/create-intent')
        .send({
          courseId: 'course-1',
          amount: 99.99
        });

      expect(res.status).toBe(401);
    });

    test('should reject payment intent with invalid amount', async () => {
      const res = await request(app)
        .post('/api/payment/create-intent')
        .set('Cookie', [authToken])
        .send({
          courseId: 'course-1',
          amount: -10
        });

      expect(res.status).toBe(422);
      expect(res.body.error).toBeDefined();
    });

    test('should reject payment intent for non-existent course', async () => {
      const res = await request(app)
        .post('/api/payment/create-intent')
        .set('Cookie', [authToken])
        .send({
          courseId: 'non-existent-course',
          amount: 99.99
        });

      expect(res.status).toBe(400);
    });

    test('should reject payment intent for already purchased course', async () => {
      // Get a course
      const courseResult = await pool.query(
        'SELECT id, course_id FROM courses WHERE is_active = true LIMIT 1'
      );
      
      if (courseResult.rows.length === 0) {
        return;
      }

      const course = courseResult.rows[0];

      // Create a purchase record
      await pool.query(
        'INSERT INTO user_courses (user_id, course_id, payment_amount, payment_status) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
        [testUserId, course.id, 99.99, 'completed']
      );

      const res = await request(app)
        .post('/api/payment/create-intent')
        .set('Cookie', [authToken])
        .send({
          courseId: course.course_id,
          amount: 99.99
        });

      expect(res.status).toBe(400);
      // If Stripe not configured, it returns "Payment provider not configured"
      // If configured, it should return "already purchased"
      expect(res.body.error).toMatch(/already purchased|not configured/);
    });
  });

  describe('GET /api/payment/status/:paymentIntentId', () => {
    test('should reject status check without authentication', async () => {
      const res = await request(app)
        .get('/api/payment/status/pi_test123');

      expect(res.status).toBe(401);
    });

    test('should handle invalid payment intent ID', async () => {
      const res = await request(app)
        .get('/api/payment/status/invalid_id')
        .set('Cookie', [authToken]);

      // Stripe not configured or invalid ID
      expect([400, 500]).toContain(res.status);
    });
  });

  describe('POST /api/payment/webhook', () => {
    test('should reject webhook without signature', async () => {
      const res = await request(app)
        .post('/api/payment/webhook')
        .send({
          type: 'payment_intent.succeeded',
          data: {}
        });

      expect(res.status).toBe(400);
      expect(res.text).toContain('Missing signature');
    });

    test('should reject webhook with invalid signature', async () => {
      const res = await request(app)
        .post('/api/payment/webhook')
        .set('stripe-signature', 'invalid_signature')
        .send({
          type: 'payment_intent.succeeded',
          data: {}
        });

      expect(res.status).toBe(400);
      expect(res.text).toContain('Invalid signature');
    });
  });

  describe('POST /api/courses/purchase/:courseId (free courses)', () => {
    test('should allow direct enrollment for free courses', async () => {
      // Get a free course
      const courseResult = await pool.query(
        'SELECT course_id FROM courses WHERE is_free = true AND is_active = true LIMIT 1'
      );
      
      if (courseResult.rows.length === 0) {
        console.log('No free courses available for testing');
        return;
      }

      const course = courseResult.rows[0];

      const res = await request(app)
        .post(`/api/courses/purchase/${course.course_id}`)
        .set('Cookie', [authToken]);

      expect([200, 400]).toContain(res.status); // 400 if already enrolled
      
      if (res.status === 200) {
        expect(res.body.message).toContain('enrolled');
        expect(res.body.course).toBeDefined();
      }
    });

    test('should reject direct purchase for paid courses', async () => {
      // Get a paid course
      const courseResult = await pool.query(
        `SELECT c.course_id
         FROM courses c
         LEFT JOIN user_courses uc
           ON uc.course_id = c.id AND uc.user_id = $1
         WHERE c.is_free = false AND c.is_active = true
           AND uc.id IS NULL
         LIMIT 1`,
        [testUserId]
      );
      
      if (courseResult.rows.length === 0) {
        console.log('No unpaid paid-courses available for testing');
        return;
      }

      const course = courseResult.rows[0];

      const res = await request(app)
        .post(`/api/courses/purchase/${course.course_id}`)
        .set('Cookie', [authToken]);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Payment required');
      expect(res.body.hint).toContain('/api/payment/create-intent');
    });
  });
});

if (!shouldRun) {
  console.log('⚠️  Payment tests skipped: DATABASE_URL or JWT_SECRET not set');
}
