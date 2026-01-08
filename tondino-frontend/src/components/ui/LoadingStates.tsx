/**
 * Enhanced Loading States & Skeleton Components
 *
 * Provides consistent, accessible loading experiences across the application
 * with proper ARIA labels, reduced motion support, and progressive enhancement.
 */

import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  animation = true
}) => {
  const baseClasses = "bg-gray-200 dark:bg-gray-700";

  const variantClasses = {
    text: "h-4 rounded",
    rectangular: "rounded-lg",
    circular: "rounded-full"
  };

  const animationClasses = animation
    ? "animate-pulse"
    : "[animation: none]";

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses} ${className}`}
      role="presentation"
      aria-hidden="true"
    />
  );
};

interface CourseCardSkeletonProps {
  showAvatar?: boolean;
  showDescription?: boolean;
}

export const CourseCardSkeleton: React.FC<CourseCardSkeletonProps> = ({
  showAvatar = true,
  showDescription = true
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card p-6 rounded-2xl space-y-4"
    role="presentation"
    aria-label="در حال بارگذاری دوره"
  >
    {showAvatar && (
      <Skeleton variant="rectangular" className="aspect-video w-full rounded-xl" />
    )}
    <div className="space-y-3">
      <Skeleton variant="text" className="h-6 w-3/4" />
      {showDescription && (
        <>
          <Skeleton variant="text" className="h-4 w-full" />
          <Skeleton variant="text" className="h-4 w-2/3" />
        </>
      )}
      <div className="flex justify-between items-center pt-2">
        <Skeleton variant="circular" className="w-8 h-8" />
        <Skeleton variant="rectangular" className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  </motion.div>
);

interface DashboardSkeletonProps {
  showProgress?: boolean;
  showCourses?: boolean;
  showBadges?: boolean;
}

export const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({
  showProgress = true,
  showCourses = true,
  showBadges = true
}) => (
  <div className="space-y-8 animate-in fade-in">
    {/* Header Skeleton */}
    <div className="bg-gray-200 dark:bg-gray-800 p-8 rounded-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Skeleton variant="circular" className="w-20 h-20" />
          <div className="space-y-2">
            <Skeleton variant="text" className="h-8 w-48" />
            <Skeleton variant="text" className="h-4 w-64" />
          </div>
        </div>
        <div className="flex gap-8">
          <div className="text-center space-y-1">
            <Skeleton variant="text" className="h-8 w-16" />
            <Skeleton variant="text" className="h-3 w-20" />
          </div>
          <div className="text-center space-y-1">
            <Skeleton variant="text" className="h-8 w-12" />
            <Skeleton variant="text" className="h-3 w-24" />
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {showProgress && (
        <div className="lg:col-span-8 glass-card p-8 rounded-2xl space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <Skeleton variant="text" className="h-6 w-48" />
              <Skeleton variant="text" className="h-4 w-64 mt-1" />
            </div>
          </div>
          <div className="flex justify-between items-end h-48">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton variant="rectangular" className="w-12 h-32 rounded-lg" />
                <Skeleton variant="text" className="h-3 w-4" />
              </div>
            ))}
          </div>
        </div>
      )}

      {showCourses && (
        <div className="lg:col-span-4 glass-card p-8 rounded-2xl space-y-6">
          <Skeleton variant="text" className="h-6 w-32" />
          <div className="space-y-4">
            <Skeleton variant="rectangular" className="aspect-video w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton variant="text" className="h-5 w-3/4" />
              <div className="flex justify-between">
                <Skeleton variant="text" className="h-3 w-24" />
                <Skeleton variant="text" className="h-3 w-8" />
              </div>
              <Skeleton variant="rectangular" className="h-2 w-full rounded-full" />
            </div>
            <Skeleton variant="rectangular" className="h-12 w-full rounded-xl" />
          </div>
        </div>
      )}

      {showBadges && (
        <div className="lg:col-span-12 space-y-6">
          <Skeleton variant="text" className="h-7 w-40" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl flex flex-col items-center gap-3">
                <Skeleton variant="circular" className="w-16 h-16" />
                <Skeleton variant="text" className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  'aria-label'?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  'aria-label': ariaLabel = 'در حال بارگذاری'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div
      className={`inline-block ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label={ariaLabel}
    >
      <svg
        className="animate-spin text-brand-accent"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
};

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  children: React.ReactNode;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'در حال بارگذاری...',
  children
}) => (
  <div className="relative">
    {children}
    {isVisible && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-inherit"
      >
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {message}
          </p>
        </div>
      </motion.div>
    )}
  </div>
);

// Progressive enhancement hook for loading states
export const useProgressiveLoading = (isLoading: boolean, delay: number = 100) => {
  const [shouldShow, setShouldShow] = React.useState(false);

  React.useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShouldShow(true), delay);
      return () => clearTimeout(timer);
    } else {
      setShouldShow(false);
    }
  }, [isLoading, delay]);

  return shouldShow;
};