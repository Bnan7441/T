// API Service Layer for Tondino - Fully Typed
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  GoogleAuthRequest,
  User,
  UserUpdate,
  CoursesResponse,
  CourseAccessResponse,
  CategoriesResponse,
  Category,
  CategoryCreateRequest,
  CategoryUpdateRequest,
  Lesson,
  LessonCreateRequest,
  LessonUpdateRequest,
  LessonReorderRequest,
  AdminStats,
  UserStats,
  UserStatsUpdateRequest,
  PurchaseCourseRequest,
  PurchaseCourseResponse,
} from '@/types/api.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://185.97.117.157:3000/api';

// Helper function for API requests with httpOnly cookie support
// Zero-Trust Architecture: No localStorage, only withCredentials for auth
async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // CRITICAL: Send httpOnly cookies
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

async function apiRequestFormData<T = any>(endpoint: string, formData: FormData): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Authentication API
export const authAPI = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    return await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password } as LoginRequest),
    });
  },

  register: async (email: string, password: string, name: string): Promise<AuthResponse> => {
    return await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name } as RegisterRequest),
    });
  },

  checkStatus: async (): Promise<{ isAuthenticated: boolean; user?: User }> => {
    return await apiRequest<{ isAuthenticated: boolean; user?: User }>('/auth/status');
  },

  getProfile: async (): Promise<User> => {
    return await apiRequest<User>('/auth/profile');
  },

  updateProfile: async (data: UserUpdate): Promise<User> => {
    return await apiRequest<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  googleLogin: async (credential: string): Promise<AuthResponse> => {
    return await apiRequest<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential } as GoogleAuthRequest),
    });
  },

  // Authentication state is managed server-side via httpOnly cookies
  // To check auth status, call getProfile() and handle errors
  isAuthenticated: async (): Promise<boolean> => {
    try {
      await authAPI.getProfile();
      return true;
    } catch {
      return false;
    }
  },

  logout: async (): Promise<void> => {
    // Clear httpOnly cookie on server - no localStorage needed
    await apiRequest('/auth/logout', { method: 'POST' });
  },
};

// Public Courses API (no auth required)
export const coursesAPI = {
  getAll: async (): Promise<CoursesResponse> => {
    try {
      return await apiRequest<CoursesResponse>('/courses');
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      return { courses: [] };
    }
  },

  getById: async (id: number | string): Promise<any> => {
    return await apiRequest(`/courses/${id}`);
  },

  getMyCourses: async (): Promise<CoursesResponse> => {
    return await apiRequest<CoursesResponse>('/courses/my-courses');
  },

  checkAccess: async (courseId: string | number): Promise<CourseAccessResponse> => {
    return await apiRequest<CourseAccessResponse>(`/courses/access/${courseId}`);
  },

  getStats: async (): Promise<{ stats: Partial<UserStats> }> => {
    try {
      return await apiRequest<{ stats: Partial<UserStats> }>('/courses/stats');
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      return { stats: {} };
    }
  },

  updateStats: async (data: Partial<UserStats>): Promise<void> => {
    try {
      await apiRequest('/courses/stats', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Failed to update stats:', error);
    }
  },

  purchaseCourse: async (courseId: string): Promise<void> => {
    try {
      await apiRequest(`/courses/purchase/${courseId}`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to purchase course:', error);
      throw error;
    }
  },
};

// Categories API
export const categoriesAPI = {
  getAll: async (): Promise<CategoriesResponse> => {
    try {
      return await apiRequest<CategoriesResponse>('/admin/categories');
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      return { categories: [] };
    }
  },
};

// Lessons API
export const lessonsAPI = {
  getByCourse: async (courseId: number): Promise<{ lessons: Lesson[] }> => {
    return await apiRequest(`/admin/courses/${courseId}/lessons`);
  },

  getById: async (id: number): Promise<Lesson> => {
    return await apiRequest<Lesson>(`/admin/lessons/${id}`);
  },
};

// Admin API (requires admin role)
export const adminAPI = {
  // Users
  users: {
    getAll: async (): Promise<{ users: User[] }> => {
      return await apiRequest('/admin/users');
    },

    getById: async (id: number): Promise<User> => {
      const res = await apiRequest<{ user: User }>(`/admin/users/${id}`);
      return res.user;
    },

    update: async (id: number, data: UserUpdate): Promise<User> => {
      const res = await apiRequest<{ user: User }>(`/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      return res.user;
    },

    delete: async (id: number): Promise<{ success: boolean }> => {
      return await apiRequest(`/admin/users/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Courses
  courses: {
    getAll: async (category_id?: number): Promise<CoursesResponse> => {
      const query = category_id ? `?category_id=${category_id}` : '';
      return await apiRequest<CoursesResponse>(`/admin/courses${query}`);
    },

    getById: async (id: number): Promise<any> => {
      const res = await apiRequest<{ course: any }>(`/admin/courses/${id}`);
      return res.course;
    },

    create: async (courseData: any): Promise<any> => {
      const res = await apiRequest<{ course: any }>(`/admin/courses`, {
        method: "POST",
        body: JSON.stringify(courseData),
      });

      return res.course;
    },

    update: async (id: number, courseData: any): Promise<any> => {
      const res = await apiRequest<{ course: any }>(`/admin/courses/${id}`, {
        method: "PUT",
        body: JSON.stringify(courseData),
      });

      return res.course;
    },

    delete: async (id: number): Promise<{ success: boolean }> => {
      return await apiRequest(`/admin/courses/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Categories
  categories: {
    getAll: async (): Promise<CategoriesResponse> => {
      return await apiRequest<CategoriesResponse>('/admin/categories');
    },

    create: async (data: CategoryCreateRequest): Promise<Category> => {
      const res = await apiRequest<{ category: Category }>('/admin/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return res.category;
    },

    update: async (id: number, data: CategoryUpdateRequest): Promise<Category> => {
      const res = await apiRequest<{ category: Category }>(`/admin/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      return res.category;
    },

    delete: async (id: number): Promise<{ success: boolean }> => {
      return await apiRequest(`/admin/categories/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Lessons
  lessons: {
    getByCourse: async (courseId: number): Promise<{ lessons: Lesson[] }> => {
      return await apiRequest(`/admin/courses/${courseId}/lessons`);
    },

    getById: async (id: number): Promise<Lesson> => {
      const res = await apiRequest<{ lesson: Lesson }>(`/admin/lessons/${id}`);
      return res.lesson;
    },

    create: async (courseId: number, lessonData: LessonCreateRequest): Promise<Lesson> => {
      const res = await apiRequest<{ lesson: Lesson }>(`/admin/courses/${courseId}/lessons`, {
        method: 'POST',
        body: JSON.stringify(lessonData),
      });

      return res.lesson;
    },

    update: async (id: number, lessonData: LessonUpdateRequest): Promise<Lesson> => {
      const res = await apiRequest<{ lesson: Lesson }>(`/admin/lessons/${id}`, {
        method: 'PUT',
        body: JSON.stringify(lessonData),
      });

      return res.lesson;
    },

    delete: async (id: number): Promise<{ success: boolean }> => {
      return await apiRequest(`/admin/lessons/${id}`, {
        method: 'DELETE',
      });
    },

    reorder: async (courseId: number, lessonIds: number[]): Promise<{ success: boolean }> => {
      return await apiRequest(`/admin/courses/${courseId}/lessons/reorder`, {
        method: 'PUT',
        body: JSON.stringify({ lessonIds } as LessonReorderRequest),
      });
    },
  },

  // Stats
  stats: {
    get: async (): Promise<AdminStats> => {
      const res = await apiRequest<{ stats: Partial<AdminStats> }>('/admin/stats');
      return {
        totalUsers: Number(res.stats?.totalUsers || 0),
        totalCourses: Number(res.stats?.totalCourses || 0),
        totalPurchases: Number(res.stats?.totalPurchases || 0),
        totalRevenue: Number(res.stats?.totalRevenue || 0),
        activeUsers: Number(res.stats?.activeUsers || 0),
      };
    },
  },

  // Uploads
  uploadCourseImage: async (file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    return await apiRequestFormData<{ imageUrl: string }>('/admin/upload-image', formData);
  },
};

// User Stats API - Placeholder for future implementation
export const statsAPI = {
  get: async (): Promise<UserStats> => {
    // Use existing backend endpoint at GET /api/courses/stats
    const res = await apiRequest<{ stats: Partial<UserStats> }>('/courses/stats');
    // Map backend shape to frontend `UserStats` where possible
    const s = res.stats || {};
    const sAny = s as any;
    return {
      points: sAny.points || 0,
      streak: sAny.current_streak || sAny.streak || 0,
      level: sAny.level || 1,
      badges: sAny.badges || [],
      topSpeed: sAny.top_speed || sAny.topSpeed || 0,
      // Backend stores `courses_completed` as a count — frontend expects ids; return empty list for now.
      completedCourseIds: sAny.completedCourseIds || sAny.courses_completed_ids || [],
    } as UserStats;
  },

  update: async (data: UserStatsUpdateRequest): Promise<UserStats> => {
    // Use existing backend endpoint at PUT /api/courses/stats
    await apiRequest('/courses/stats', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    // Return fresh copy
    return await statsAPI.get();
  },
};

// Purchase API - Placeholder for future implementation
export const purchaseAPI = {
  purchaseCourse: async (request: PurchaseCourseRequest): Promise<PurchaseCourseResponse> => {
    // Backend currently exposes POST /api/courses/purchase/:courseId
    // Call the existing coursesAPI.purchaseCourse helper which performs that request.
    await coursesAPI.purchaseCourse(request.courseId);
    return { success: true, message: 'Course purchased' } as PurchaseCourseResponse;
  },
};

// Default export with all APIs
export default {
  auth: authAPI,
  courses: coursesAPI,
  categories: categoriesAPI,
  lessons: lessonsAPI,
  admin: adminAPI,
  stats: statsAPI,
  purchase: purchaseAPI,
};

// (no-op) module-level helper removed
