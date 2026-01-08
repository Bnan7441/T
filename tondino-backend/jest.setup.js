// Jest setup file for backend tests
// This file is run before each test file

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_for_testing_only';

// Increase timeout for database operations in tests
jest.setTimeout(30000);

// Mock console.log in tests unless explicitly needed
const originalLog = console.log;
beforeEach(() => {
  if (!process.env.DEBUG_TESTS) {
    console.log = jest.fn();
  }
});

afterEach(() => {
  if (!process.env.DEBUG_TESTS) {
    console.log = originalLog;
  }
});

// Global test helpers
global.testHelpers = {
  generateTestUser: () => ({
    email: `test_${Date.now()}_${Math.random()}@example.com`,
    password: 'testPassword123!',
    name: 'Test User'
  }),
  
  generateTestCourse: () => ({
    title: `Test Course ${Date.now()}`,
    description: 'A test course for testing purposes',
    price: 99.99,
    instructor: 'Test Instructor',
    duration: 120
  }),
  
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};