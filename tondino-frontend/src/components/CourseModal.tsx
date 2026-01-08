import React from 'react';
import { useSelection } from '@/context/SelectionContext';
import { Button } from './ui/Button';
import { enToFaNumbers } from '@/utils/numToPersian';
import IconWrapper from './IconWrapper';

const CourseModal: React.FC = () => {
   const { selectedCourse, setSelectedCourse } = useSelection();

  if (!selectedCourse) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-[130] bg-brand-secondary/60 backdrop-blur-md animate-in fade-in"
        onClick={() => setSelectedCourse(null)}
      />
      <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
        <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden pointer-events-auto flex flex-col md:flex-row animate-in zoom-in duration-300">
          
          {/* Visual/Video Side */}
          <div className="w-full md:w-1/2 relative group">
            <img src={selectedCourse.image} className="w-full h-full object-cover min-h-[300px]" alt={selectedCourse.title} />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
               <button className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 text-white flex items-center justify-center text-3xl hover:scale-110 transition-transform">
                  <IconWrapper className="fa-solid fa-play ml-1" fa="fa-play" />
               </button>
            </div>
            <div className="absolute top-6 right-6">
               <span className="bg-brand-accent text-white px-4 py-2 rounded-xl text-xs font-black shadow-xl uppercase tracking-widest">
                  {selectedCourse.category}
               </span>
            </div>
          </div>

          {/* Content Side */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col text-right">
            <div className="flex justify-between items-start mb-6">
               <button 
                  onClick={() => setSelectedCourse(null)}
                  className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-red-500 transition-colors shrink-0"
               >
                  <IconWrapper className="fa-solid fa-xmark" fa="fa-xmark" />
               </button>
               <div className="space-y-2">
                  <h2 className="text-2xl font-black text-brand-primary dark:text-white leading-tight">
                    {selectedCourse.title}
                  </h2>
                              <div className="flex items-center justify-end gap-3 text-sm text-gray-400 font-bold">
                              <span>{selectedCourse.instructor}</span>
                              <IconWrapper className="fa-solid fa-chalkboard-user text-brand-accent" fa="fa-chalkboard-user" />
                           </div>
               </div>
            </div>

            <div className="flex-grow space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-gray-50 dark:bg-slate-800 rounded-2xl flex flex-col items-center">
                     <span className="text-xs text-gray-400 font-black uppercase mb-1">تعداد دانشجو</span>
                     <span className="text-xl font-black text-brand-primary dark:text-white">+{enToFaNumbers((selectedCourse as any)?.students ?? 1200)}</span>
                  </div>
                  <div className="p-5 bg-gray-50 dark:bg-slate-800 rounded-2xl flex flex-col items-center">
                     <span className="text-xs text-gray-400 font-black uppercase mb-1">رضایت</span>
                     <span className="text-xl font-black text-brand-primary dark:text-white">{selectedCourse.rating} / ۵</span>
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="font-black text-brand-primary dark:text-white text-sm">آنچه در این دوره می‌آموزید:</h4>
                  <ul className="space-y-2">
                     {['تکنیک‌های مدیریت استرس', 'افزایش تمرکز حین مطالعه', 'نقشه‌کشی ذهنی (Mind Mapping)', 'تثبیت حافظه بلندمدت'].map((item, idx) => (
                        <li key={idx} className="flex items-center gap-3 justify-end text-xs font-bold text-gray-500 dark:text-gray-400">
                           {item}
                           <IconWrapper className="fa-solid fa-check text-brand-accent" fa="fa-check" />
                        </li>
                     ))}
                  </ul>
               </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
               <div className="text-right">
                  <span className="text-2xl font-black text-brand-secondary dark:text-white">{selectedCourse.price}</span>
                  <span className="text-[10px] text-gray-400 font-bold mr-1 uppercase">تومان</span>
               </div>
               <Button variant="accent" size="lg" className="rounded-2xl px-12 shadow-glow">
                  خرید و شروع یادگیری
               </Button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default CourseModal;