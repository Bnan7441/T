import { authAPI as originalAuthAPI, coursesAPI as originalCoursesAPI } from './api';
import type { CoursesResponse, UserStats } from '@/types/api.types';

// Enhanced API helper that throws meaningful errors instead of silently returning empty arrays
// Zero-Trust Architecture: No localStorage tokens, only httpOnly cookies via withCredentials
async function enhancedApiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  context?: string
): Promise<T> {
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
      
      // Create contextual error
      const contextualError = new Error(error.error || `HTTP ${response.status}`);
      (contextualError as any).context = context;
      (contextualError as any).status = response.status;
      (contextualError as any).endpoint = endpoint;
      
      throw contextualError;
    }

    return response.json();
  } catch (error) {
    // If it's already our enhanced error, re-throw
    if ((error as any).context) {
      throw error;
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      const networkError = new Error('Network connection failed');
      (networkError as any).context = context;
      (networkError as any).originalError = error;
      throw networkError;
    }
    
    // Re-throw with context
    const contextualError = new Error((error as Error).message);
    (contextualError as any).context = context;
    (contextualError as any).originalError = error;
    throw contextualError;
  }
}

// Enhanced courses API that doesn't silently fail
export const enhancedCoursesAPI = {
  getAll: async (): Promise<CoursesResponse> => {
    return await enhancedApiRequest<CoursesResponse>('/courses', {}, 'courses');
  },

  getById: async (id: number): Promise<any> => {
    return await enhancedApiRequest(`/courses/${id}`, {}, 'courses');
  },

  getMyCourses: async (): Promise<CoursesResponse> => {
    return await enhancedApiRequest<CoursesResponse>('/courses/my-courses', {}, 'courses');
  },

  getStats: async (): Promise<{ stats: Partial<UserStats> }> => {
    return await enhancedApiRequest<{ stats: Partial<UserStats> }>('/courses/stats', {}, 'stats');
  },

  updateStats: async (data: Partial<UserStats>): Promise<void> => {
    await enhancedApiRequest('/courses/stats', {
      method: 'PUT',
      body: JSON.stringify(data),
    }, 'stats');
  },

  purchaseCourse: async (courseId: string): Promise<void> => {
    await enhancedApiRequest(`/courses/purchase/${courseId}`, {
      method: 'POST',
    }, 'purchase');
  },
};

// Enhanced auth API 
export const enhancedAuthAPI = {
  ...originalAuthAPI,
  
  login: async (email: string, password: string) => {
    return await enhancedApiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, 'auth');
  },

  register: async (email: string, password: string, name: string) => {
    return await enhancedApiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }, 'auth');
  },

  getProfile: async () => {
    return await enhancedApiRequest('/auth/profile', {}, 'auth');
  },

  updateProfile: async (data: any) => {
    return await enhancedApiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }, 'auth');
  },

  googleLogin: async (credential: string) => {
    return await enhancedApiRequest('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    }, 'auth');
  },
};