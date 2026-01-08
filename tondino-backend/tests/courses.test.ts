import request from 'supertest';
const app = require('../src/server').default || require('../src/server');

const runDB = !!process.env.DATABASE_URL && !!process.env.JWT_SECRET;
const describeIf = runDB ? describe : describe.skip;

describeIf('Courses API integration', () => {
  let token: string;
  const testEmail = `test+${Date.now()}@example.com`;
  const password = 'testpass123';

  beforeAll(async () => {
    // Register a fresh user for tests
    const res = await request(app).post('/api/auth/register').send({ email: testEmail, password, name: 'Test User' });
    expect([201, 400]).toContain(res.status); // allow 400 if email already exists
    
    // Check for cookie
    const cookies = res.headers['set-cookie'];
    if (Array.isArray(cookies)) {
      token = cookies.find((c: string) => c.startsWith('auth_token=')) || '';
    }

    if (!token) {
      // If already registered, login
      const loginRes = await request(app).post('/api/auth/login').send({ email: testEmail, password });
      expect(loginRes.status).toBe(200);
      
      const loginCookies = loginRes.headers['set-cookie'];
      if (Array.isArray(loginCookies)) {
        token = loginCookies.find((c: string) => c.startsWith('auth_token=')) || '';
      }
    }
  });

  test('GET /api/health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'OK');
  });

  test('GET /api/courses/stats returns stats object', async () => {
    const res = await request(app).get('/api/courses/stats').set('Cookie', [token]);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('stats');
    expect(res.body.stats).toHaveProperty('user_id');
  });

  test('Purchase flow: POST /api/courses/purchase/:courseId', async () => {
    // use a seeded course id from migrations: course-2 exists in schema
    const courseId = 'course-2';
    const purchaseRes = await request(app).post(`/api/courses/purchase/${courseId}`).set('Cookie', [token]);
    // Accept 200 or 400 in case already purchased by the test user
    expect([200, 400]).toContain(purchaseRes.status);
    if (purchaseRes.status === 200) {
      expect(purchaseRes.body).toHaveProperty('purchase');
      expect(purchaseRes.body.purchase).toHaveProperty('id');
    }
  });

  test('GET /api/courses/my-courses returns array', async () => {
    const res = await request(app).get('/api/courses/my-courses').set('Cookie', [token]);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('courses');
    expect(Array.isArray(res.body.courses)).toBe(true);
  });
});
