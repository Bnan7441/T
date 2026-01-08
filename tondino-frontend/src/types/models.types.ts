export type AgeGroup = 'kid' | 'teen' | 'adult';

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'link' | 'video' | 'zip';
  url: string;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  duration: string;
  resources?: Resource[];
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  rating: number;
  price: string;
  image: string;
  category: string;
  ageGroup?: AgeGroup;
  status?: 'trending' | 'new' | 'popular';
  description?: string;
  syllabus?: Lesson[];
}

export interface UserStats {
  points: number;
  streak: number;
  level: number;
  badges: string[];
  topSpeed: number; // Words Per Minute
  completedCourseIds: string[];
}

export interface User {
  name: string;
  avatar: string;
  email: string;
  joinDate: string;
  isAdmin?: boolean;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  date: string;
  image: string;
  category: string;
  readTime: string;
}

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export {};
