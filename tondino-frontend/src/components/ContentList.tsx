
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Course } from '@/types';
import { useUI } from '@/context/UIContext';
import { useStats } from '@/context/StatsContext';
import { useAuth } from '@/context/AuthContext';
import Icon from './Icon';

interface ContentListProps {
  title: string;
}

const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
  const { purchaseCourse } = useStats();
  const { isAuthenticated } = useAuth();
  const { setIsAuthModalOpen } = useUI();

  const handleQuickPurchase = async () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      await purchaseCourse(course.id);
      // lightweight feedback; app may handle notifications elsewhere
      alert('عملیات خرید انجام شد');
    } catch (err) {
      console.error('Purchase error:', err);
      alert('خطا در پردازش خرید');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all group">
    <div className="relative aspect-video overflow-hidden">
      <img src={course.image} alt={course.title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      <div className="absolute top-3 right-3 px-2.5 py-1 bg-brand-primary text-white rounded-lg text-[10px] font-black shadow-lg">
        ویژه
      </div>
    </div>
    <div className="p-4 space-y-3">
      <h4 className="font-bold text-brand-secondary text-sm sm:text-base line-clamp-2 h-10 sm:h-12 text-right leading-relaxed">
        {course.title}
      </h4>
        <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
        <span><Icon fa="fa-chalkboard-user" className="ml-1" /> {course.instructor}</span>
        <span className="text-yellow-500 font-bold"><Icon fa="fa-star" className="ml-1" /> {course.rating}</span>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <span className="text-base font-black text-brand-primary">{course.price} <span className="text-[10px] font-normal text-gray-400 mr-0.5">تومان</span></span>
        <button onClick={handleQuickPurchase} className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl bg-gray-50 text-brand-secondary hover:bg-brand-secondary hover:text-white transition-all flex items-center justify-center">
          <Icon fa="fa-plus" className="text-sm" />
        </button>
      </div>
    </div>
  </div>
  );
};

const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-3 space-y-3 animate-pulse">
    <div className="w-full aspect-video bg-gray-100 rounded-xl"></div>
    <div className="h-4 bg-gray-100 rounded w-full"></div>
    <div className="h-3 bg-gray-100 rounded w-1/2 mr-0 ml-auto"></div>
    <div className="flex justify-between items-center pt-3">
      <div className="h-5 bg-gray-100 rounded w-1/3"></div>
      <div className="w-8 h-8 bg-gray-100 rounded-lg"></div>
    </div>
  </div>
);

  const ContentList: React.FC<ContentListProps> = ({ title }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCourses([
        { id: '1', title: 'دوره جامع کنکور ریاضی - مبحث مشتق و انتگرال', instructor: 'استاد علوی', rating: 4.9, price: '۸۵۰,۰۰۰', image: 'https://picsum.photos/400/225?random=21', category: 'کنکور' },
        { id: '2', title: 'آموزش گرامر انگلیسی از صفر تا صد (مقدماتی)', instructor: 'سارا رضایی', rating: 4.7, price: '۴۲۰,۰۰۰', image: 'https://picsum.photos/400/225?random=22', category: 'زبان' },
        { id: '3', title: 'برنامه‌نویسی وب با جاوااسکریپت (پروژه‌محور)', instructor: 'مهندس اکبری', rating: 4.8, price: '۹۹۰,۰۰۰', image: 'https://picsum.photos/400/225?random=23', category: 'فنی' },
        { id: '4', title: 'مهارت‌های تندخوانی و تمرکز حواس برای دانش‌آموزان', instructor: 'دکتر ستاری', rating: 5.0, price: '۲۸۰,۰۰۰', image: 'https://picsum.photos/400/225?random=24', category: 'توسعه' },
      ]);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-brand-secondary border-r-4 border-brand-primary pr-3">{title}</h2>
        <Link to="/courses" className="text-brand-primary font-bold text-xs hover:underline">مشاهده همه</Link>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {loading 
          ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : courses.map(course => <CourseCard key={course.id} course={course} />)
        }
      </div>
    </div>
  );
};

export default React.memo(ContentList);
