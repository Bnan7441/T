import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

// Mock API calls
const { mockAuthAPI, mockCoursesAPI, mockChatAPI } = vi.hoisted(() => ({
  mockAuthAPI: {
    register: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    getProfile: vi.fn(),
    checkStatus: vi.fn(),
  },
  mockCoursesAPI: {
    getAll: vi.fn(),
    getMyCourses: vi.fn(),
    getStats: vi.fn(),
    updateStats: vi.fn(),
    purchaseCourse: vi.fn(),
    getById: vi.fn(),
  },
  mockChatAPI: {
    getSessions: vi.fn(),
    createSession: vi.fn(),
    sendMessage: vi.fn()
  }
}));

vi.mock('../services/api', () => ({
  authAPI: mockAuthAPI,
  coursesAPI: { ...mockCoursesAPI, getCourses: mockCoursesAPI.getAll },
  chatAPI: mockChatAPI
}));

vi.mock('@/services/enhancedAPI', () => ({
  enhancedAuthAPI: mockAuthAPI,
  enhancedCoursesAPI: mockCoursesAPI,
  default: {
    get: vi.fn(),
    post: vi.fn(),
  }
}));

const localStorageMock = {
  getItem: vi.spyOn(Storage.prototype, 'getItem'),
  setItem: vi.spyOn(Storage.prototype, 'setItem'),
  removeItem: vi.spyOn(Storage.prototype, 'removeItem'),
  clear: vi.spyOn(Storage.prototype, 'clear'),
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'header.home': 'خانه',
        'header.courses': 'دوره‌ها',
        'header.club': 'باشگاه',
        'header.blog': 'بلاگ',
        'header.about': 'درباره ما',
        'header.loginSignup': 'ورود / ثبت‌نام'
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: () => new Promise(() => {}),
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  }
}));

const renderApp = () => render(<App />);

const openLoginModal = async () => {
  const loginBtn = screen.queryByTestId('header-login-button');
  if (loginBtn) {
    fireEvent.click(loginBtn);
    await waitFor(() => screen.getByTestId('auth-modal'));
  }
};

describe('User Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    window.history.pushState({}, '', '/');
    mockAuthAPI.checkStatus.mockResolvedValue({ isAuthenticated: false });
    mockAuthAPI.getProfile.mockRejectedValue(new Error('Not authenticated'));
    mockCoursesAPI.getAll.mockResolvedValue({ courses: [] });
    mockCoursesAPI.getMyCourses.mockResolvedValue({ courses: [] });
    mockCoursesAPI.getStats.mockResolvedValue({ stats: {} });
  });

  it('should open login form', async () => {
    renderApp();
    await openLoginModal();
    expect(screen.getByPlaceholderText('example@gmail.com')).toBeInTheDocument();
  });

  it('should handle successful login', async () => {
    const mockLoginResponse = {
      token: 'test-token-123',
      user: { id: 1, name: 'Test User', email: 'test@example.com' }
    };
    mockAuthAPI.login.mockResolvedValue(mockLoginResponse);
    mockAuthAPI.getProfile.mockResolvedValue(mockLoginResponse.user);

    renderApp();
    await openLoginModal();
    
    fireEvent.change(screen.getByPlaceholderText('example@gmail.com'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' }
    });
    
    const submitBtn = screen.getByRole('button', { name: /ورود به حساب/i });
    fireEvent.click(submitBtn);
    
    await waitFor(() => {
      expect(mockAuthAPI.login).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(screen.queryByTestId('header-login-button')).not.toBeInTheDocument();
      expect(screen.getByAltText(/پروفایل Test User/)).toBeInTheDocument();
    });
  });

  it('should handle login failure', async () => {
    mockAuthAPI.login.mockRejectedValue(new Error('Invalid credentials'));
    
    renderApp();
    await openLoginModal();
    
    fireEvent.change(screen.getByPlaceholderText('example@gmail.com'), {
      target: { value: 'wrong@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'wrongpass' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /ورود به حساب/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('should switch to registration form', async () => {
    renderApp();
    await openLoginModal();
    
    const toggleBtn = screen.getByRole('button', { name: /ایجاد حساب/i });
    fireEvent.click(toggleBtn);
    
    await waitFor(() => {
        expect(screen.getByPlaceholderText('نام خود را وارد کنید')).toBeInTheDocument();
    });
  });

  it('should handle successful registration', async () => {
    const mockRegisterResponse = {
      token: 'test-token-123',
      user: { id: 1, name: 'New User', email: 'new@example.com' }
    };
    mockAuthAPI.register.mockResolvedValue(mockRegisterResponse);
    mockAuthAPI.getProfile.mockResolvedValue(mockRegisterResponse.user);

    renderApp();
    await openLoginModal();
    
    const toggleBtn = screen.getByRole('button', { name: /ایجاد حساب/i });
    fireEvent.click(toggleBtn);
    
    await waitFor(() => expect(screen.getByPlaceholderText('نام خود را وارد کنید')).toBeInTheDocument());
    
    fireEvent.change(screen.getByPlaceholderText('نام خود را وارد کنید'), {
      target: { value: 'New User' }
    });
    fireEvent.change(screen.getByPlaceholderText('example@gmail.com'), {
      target: { value: 'new@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' }
    });
    
    const submitBtn = screen.getByRole('button', { name: /تایید و ثبت نام/i });
    fireEvent.click(submitBtn);
    
    await waitFor(() => {
      expect(mockAuthAPI.register).toHaveBeenCalledWith('new@example.com', 'password123', 'New User');
      expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument();
    });
  });
});

describe('Course Discovery and Purchase Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthAPI.getProfile.mockRejectedValue(new Error('unauth'));
    mockCoursesAPI.getAll.mockResolvedValue({
        courses: [
          { 
              id: 1, 
              title: 'JavaScript Fundamentals', 
              price: 1000, 
              category: 'programming',
              instructor: 'John Doe',
              description: 'Learn JS'
          },
          { 
              id: 2, 
              title: 'React Development', 
              price: 2000, 
              category: 'programming',
              instructor: 'Jane Smith',
              description: 'Learn React'
          }
        ]
    });
  });

  it('should display course catalog', async () => {
    renderApp();
    
    const courseLinks = screen.getAllByText('دوره‌ها');
    fireEvent.click(courseLinks[0]); 
    
    await waitFor(() => {
      expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
    });
  });

  it('should filter courses by search term', async () => {
    renderApp();
    
    const searchBtn = screen.getByTestId('header-search-button');
    fireEvent.click(searchBtn);
    
    const searchInput = await screen.findByPlaceholderText(/دنبال چی/i);
    
    fireEvent.change(searchInput, { target: { value: 'React' } });
    
    await waitFor(() => {
      expect(screen.getByText('React Development')).toBeInTheDocument();
    });
  });
});

describe('Learning Progress and Stats', () => {
  const mockStats = {
    level: 5,
    points: 500,
    streak: 3,
    topSpeed: 200,
    completedCourseIds: [],
    certificates: [],
    xp: 2500
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'tondino_stats') return JSON.stringify(mockStats);
      return null;
    });
    
    mockAuthAPI.checkStatus.mockResolvedValue({
      isAuthenticated: true,
      user: { id: 1, name: 'Stats User', email: 'stats@test.com', avatar: 'img.png', is_admin: false }
    });
    mockAuthAPI.getProfile.mockResolvedValue({ id: 1, name: 'Stats User', email: 'stats@test.com', avatar: 'img.png' });
    mockCoursesAPI.getMyCourses.mockResolvedValue({ courses: [] });
  });

  it('should display user statistics', async () => {
    renderApp();
    
    await waitFor(() => expect(screen.getByAltText(/پروفایل Stats User/)).toBeInTheDocument());
    
    fireEvent.click(screen.getByAltText(/پروفایل Stats User/));
    
    await waitFor(() => {
       expect(screen.getByText('کل امتیازات')).toBeInTheDocument();
    });
    
    expect(screen.getByText('روزهای متوالی')).toBeInTheDocument();
  });
});
