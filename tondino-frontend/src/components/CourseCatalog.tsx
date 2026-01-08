
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CourseList } from '../features/course-list/CourseList';
import Categories from './Categories';
import { useUI } from '@/context/UIContext';
import Icon from './Icon';
import { AgeGroup } from '@/types';

const CourseCatalog: React.FC = () => {
  const { activeAgeGroup, setActiveAgeGroup, activeCategory, setActiveCategory } = useUI();

  const ageGroups: { id: AgeGroup; label: string; icon: string; desc: string; forbiddenCategories: string[] }[] = [
    { id: 'kid', label: 'کودک', icon: 'fa-child-reaching', desc: '۷ تا ۱۲ سال', forbiddenCategories: ['کنکور', 'متوسطه', 'مشاوره', 'هوش مصنوعی'] },
    { id: 'teen', label: 'نوجوان', icon: 'fa-user-graduate', desc: '۱۳ تا ۱۸ سال', forbiddenCategories: ['ابتدایی'] },
    { id: 'adult', label: 'بزرگسال', icon: 'fa-user-tie', desc: '۱۸ سال به بالا', forbiddenCategories: ['ابتدایی', 'متوسطه'] }
  ];

  useEffect(() => {
    if (activeAgeGroup && activeCategory) {
      const currentGroup = ageGroups.find(g => g.id === activeAgeGroup);
      if (currentGroup?.forbiddenCategories.includes(activeCategory)) {
        setActiveCategory(null);
      }
    }
  }, [activeAgeGroup]);

  const getDynamicTitle = () => {
    let title = "دنیای یادگیری را کشف کنید";
    if (activeCategory && activeAgeGroup) {
      const ageLabel = ageGroups.find(a => a.id === activeAgeGroup)?.label;
      title = `دوره‌های ${activeCategory} ویژه ${ageLabel}`;
    } else if (activeCategory) {
      title = `همه دوره‌های ${activeCategory}`;
    } else if (activeAgeGroup) {
      const ageLabel = ageGroups.find(a => a.id === activeAgeGroup)?.label;
      title = `مسیر آموزشی ${ageLabel}`;
    }
    return title;
  };

  return (
    <div className="space-y-16 py-10 pb-[env(safe-area-inset-bottom)]">
      <div className="text-center space-y-6 max-w-3xl mx-auto md:gap-4 md:h-16">
        <div className="inline-block px-4 py-1.5 rounded-full bg-brand-accent/10 text-brand-accent text-[10px] font-black uppercase tracking-widest border border-brand-accent/20">
            تخصصی‌ترین مرکز تندخوانی و تقویت حافظه
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-brand-primary dark:text-white leading-tight">
          {getDynamicTitle()}
        </h1>
        <p className="text-lg text-gray-500 font-medium leading-relaxed">
          با فیلترهای هوشمند تندینو، محتوای متناسب با نیاز خود را پیدا کنید.
        </p>
      </div>

      <section className="space-y-6">
         <h2 className="text-xl font-black text-brand-primary dark:text-white text-right px-2">مقطع تحصیلی شما؟</h2>
         <div className="grid sm:grid-cols-3 gap-4">
            {ageGroups.map((group) => (
              <button
                key={group.id}
                onClick={() => setActiveAgeGroup(activeAgeGroup === group.id ? null : group.id)}
                className={`p-6 rounded-[2.5rem] flex items-center gap-5 transition-all text-right border-2 relative overflow-hidden active:scale-95 ${
                  activeAgeGroup === group.id 
                  ? 'bg-brand-primary border-brand-primary shadow-glow text-white' 
                  : 'bg-white dark:bg-slate-800 border-transparent shadow-glass text-brand-primary dark:text-white hover:border-brand-accent/30'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${activeAgeGroup === group.id ? 'bg-white/20 text-white' : 'bg-brand-primary/10 text-brand-primary'}`}>
                  <Icon fa={group.icon} />
                </div>
                 <div className="space-y-0.5">
                    <p className="font-black text-lg">{group.label}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${activeAgeGroup === group.id ? 'text-white/60' : 'text-gray-400'}`}>{group.desc}</p>
                 </div>
              </button>
            ))}
         </div>
      </section>

      <section>
        <Categories shouldScroll={false} />
      </section>

      <section className="relative min-h-[400px]">
         <CourseList 
            title={activeAgeGroup ? `دوره‌های ${ageGroups.find(a => a.id === activeAgeGroup)?.label}` : "تمامی دوره‌ها"} 
            category={undefined} 
         />
      </section>
    </div>
  );
};

export default React.memo(CourseCatalog);
