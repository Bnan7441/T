// API Type Definitions for Tondino Web App

// Authentication
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface GoogleAuthRequest {
  credential: string;
}

// User
export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  joinDate: string;
  isAdmin?: boolean;
  phone?: string;
  is_admin?: boolean; // Legacy/Admin API might use this
  is_active?: boolean;
  courses_count?: number;
  points?: number;
  top_speed?: number;
  created_at?: string;
}

export interface UserUpdate {
  name?: string;
  email?: string;
  is_active?: boolean;
  is_admin?: boolean;
}

// Courses
export interface Course {
  id: number | string;
  course_id?: number | string;
  title: string;
  description?: string;
  instructor: string;
  rating: number;
  price: string;
  isFree?: boolean;
  image: string;
  category: string;
  category_id?: number;
  ageGroup?: 'kid' | 'teen' | 'adult';
  status?: 'trending' | 'new' | 'popular';
  syllabus?: Lesson[];
}

export interface CoursesResponse {
  courses: Course[];
}

export interface CourseAccessResponse {
  hasAccess: boolean;
  course?: Course;
}

// Lessons
export interface Lesson {
  id: number | string;
  course_id: number | string;
  title: string;
  content: string;
  duration: string;
  order: number;
  video_url?: string;
  description?: string;
  resources?: Resource[];
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'link' | 'video' | 'zip';
  url: string;
}

export interface LessonCreateRequest {
  title: string;
  content: string;
  duration: string;
  order?: number;
}

export interface LessonUpdateRequest extends Partial<LessonCreateRequest> {}

export interface LessonReorderRequest {
  lessonIds: number[];
}

// Categories
export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface CategoryCreateRequest {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface CategoryUpdateRequest extends Partial<CategoryCreateRequest> {}

// Admin Stats
export interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  totalRevenue: number;
  totalPurchases: number;
  activeUsers: number;
}

// User Stats
export interface UserStats {
  points: number;
  streak: number;
  level: number;
  badges: string[];
  topSpeed: number;
  completedCourseIds: string[];
}

export interface UserStatsUpdateRequest {
  points?: number;
  streak?: number;
  level?: number;
  badges?: string[];
  topSpeed?: number;
  completedCourseIds?: string[];
}

// Purchase
export interface PurchaseCourseRequest {
  courseId: string;
  paymentMethod: string;
}

export interface PurchaseCourseResponse {
  success: boolean;
  message: string;
  orderId?: string;
}

// Generic API Response
export interface ApiError {
  error: string;
  statusCode?: number;
}
