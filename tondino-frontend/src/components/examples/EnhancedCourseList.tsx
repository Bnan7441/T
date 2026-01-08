/**
 * Example Integration: Enhanced Course List with All UX Features
 * 
 * Demonstrates integration of:
 * - Virtual scrolling for performance
 * - Progressive loading
 * - Pull-to-refresh
 * - Request deduplication
 * - Error boundaries
 * - Toast notifications
 */

import React, { useState, useCallback } from 'react';
import { VirtualScroll } from '@/components/ui/VirtualScroll';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { ProgressiveImage, LazyLoad } from '@/components/ui/ProgressiveLoader';
import { ComponentErrorBoundary } from '@/components/shared/ErrorBoundary';
import { useError } from '@/context/ErrorContext';
import { requestDeduplicator } from '@/utils/requestDeduplication';
import { Skeleton } from '@/components/ui/LoadingStates';

interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  instructor: string;
  price: number;
  progress?: number;
}

export const EnhancedCourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showError, showSuccess } = useError();

  // Fetch courses with request deduplication
  const fetchCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const data = await requestDeduplicator.fetch<Course[]>(
        '/api/courses',
        {
          credentials: 'include', // Send httpOnly cookies
        },
        {
          ttl: 30000, // Cache for 30 seconds
          enabled: true
        }
      );

      setCourses(data);
    } catch (error) {
      showError('خطا در بارگذاری دوره‌ها', 'لطفاً دوباره تلاش کنید');
      console.error('Failed to fetch courses:', error);
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  // Initial load
  React.useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Refresh handler for pull-to-refresh
  const handleRefresh = async () => {
    // Invalidate cache to force fresh data
    requestDeduplicator.invalidate('/api/courses');
    await fetchCourses();
    showSuccess('دوره‌ها به‌روزرسانی شدند');
  };

  // Render individual course card
  const renderCourse = (course: Course, index: number) => (
    <ComponentErrorBoundary componentName={`دوره ${course.title}`}>
      <LazyLoad
        threshold={0.1}
        rootMargin="100px"
        placeholder={<Skeleton className="h-48 rounded-xl" />}
      >
        <div className="glass-card p-6 rounded-2xl hover:shadow-lg transition-shadow">
          {/* Progressive image loading */}
          <ProgressiveImage
            src={course.image}
            alt={course.title}
            className="w-full aspect-video rounded-xl object-cover"
            placeholderClassName="rounded-xl"
          />

          <div className="mt-4 space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {course.title}
            </h3>
            
            <p className="text-sm text-gray-600 line-clamp-2">
              {course.description}
            </p>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <i className="fas fa-user-circle text-gray-400" />
                <span className="text-sm text-gray-600">{course.instructor}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-brand-primary">
                  {course.price.toLocaleString('fa-IR')}
                </span>
                <span className="text-sm text-gray-500">تومان</span>
              </div>
            </div>

            {/* Progress bar if enrolled */}
            {course.progress !== undefined && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>پیشرفت دوره</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-brand-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </LazyLoad>
    </ComponentErrorBoundary>
  );

  if (isLoading && courses.length === 0) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <PullToRefresh
      onRefresh={handleRefresh}
      pullDownThreshold={80}
      maxPullDown={150}
      className="h-screen overflow-auto"
    >
      {/* Use virtual scrolling for large lists */}
      {courses.length > 50 ? (
        <VirtualScroll
          items={courses}
          itemHeight={250} // Approximate height
          renderItem={renderCourse}
          overscan={3}
          className="h-full p-4"
        />
      ) : (
        <div className="space-y-4 p-4">
          {courses.map((course, index) => (
            <div key={course.id}>
              {renderCourse(course, index)}
            </div>
          ))}
        </div>
      )}

      {courses.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <i className="fas fa-inbox text-4xl mb-4" />
          <p>هیچ دوره‌ای یافت نشد</p>
        </div>
      )}
    </PullToRefresh>
  );
};

export default EnhancedCourseList;
