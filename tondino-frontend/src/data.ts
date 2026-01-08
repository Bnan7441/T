
import { Course, Article, UserStats } from './types';

// NOTE: Mock data has been replaced with real API calls
// See tondino-frontend/src/services/api.ts for coursesAPI.getAll()

/**
 * DEPRECATED: This file contains legacy mock data
 * All data should be fetched from the backend API:
 * - Courses: GET /api/courses (via coursesAPI.getAll())
 * - User Courses: GET /api/courses/my-courses (via coursesAPI.getMyCourses())
 * - User Stats: GET /api/courses/stats (via coursesAPI.getStats())
 * 
 * Components that used MOCK_COURSES have been updated to use API calls.
 * This file is kept for reference only and can be deleted in future.
 */

// Legacy exports (no longer used)
export const MOCK_COURSES: Course[] = [];

export const MOCK_ARTICLES: Article[] = [];

export const USER_STATS: UserStats = {
  points: 0,
  streak: 0,
  level: 0,
  badges: [],
  topSpeed: 0,
  completedCourseIds: []
};
