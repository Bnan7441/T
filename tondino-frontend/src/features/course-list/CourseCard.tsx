
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Course } from '../../types';
import { useSelection } from '../../context/SelectionContext';
import { User, Star, ArrowLeft } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  horizontal?: boolean;
}

export const SkeletonCard: React.FC<{ horizontal?: boolean }> = ({ horizontal = false }) => (
  <div className={`rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-gray-100 to-gray-50 dark:from-slate-800 dark:to-slate-900 p-0 space-y-0 animate-pulse border border-gray-200 dark:border-white/5 overflow-hidden ${
    horizontal ? 'w-[280px] md:w-[320px] shrink-0' : 'w-full'
  }`}>
    {/* Image Skeleton - Mobile Optimized */}
    <div className="aspect-[16/10] bg-gradient-to-br from-gray-300 to-gray-200 dark:from-slate-700 dark:to-slate-800"></div>

    {/* Content Skeleton - Mobile Optimized */}
    <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
      {/* Instructor Skeleton */}
      <div className="flex items-center gap-2">
        <div className="w-7 sm:w-8 h-7 sm:h-8 bg-gray-300 dark:bg-slate-700 rounded-full"></div>
        <div className="h-3 bg-gray-300 dark:bg-slate-700 rounded-lg w-2/3"></div>
      </div>

      {/* Title Skeleton */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 dark:bg-slate-700 rounded-lg w-full"></div>
        <div className="h-4 bg-gray-300 dark:bg-slate-700 rounded-lg w-3/4"></div>
      </div>

      {/* Price & Button Skeleton */}
      <div className="pt-3 sm:pt-4 border-t border-gray-200 dark:border-white/5 flex justify-between items-center">
        <div className="h-6 bg-gray-300 dark:bg-slate-700 rounded-lg w-1/4"></div>
        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gray-300 dark:bg-slate-700 rounded-xl sm:rounded-2xl"></div>
      </div>
    </div>
  </div>
);

const CourseCardImpl: React.FC<CourseCardProps> = ({ course, horizontal = false }) => {
  const navigate = useNavigate();
  const { setSelectedCourse } = useSelection();

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setSelectedCourse(course);
    navigate('/course-detail/' + course.id);

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  };

  return (
    <motion.div
      onClick={handleCardClick}
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] shadow-mobile-card hover:shadow-card-hover transition-all duration-300 group flex flex-col h-full cursor-pointer
        bg-gradient-to-br from-white to-brand-surface dark:from-slate-800 dark:to-slate-900 border border-white/60 dark:border-white/5 ${
        horizontal ? 'w-[280px] md:w-[320px] shrink-0 snap-center' : 'w-full'
      }`}
    >
      {/* Image Container - Enhanced Mobile */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-200 dark:bg-slate-700">
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              loading="lazy"
              decoding="async"
            />
          {/* Gradient Overlay - Mobile Enhanced */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

          {/* Category Badge - Mobile Optimized */}
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[9px] sm:text-[10px] font-black text-brand-primary dark:text-white border border-white/20 shadow-mobile-sm">
              {course.category}
          </div>

          {/* Rating Badge - New Mobile Feature */}
          {course.rating && (
            <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex items-center gap-1 bg-yellow-400/95 dark:bg-yellow-500/95 backdrop-blur-sm px-2.5 sm:px-3 py-1.5 rounded-lg shadow-mobile-sm text-white">
              <Star size={14} />
              <span className="text-[9px] sm:text-[10px] font-black">{course.rating}</span>
            </div>
          )}
      </div>

      {/* Content Container - Better Mobile Spacing */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow text-right space-y-3 sm:space-y-4">
        {/* Instructor Info - Mobile Optimized */}
        <div className="flex items-center gap-2">
          <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-gradient-to-br from-brand-accent to-brand-accent/60 flex items-center justify-center flex-shrink-0 text-white">
            <User size={14} />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-gray-600 dark:text-gray-400 truncate">
            {course.instructor || 'مدرس دوره'}
          </span>
        </div>

        {/* Course Title - Mobile Optimized */}
        <h4 className="font-black text-brand-primary dark:text-white text-sm sm:text-base leading-snug line-clamp-2 flex-grow group-hover:text-brand-accent transition-colors duration-300">
          {course.title || 'دوره بدون عنوان'}
        </h4>

        {/* Price Section - Mobile Optimized */}
        <div className="pt-3 sm:pt-4 border-t border-gray-200/50 dark:border-white/10 flex items-center justify-between gap-3">
           <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black text-brand-primary dark:text-white tracking-tight ltr-num">
                {typeof course.price === 'string' && course.price.includes('تومان')
                  ? course.price
                  : course.isFree ? 'رایگان' : `${course.price || 0} تومان`
                }
              </span>
           </div>
           {/* Action Button - Mobile Touch-Friendly */}
           <motion.div
             whileHover={{ scale: 1.1 }}
             whileTap={{ scale: 0.95 }}
             className="w-10 h-10 sm:w-11 sm:h-11 min-w-[40px] sm:min-w-[44px] min-h-[40px] sm:min-h-[44px] rounded-xl sm:rounded-2xl bg-gradient-to-br from-brand-primary to-brand-primary/80 text-white flex items-center justify-center shadow-mobile-glow group-hover:shadow-glow transition-all flex-shrink-0"
           >
             <ArrowLeft size={16} />
           </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export const CourseCard = React.memo(CourseCardImpl) as React.FC<CourseCardProps>;
