
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelection } from '@/context/SelectionContext';
import { useUI } from '@/context/UIContext';
import { useStats } from '@/context/StatsContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from './ui/Button';
import { enToFaNumbers } from '@/utils/numToPersian';
import { coursesAPI } from '@/services/api';
import Icon from './Icon';

const CourseDetailView: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCourse, setSelectedCourse, setSelectedLesson } = useSelection();
  const { setIsAuthModalOpen } = useUI();
  const { userStats, purchaseCourse } = useStats();
  const { isAuthenticated } = useAuth();
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch full course details with lessons when component mounts
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!selectedCourse) return;

      // If course already has syllabus, no need to fetch
      if (selectedCourse.syllabus && selectedCourse.syllabus.length > 0) return;

      setLoading(true);
      try {
        const data = await coursesAPI.getById(selectedCourse.id);
        if (data.course) {
          setSelectedCourse(data.course);
        }
      } catch (error) {
        console.error('Failed to load course details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [selectedCourse?.id]);

  if (!selectedCourse) {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 text-center animate-in fade-in">
        <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-3xl text-gray-400">
          <Icon fa="fa-triangle-exclamation" className="text-3xl" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-brand-primary dark:text-white">دوره مورد نظر یافت نشد</h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto hidden md:block">احتمالاً به دلیل تغییر فیلترها دسترسی به این دوره موقتاً مقدور نیست.</p>
        </div>
        <Button onClick={() => navigate('/courses')} variant="accent" className="rounded-2xl px-10">
          بازگشت به لیست دوره‌ها
        </Button>
      </div>
    );
  }

  const isPurchased = userStats.completedCourseIds.includes(String(selectedCourse.id)) || String(selectedCourse.id) === 'c1';

  const handleStartLesson = (lesson: any) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    
    if (!isPurchased) {
      purchaseCourse(selectedCourse.id);
    }

    setSelectedLesson(lesson);
    navigate('/lesson/' + selectedCourse.id);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleMainAction = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!isPurchased) {
      purchaseCourse(selectedCourse.id);
      return;
    }

    if (selectedCourse.syllabus && selectedCourse.syllabus.length > 0) {
      handleStartLesson(selectedCourse.syllabus[0]);
    }
  };

  const courseStats = [
    { label: 'مدت زمان', value: '۱۲ ساعت', icon: 'fa-clock' },
    { label: 'تعداد جلسات', value: `${enToFaNumbers(selectedCourse.syllabus?.length || 0)} درس`, icon: 'fa-layer-group' },
    { label: 'سطح دوره', value: 'پیشرفته', icon: 'fa-signal' },
    { label: 'مدرک', value: 'دارد', icon: 'fa-certificate' }
  ];

  return (
    <div className="pb-40 lg:pb-20 pt-4 animate-in fade-in duration-700 pb-[env(safe-area-inset-bottom)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 lg:mb-12">
        <button 
          onClick={() => navigate('/courses')}
          className="flex items-center gap-2 text-brand-primary dark:text-gray-400 font-black hover:translate-x-2 transition-transform w-fit"
        >
              <Icon fa="fa-arrow-right" className="mr-1" />
          بازگشت به کاتالوگ دوره‌ها
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8 space-y-10 lg:space-y-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative h-[300px] md:h-[500px] rounded-[3rem] lg:rounded-[4rem] overflow-hidden shadow-premium group"
          >
            <img src={selectedCourse.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-primaryDark via-brand-primaryDark/40 to-transparent"></div>
            
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={handleMainAction}
                className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 text-white flex items-center justify-center text-2xl lg:text-3xl"
               >
                <Icon fa="fa-play" className="ml-2 text-2xl" />
               </button>
            </div>

            <div className="absolute bottom-0 inset-x-0 p-6 lg:p-14 text-white text-right space-y-2">
               <h1 className="text-2xl lg:text-5xl font-black max-w-4xl mr-0 leading-tight">{selectedCourse.title}</h1>
               <p className="text-brand-accent font-bold text-sm lg:text-base">مدرس: {selectedCourse.instructor}</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {courseStats.map((stat, i) => (
              <div key={i} className="glass-card p-4 lg:p-6 rounded-[2rem] lg:rounded-[2.5rem] text-center space-y-3 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-brand-primary/5 dark:bg-white/5 rounded-2xl flex items-center justify-center text-brand-accent mx-auto mb-1">
                  <Icon fa={stat.icon} className="text-lg lg:text-xl" />
                </div>
                <p className="text-xs font-black text-brand-textMuted uppercase">{stat.label}</p>
                <p className="text-sm lg:text-base font-black text-brand-primary dark:text-white">{stat.value}</p>
              </div>
            ))}
          </div>

          <section className="space-y-6 lg:space-y-8 text-right">
            <h2 className="text-xl lg:text-2xl font-black text-brand-primary dark:text-white border-r-8 border-brand-accent pr-6">سرفصل‌های آموزشی</h2>
            <div className="space-y-4">
              {selectedCourse.syllabus?.map((lesson, idx) => (
                <div key={lesson.id} className="glass-card rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden border-white/40">
                   <button 
                      onClick={() => setActiveAccordion(activeAccordion === String(lesson.id) ? null : String(lesson.id))}
                      className="w-full p-5 lg:p-6 flex items-center justify-between text-right"
                   >
                      <Icon fa="fa-chevron-down" className={`transition-transform ${activeAccordion === lesson.id ? 'rotate-180 text-brand-accent' : 'text-gray-300'}`} />
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                           <h4 className="text-xs lg:text-sm font-black text-brand-primary dark:text-white">{lesson.title}</h4>
                           <span className="text-[10px] text-gray-400 ltr-num">{lesson.duration}</span>
                        </div>
                        <span className="w-11 h-11 lg:w-12 lg:h-12 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center font-black text-sm lg:text-base text-gray-400">{enToFaNumbers(idx + 1)}</span>
                      </div>
                   </button>
                   <AnimatePresence>
                      {activeAccordion === lesson.id && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                           <div className="p-5 lg:p-6 pt-0 border-t border-gray-50 dark:border-white/5">
                              <p className="text-[11px] lg:text-xs text-gray-500 leading-relaxed py-4 hidden md:block">{lesson.content}</p>
                              <Button 
                                onClick={() => handleStartLesson(lesson)} 
                                size="sm" 
                                variant="accent" 
                                className="w-full rounded-xl"
                              >
                                {isPurchased ? 'ورود به جلسه' : 'ثبت نام و شروع درس'}
                              </Button>
                           </div>
                        </motion.div>
                      )}
                   </AnimatePresence>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Desktop Sidebar (Price Card) */}
        <div className="lg:col-span-4 hidden lg:block sticky top-32">
          <div className="glass-card p-10 rounded-[3.5rem] text-center space-y-8 border-white/60">
             <div className="space-y-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">وضعیت دسترسی</span>
                <p className="text-3xl font-black text-brand-primary dark:text-white ltr-num">{isPurchased ? 'دسترسی کامل دارید' : selectedCourse.price}</p>
             </div>
             <Button 
              onClick={handleMainAction}
              variant="accent" 
              className="w-full rounded-2xl py-5 shadow-glow font-black"
             >
                {isPurchased ? 'ورود به اولین جلسه' : 'ثبت نام در دوره'}
             </Button>
          </div>
        </div>
      </div>

      {/* Mobile Action Bar (Sticky at Bottom) */}
      <div className="fixed bottom-24 inset-x-0 z-[45] lg:hidden px-4">
         <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-[2rem] p-4 flex items-center justify-between shadow-2xl"
         >
            <div className="text-right">
               <span className="block text-[10px] font-black text-gray-400 uppercase">{isPurchased ? 'دسترسی' : 'قیمت دوره'}</span>
               <span className="text-lg font-black text-brand-primary dark:text-white ltr-num">{isPurchased ? 'فعال' : selectedCourse.price}</span>
            </div>
            <Button 
               onClick={handleMainAction}
               variant="accent" 
               className="rounded-xl px-8 py-3 shadow-glow font-black text-xs"
            >
               {isPurchased ? 'ورود به درس' : 'ثبت نام سریع'}
            </Button>
         </motion.div>
      </div>
    </div>
  );
};

export default CourseDetailView;
