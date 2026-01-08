import { beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
});

// Global test utilities
global.testUtils = {
  mockUser: {
    id: 1,
    name: 'Test User',
    email: 'test@example.com'
  },
  
  mockAuthToken: 'mock_jwt_token_for_testing',
  
  setupAuthenticatedUser: () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'authToken') return global.testUtils.mockAuthToken;
      if (key === 'user') return JSON.stringify(global.testUtils.mockUser);
      return null;
    });
  },
  
  setupUnauthenticatedUser: () => {
    localStorageMock.getItem.mockReturnValue(null);
  }
};