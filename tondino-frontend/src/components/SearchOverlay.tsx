
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '@/context/UIContext';
import { useSelection } from '@/context/SelectionContext';
import { useCourses } from '@/context/CoursesContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, XCircle, Frown } from 'lucide-react';

const SearchOverlay: React.FC = () => {
  const navigate = useNavigate();
  const { isSearchOpen, setIsSearchOpen } = useUI();
  const { setSelectedCourse } = useSelection();
  const { courses } = useCourses();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(courses);
  const inputRef = useRef<HTMLInputElement>(null);

  // Helper to normalize Persian/Arabic characters for accurate search
  const normalizePersian = (text: string) => {
    return text
      .replace(/ي/g, "ی")
      .replace(/ك/g, "ک")
      .replace(/آ/g, "ا")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  };

  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden';
      // Small delay to ensure the input is mounted before focusing
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (!query.trim()) {
      // Show featured/trending courses when empty
      setResults(courses.slice(0, 4));
    } else {
      const q = normalizePersian(query);
      const filtered = courses.filter(c => 
        normalizePersian(c.title).includes(q) || 
        normalizePersian(c.instructor).includes(q) ||
        normalizePersian(c.category).includes(q) ||
        (c.description && normalizePersian(c.description).includes(q))
      );
      setResults(filtered);
    }
  }, [query]);

  const handleSelect = (course: any) => {
    setSelectedCourse(course);
    navigate('/course-detail/' + course.id);
    setIsSearchOpen(false);
    // Reset query after a short delay to keep the closing animation smooth
    setTimeout(() => setQuery(''), 300);
  };

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl transition-all flex flex-col items-center pt-20 px-6 animate-in fade-in duration-300">
      {/* Top Bar Actions */}
      <div className="absolute top-8 left-8 flex items-center gap-4">
        <button 
          onClick={() => { setIsSearchOpen(false); setTimeout(() => setQuery(''), 300); }}
          className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-300 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
          title="بستن (Esc)"
        >
          <X size={20} />
        </button>
      </div>

      <div className="w-full max-w-2xl space-y-10">
        <div className="relative group">
          <input 
            ref={inputRef}
            type="text" 
            placeholder="دنبال چی می‌گردی؟ تندخوانی، تمرکز..."
            className="w-full bg-transparent border-b-2 border-brand-primary/10 dark:border-white/10 py-6 pr-14 pl-12 text-2xl md:text-4xl font-black text-brand-primary dark:text-white outline-none focus:border-brand-primary dark:focus:border-brand-accent transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600 text-right"
            dir="rtl"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setIsSearchOpen(false)}
          />
          {/* Right Icon (Search) */}
          <div className="absolute top-1/2 right-2 -translate-y-1/2 text-brand-primary/20 dark:text-white/20 group-focus-within:text-brand-accent">
            <Search size={26} />
          </div>
          
          {/* Left Icon (Clear Button) */}
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setQuery('')}
                className="absolute top-1/2 left-2 -translate-y-1/2 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-gray-100 dark:bg-slate-800 text-gray-400 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              >
                <XCircle size={20} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6 text-right">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>
              {query ? `${results.length} نتیجه پیدا شد` : 'پیشنهادهای ویژه تندینو'}
            </h3>
            {!query && <span className="text-[10px] font-bold text-brand-accent uppercase tracking-tighter">Trending Now</span>}
          </div>

          <div className="grid gap-4 max-h-[60vh] overflow-y-auto no-scrollbar pb-20 pr-2 pl-2">
            {results.map((course, idx) => (
              <motion.div 
                key={course.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleSelect(course)}
                className="group p-5 bg-gray-50 dark:bg-slate-900 rounded-[2.5rem] flex items-center gap-6 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer border border-transparent hover:border-brand-accent/20 hover:shadow-premium shadow-sm relative overflow-hidden"
              >
                 <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden shrink-0 shadow-inner bg-gray-200 dark:bg-slate-800">
                    <img src={course.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                 </div>
                 <div className="flex-grow text-right space-y-1">
                   <div className="flex items-center justify-end gap-2">
                      <span className="text-[9px] font-black text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded-md uppercase tracking-tighter">{course.category}</span>
                   </div>
                   <h4 className="font-black text-brand-primary dark:text-white group-hover:text-brand-accent transition-colors text-lg">{course.title}</h4>
                   <p className="text-xs text-gray-400 font-bold">{course.instructor}</p>
                 </div>
                 <div className="text-left font-black text-brand-primary dark:text-teal-400 ltr-num text-xl flex flex-col items-end">
                    {course.price}
                    <span className="text-[9px] text-gray-400 opacity-50 font-bold uppercase">Toman</span>
                 </div>
              </motion.div>
            ))}
            
            {results.length === 0 && (
               <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="py-20 text-center space-y-6"
               >
                    <div className="w-24 h-24 bg-gray-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto text-4xl text-gray-200 dark:text-slate-800 border-2 border-dashed border-gray-100 dark:border-white/5">
                      <Frown size={36} />
                    </div>
                  <div className="space-y-2">
                    <p className="text-brand-primary dark:text-white font-black text-2xl">موردی یافت نشد!</p>
                    <p className="text-gray-400 text-sm font-medium">شاید با کلمات ساده‌تری جستجو کنید بهتر باشد.</p>
                  </div>
                  <button 
                    onClick={() => setQuery('')} 
                    className="px-8 py-3 bg-brand-primary text-white rounded-2xl font-black text-xs hover:bg-brand-accent transition-colors shadow-lg shadow-brand-primary/20"
                  >
                    پاک کردن و نمایش همه
                  </button>
               </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
