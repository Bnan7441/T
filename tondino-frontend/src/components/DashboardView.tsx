
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStats } from '@/context/StatsContext';
import { useAuth } from '@/context/AuthContext';
import { useSelection } from '@/context/SelectionContext';
import { useCourses } from '@/context/CoursesContext';
import Icon from './Icon';
import { Button } from './ui/Button';

const DashboardView: React.FC = () => {
   const navigate = useNavigate();
   const { userStats } = useStats();
   const { userProfile } = useAuth();
   const { setSelectedCourse } = useSelection();
   const { courses, myCourses, loading } = useCourses();
  
  const weeklyProgress = [
    { day: 'ش', value: 45 },
    { day: 'ی', value: 80 },
    { day: 'د', value: 30 },
    { day: 'س', value: 95 },
    { day: 'چ', value: 60 },
    { day: 'پ', value: 20 },
    { day: 'ج', value: 10 },
  ];

  const handleContinue = (course: any) => {
    setSelectedCourse(course);
    navigate('/course-detail/' + course.id);
  };

   return (
      <div className="py-8 space-y-12 animate-in fade-in duration-700 pb-[env(safe-area-inset-bottom)]">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-brand-primary p-8 rounded-[3rem] text-white shadow-premium relative overflow-hidden min-h-[140px]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/20 blur-[100px] rounded-full"></div>
        <div className="relative z-10 flex items-center gap-6 text-right">
           <div className="relative">
              <img src={userProfile.avatar} loading="lazy" decoding="async" className="w-20 h-20 rounded-3xl border-2 border-brand-accent shadow-2xl" alt={`پروفایل ${userProfile.name}`} />
              <div className="absolute -bottom-2 -left-2 bg-yellow-400 text-brand-primary w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-lg">
                {userStats.level}
              </div>
           </div>
           <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-black">{userProfile.name} عزیز؛ خوش آمدید</h2>
              <p className="text-white/60 text-xs font-medium">امروز بهترین زمان برای یادگیری یک مهارت جدید و تقویت حافظه است!</p>
              <button 
                onClick={() => navigate('/profile')}
                className="text-[10px] font-black text-brand-accent hover:underline uppercase tracking-widest mt-2 block"
              >
                        مشاهده و ویرایش حساب کاربری <Icon fa="fa-arrow-left" className="mr-1" />
              </button>
           </div>
        </div>
        <div className="relative z-10 flex gap-8">
           <div className="text-center">
              <p className="text-3xl font-black text-brand-accent">{userStats.points.toLocaleString('fa-IR')}</p>
              <p className="text-xs font-black uppercase text-white/40 tracking-widest mt-1">امتیاز کسب شده</p>
           </div>
           <div className="text-center">
              <p className="text-3xl font-black">{userStats.streak.toLocaleString('fa-IR')}</p>
              <p className="text-xs font-black uppercase text-orange-400 tracking-widest mt-1">روز متوالی مطالعه</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 glass-card p-8 rounded-[2.5rem] shadow-premium flex flex-col space-y-8">
           <div className="flex items-center justify-between">
              <div className="text-right">
                 <h3 className="text-xl font-black text-brand-primary dark:text-white">نمودار پیشرفت یادگیری</h3>
                 <p className="text-xs text-gray-400 font-medium">ساعات مطالعه و تمرکز شما در هفته جاری</p>
              </div>
              <div className="flex items-center gap-2">
                 <span className="w-3 h-3 rounded-full bg-brand-accent"></span>
                 <span className="text-[10px] font-black text-gray-400">شاخص تمرکز</span>
              </div>
           </div>
           
           <div className="flex-grow flex items-end justify-between h-48 px-4">
              {weeklyProgress.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-4 group">
                   <div className="relative w-10 md:w-14 flex items-end justify-center bg-gray-50 dark:bg-slate-800 rounded-2xl h-full overflow-hidden">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${day.value}%` }}
                        transition={{ duration: 1, delay: idx * 0.1 }}
                        className="w-full bg-brand-primary group-hover:bg-brand-accent transition-colors relative"
                      >
                         <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                      </motion.div>
                   </div>
                   <span className="text-xs font-black text-gray-400">{day.day}</span>
                </div>
              ))}
           </div>
        </div>

        <div className="lg:col-span-4 glass-card p-8 rounded-[2.5rem] shadow-premium space-y-6">
           <h3 className="text-xl font-black text-brand-primary dark:text-white text-right">ادامه مسیر یادگیری</h3>
           <div className="space-y-4">
              {loading ? (
                <div className="animate-pulse bg-gray-200 rounded-2xl h-48"></div>
              ) : (myCourses.length > 0 || courses.length > 0) ? (
              <>
              <div className="relative aspect-video rounded-2xl overflow-hidden group">
                 <img src={(myCourses[0] || courses[0])?.image} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={`تصویر دوره ${(myCourses[0] || courses[0])?.title}`} />
                 <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleContinue(myCourses[0] || courses[0])} className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-primary shadow-xl">
                       <Icon fa="fa-play" />
                    </button>
                 </div>
              </div>
              <div className="text-right space-y-2">
                 <h4 className="font-black text-brand-primary dark:text-white line-clamp-1">{(myCourses[0] || courses[0])?.title}</h4>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-400">۴ جلسه از ۱۲ جلسه باقی‌مانده</span>
                    <span className="text-[10px] font-black text-brand-accent">۶۵٪</span>
                 </div>
                 <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-accent w-[65%]"></div>
                 </div>
              </div>
              </>
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                  هنوز دوره‌ای خریداری نکرده‌اید
                </div>
              )}
              <Button
                variant="accent"
                className="w-full rounded-xl py-3"
                onClick={() => navigate('/courses')}
                disabled={loading}
              >
                مشاهده دوره‌ها
              </Button>
           </div>
        </div>

        <div className="lg:col-span-12 space-y-6">
           <h3 className="section-title">نشان‌های افتخار کسب شده</h3>
           <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {userStats.badges.map((badge, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ y: -5 }}
                  className="glass-card p-6 rounded-[2rem] flex flex-col items-center text-center gap-3 border-white/40 group cursor-help"
                >
                      <div className="w-16 h-16 bg-brand-primary/5 dark:bg-white/5 rounded-2xl flex items-center justify-center text-3xl text-brand-accent group-hover:scale-110 transition-transform">
                      <Icon fa="fa-award" />
                   </div>
                   <span className="text-[10px] font-black text-brand-primary dark:text-white uppercase tracking-wider">{badge}</span>
                </motion.div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(DashboardView);
