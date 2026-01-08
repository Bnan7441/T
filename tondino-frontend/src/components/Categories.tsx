
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUI } from '@/context/UIContext';
import { AgeGroup } from '@/types';
import Icon from './Icon';

interface CategoryItem {
  id: string;
  title: string;
  icon: string;
  color: string;
  filterKey: string;
  allowedAges?: AgeGroup[];
}

const categories: CategoryItem[] = [
  {
    id: 'elementary',
    title: "ابتدایی",
    icon: "fa-shapes",
    color: "bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-brand-primary",
    filterKey: "ابتدایی",
    allowedAges: ['kid']
  },
  {
    id: 'mid1',
    title: "متوسطه ۱",
    icon: "fa-book",
    color: "bg-brand-accent/10 text-brand-accent dark:bg-brand-accent/20 dark:text-brand-accent",
    filterKey: "متوسطه",
    allowedAges: ['teen']
  },
  {
    id: 'mid2',
    title: "متوسطه ۲",
    icon: "fa-flask",
    color: "bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-brand-primary",
    filterKey: "متوسطه",
    allowedAges: ['teen']
  },
  {
    id: 'entrance',
    title: "کنکور",
    icon: "fa-graduation-cap",
    color: "bg-brand-accent/10 text-brand-accent dark:bg-brand-accent/20 dark:text-brand-accent",
    filterKey: "کنکور",
    allowedAges: ['teen', 'adult']
  },
  {
    id: 'lang',
    title: "زبان",
    icon: "fa-language",
    color: "bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-brand-primary",
    filterKey: "زبان",
    allowedAges: ['kid', 'teen', 'adult']
  },
  {
    id: 'speed',
    title: "تندخوانی",
    icon: "fa-bolt",
    color: "bg-brand-accent/10 text-brand-accent dark:bg-brand-accent/20 dark:text-brand-accent",
    filterKey: "تندخوانی",
    allowedAges: ['kid', 'teen', 'adult']
  },
  {
    id: 'counsel',
    title: "مشاوره",
    icon: "fa-user-doctor",
    color: "bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-brand-primary",
    filterKey: "مشاوره",
    allowedAges: ['teen', 'adult']
  },
  {
    id: 'ai',
    title: "هوش مصنوعی",
    icon: "fa-robot",
    color: "bg-brand-accent/10 text-brand-accent dark:bg-brand-accent/20 dark:text-brand-accent",
    filterKey: "هوش مصنوعی",
    allowedAges: ['teen', 'adult']
  }
];

interface CategoriesProps {
  shouldScroll?: boolean;
}

const Categories: React.FC<CategoriesProps> = ({ shouldScroll = true }) => {
  const { activeCategory, setActiveCategory, setActiveAgeGroup, activeAgeGroup } = useUI();

  const visibleCategories = useMemo(() => {
    if (!activeAgeGroup) return categories;
    return categories.filter(cat => cat.allowedAges?.includes(activeAgeGroup));
  }, [activeAgeGroup]);

  const handleCategoryClick = (filterKey: string) => {
    const newValue = activeCategory === filterKey ? null : filterKey;
    setActiveCategory(newValue);
    
    if (shouldScroll) {
      const section = document.getElementById('featured');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const clearAllFilters = () => {
    setActiveCategory(null);
    setActiveAgeGroup(null);
  };

  return (
    <div className="space-y-4 md:space-y-8">
       <div className="flex items-center justify-between px-0">
         <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-brand-primary dark:text-white">دسته‌بندی‌ها</h2>
            {activeAgeGroup && (
               <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-brand-accent bg-brand-accent/5 px-2 py-0.5 md:px-3 md:py-1 rounded-lg hidden sm:block">
                 فیلتر بر اساس مقطع سنی
               </span>
            )}
         </div>
         {(activeCategory || activeAgeGroup) && (
            <button 
                onClick={clearAllFilters}
                className="text-[8px] sm:text-[9px] md:text-xs font-black text-red-500 hover:text-red-600 transition-colors bg-red-50 dark:bg-red-900/10 px-3 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl"
            >
                پاک کردن
            </button>
         )}
       </div>
       
       <div className="px-0">
         <div className="flex lg:grid lg:grid-cols-4 gap-3 lg:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-2">
        <AnimatePresence mode="popLayout">
          {visibleCategories.map((cat) => {
            const isActive = activeCategory === cat.filterKey;
            
            return (
              <motion.div 
                  key={cat.id} 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => handleCategoryClick(cat.filterKey)}
                  whileTap={{ scale: 0.95 }}
                  className={`relative p-4 lg:p-8 rounded-xl lg:rounded-xl flex flex-col items-center justify-center gap-3 lg:gap-4 transition-all cursor-pointer border shadow-premium glass-card h-24 lg:h-44 group min-w-[90px] ${
                      isActive 
                          ? 'bg-brand-primary border-brand-primary shadow-glow !backdrop-blur-none' 
                          : 'hover:border-brand-accent/30 hover:shadow-card-hover'
                  }`}
              >
                  <div className={`w-8 lg:w-12 h-8 lg:h-12 rounded-base flex items-center justify-center text-base lg:text-2xl transition-all ${
                      isActive 
                          ? 'bg-white text-brand-primary' 
                          : `${cat.color} shadow-sm`
                  }`}>
                      <Icon fa={cat.icon} className="" />
                  </div>
                  
                    <span className={`text-[10px] lg:text-base font-black transition-colors whitespace-nowrap ${isActive ? 'text-white' : 'text-brand-primary dark:text-white'}`}>
                      {cat.title}
                    </span>

                  {isActive && (
                    <motion.div 
                      layoutId="active-dot"
                      className="absolute top-2 right-2 lg:top-4 lg:right-4 w-2 h-2 rounded-full bg-brand-accent"
                    />
                  )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Categories;
