export interface Course {
  id: number | string;
  course_id?: string | number;
  title: string;
  description?: string;
  price: number;
  is_free?: boolean;
  is_active?: boolean;
  created_at?: string;
  image_url?: string;
  category_id?: number;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  created_at?: string;
}

export interface Lesson {
  id: number | string;
  course_id?: number | string;
  title: string;
  description?: string;
  content?: string;
  video_url?: string;
  order_index?: number;
  duration: number | string;
  is_free?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  is_admin?: boolean;
  is_active?: boolean;
  courses_count?: number;
  points?: number;
  top_speed?: number;
  created_at?: string;
}

export interface Stats {
  totalUsers: number;
  totalCourses: number;
  totalPurchases: number;
  totalRevenue: number;
}
