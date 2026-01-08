
import React, { useState, useEffect } from 'react';
import { Course } from '../../types';
import { CourseCard, SkeletonCard } from './CourseCard';
import { useUI } from '../../context/UIContext';
import { coursesAPI } from '../../services/api';
import Icon from '../../components/Icon';

interface CourseListProps {
  title: string;
  category?: string;
  horizontal?: boolean;
}

const CourseListImpl: React.FC<CourseListProps> = ({ title, category, horizontal = true }) => {
  const { activeCategory, activeAgeGroup, setActiveCategory, setActiveAgeGroup } = useUI();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Fetch courses from API with fallback to mock data
    const fetchCourses = async () => {
      try {
        const response = await coursesAPI.getAll();
        let fetchedCourses: Course[] = response.courses || [];

        // Transform backend data to frontend format
        fetchedCourses = fetchedCourses.map((course: any) => ({
          id: course.id || course.course_id,
          title: course.title,
          description: course.description,
          category: course.category_name || course.category || 'عمومی',
          categoryIcon: course.category_icon,
          categoryColor: course.category_color,
          image: course.image_url || '/images/hero/hero-1.jpg',
          price: course.is_free ? 'رایگان' : (typeof course.price === 'string' ? course.price : `${course.price} تومان`),
          instructor: course.instructor || 'مدرس دوره',
          rating: course.rating || 4.8,
          ageGroup: course.age_group || 'adult',
          isFree: course.is_free || false,
          enrolled: 0,
          lessons: 0
        }));

        // Apply filters
        const catFilter = category || activeCategory;
        if (catFilter) {
          fetchedCourses = fetchedCourses.filter(c =>
            c.category.toLowerCase().includes(catFilter.toLowerCase())
          );
        }

        if (activeAgeGroup) {
          fetchedCourses = fetchedCourses.filter(c => c.ageGroup === activeAgeGroup);
        }

        setCourses(fetchedCourses);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        setError('خطا در بارگذاری دوره‌ها. لطفاً دوباره تلاش کنید.');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    // استفاده از تایمر کوتاه برای تجربه کاربری بهتر
    const timer = setTimeout(fetchCourses, 300);

    return () => clearTimeout(timer);
  }, [category, activeCategory, activeAgeGroup]);

  const handleReset = () => {
    setActiveCategory(null);
    setActiveAgeGroup(null);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between px-0">
        <h2 className="section-title text-lg sm:text-xl md:text-2xl">{title}</h2>
        <button className="font-label text-brand-accent hover:underline text-xs sm:text-sm">مشاهده همه</button>
      </div>
      
      {loading ? (
        <div className="flex overflow-x-auto no-scrollbar gap-4 sm:gap-5 md:gap-6 pb-4">
          {Array(4).fill(0).map((_, i) => <SkeletonCard key={i} horizontal={horizontal} />)}
        </div>
      ) : (
        <div className="min-h-[200px]">
          {courses.length > 0 ? (
            <div className={`flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-4 sm:gap-5 md:gap-6 pb-4`} dir="rtl">
              {courses.map(course => (
                <div key={course.id} className="snap-start shrink-0">
                  <CourseCard course={course} horizontal={horizontal} />
                </div>
              ))}
              <div className="w-1 shrink-0" />
            </div>
          ) : (
            <div className="py-12 sm:py-16 md:py-20 text-center glass-card rounded-2xl sm:rounded-3xl md:rounded-[3rem] border border-white/30 space-y-4 sm:space-y-5 md:space-y-6 mx-0 animate-in zoom-in duration-500">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-2xl sm:text-3xl text-gray-200 dark:text-gray-700 border-2 border-dashed border-gray-100 dark:border-white/5">
              <Icon fa="fa-magnifying-glass" />
            </div>
               <div className="space-y-2">
                  <p className="text-brand-primary dark:text-white font-black text-lg sm:text-xl">نتیجه‌ای یافت نشد!</p>
                  <p className="text-gray-400 font-medium text-xs sm:text-sm px-6 sm:px-10">ترکیب فیلترهای انتخابی شما هیچ دوره‌ای را شامل نمی‌شود.</p>
               </div>
               <button 
                onClick={handleReset}
                className="bg-brand-primary text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg sm:rounded-2xl font-black text-xs sm:text-sm hover:bg-brand-accent transition-all shadow-lg"
               >
                 پاک کردن تمام فیلترها
               </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export const CourseList = React.memo(CourseListImpl) as React.FC<CourseListProps>;
