// Admin API Service for Tondino Platform
// Zero-Trust: httpOnly cookies only (no localStorage)

const API_BASE_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost'
  ? 'http://localhost:3001/api'
  : `${window.location.protocol}//${window.location.host}/api`);

const adminRequest = async (endpoint: string, options: RequestInit = {}) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Send httpOnly cookies
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
};

// Course Management
export const adminCoursesAPI = {
  getAll: async () => {
    return await adminRequest('/admin/courses');
  },

  getOne: async (id: number) => {
    return await adminRequest(`/admin/courses/${id}`);
  },

  create: async (courseData: {
    course_id: string;
    title: string;
    description?: string;
    price: number;
    is_free?: boolean;
  }) => {
    return await adminRequest('/admin/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  },

  update: async (id: number, courseData: {
    title?: string;
    description?: string;
    price?: number;
    is_free?: boolean;
    is_active?: boolean;
  }) => {
    return await adminRequest(`/admin/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  },

  delete: async (id: number) => {
    return await adminRequest(`/admin/courses/${id}`, {
      method: 'DELETE',
    });
  },
};

// User Management
export const adminUsersAPI = {
  getAll: async () => {
    return await adminRequest('/admin/users');
  },

  toggleAdmin: async (id: number, is_admin: boolean) => {
    return await adminRequest(`/admin/users/${id}/admin`, {
      method: 'PUT',
      body: JSON.stringify({ is_admin }),
    });
  },
};

// Dashboard Stats
export const adminStatsAPI = {
  get: async () => {
    return await adminRequest('/admin/stats');
  },
};
