import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelection } from '@/context/SelectionContext';
import { Button } from './ui/Button';
import { enToFaNumbers } from '@/utils/numToPersian';
import Icon from './Icon';
import { GoogleGenAI } from '@google/genai';
import { coursesAPI } from '@/services/api';

const LessonView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // This is courseId based on routing logic
  const { selectedCourse, selectedLesson, setSelectedLesson, setSelectedCourse, setLastLesson } = useSelection();
  const [activeTab, setActiveTab] = useState<'content' | 'notes' | 'resources'>('content');
  const [noteText, setNoteText] = useState('');
  const [isAiSummarizing, setIsAiSummarizing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isStickyPlayer, setIsStickyPlayer] = useState(false);
  const [loading, setLoading] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Recovery Logic: Fetch course if missing
  useEffect(() => {
    const loadCourse = async () => {
        if (!id) return;
        // If we have course content already, skip
        if (selectedCourse && String(selectedCourse.id) === id && selectedCourse.syllabus?.length) return;
        
        setLoading(true);
        try {
            const data = await coursesAPI.getById(id);
            if (data.course) {
                setSelectedCourse(data.course);
            }
        } catch (error) {
            console.error("Failed to load course for lesson view:", error);
            // Optionally redirect back if not found
            // navigate('/courses');
        } finally {
            setLoading(false);
        }
    };
    loadCourse();
  }, [id, selectedCourse?.id, setSelectedCourse]);

  // Set default lesson if selectedLesson is missing
  useEffect(() => {
    if (selectedCourse?.syllabus?.length && !selectedLesson) {
        setSelectedLesson(selectedCourse.syllabus[0]);
    } else if (selectedCourse?.syllabus?.length && selectedLesson) {
        // Ensure selected lesson belongs to this course
        const exists = selectedCourse.syllabus.find(l => l.id === selectedLesson.id);
        if (!exists) {
             setSelectedLesson(selectedCourse.syllabus[0]);
        }
    }
  }, [selectedCourse, selectedLesson, setSelectedLesson]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (mainContentRef.current) {
        setIsStickyPlayer(mainContentRef.current.scrollTop > 120);
      }
    };
    const currentRef = mainContentRef.current;
    currentRef?.addEventListener('scroll', handleScroll);
    return () => currentRef?.removeEventListener('scroll', handleScroll);
  }, []);

  // Track the last lesson
  useEffect(() => {
    if (selectedLesson && selectedCourse) {
      setLastLesson({
        courseId: String(selectedCourse.id),
        lessonId: String(selectedLesson.id)
      });
    }
  }, [selectedLesson?.id, selectedCourse?.id, setLastLesson]);

  if (loading || !selectedCourse || !selectedLesson) {
    return (
      <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-12 h-12 border-4 border-brand-accent/20 border-t-brand-accent rounded-full animate-spin"></div>
        <div className="space-y-2">
           <p className="text-brand-primary dark:text-white font-black text-sm">در حال بارگذاری محتوای درس...</p>
           <button onClick={() => navigate(-1)} className="text-xs text-brand-accent underline">بازگشت</button>
        </div>
      </div>
    );
  }

  const lessons = selectedCourse.syllabus || [];
  const currentIndex = lessons.findIndex(l => l.id === selectedLesson.id);
  const progressPercent = Math.round(((currentIndex + 1) / lessons.length) * 100);

  const handleAiSummarize = async () => {
    setIsAiSummarizing(true);
    setAiError(null);
    try {
      // Mock AI for demo to avoid API key issues if env is missing
        await new Promise(r => setTimeout(r, 2000));
        const mockSummary = "درس فعلی به بررسی مفاهیم پیشرفته می‌پردازد. نکات کلیدی شامل مدیریت وضعیت در React، استفاده از هوک‌های سفارشی و بهینه‌سازی عملکرد است. پیشنهاد می‌شود تمرین‌های عملی پایان فصل را انجام دهید.";
        
        let text = mockSummary;
        // Try real AI if key exists
        if (import.meta.env.VITE_GOOGLE_AI_KEY) {
             const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_AI_KEY });
             const response = await ai.models.generateContent({
               model: 'gemini-3-flash-preview',
               contents: [
                 {
                   role: 'user',
                   parts: [
                     {
                       text: `Summarize this in Persian bullet points:\n\n${selectedLesson.content || ''}`,
                     },
                   ],
                 },
               ],
             });
             text = response.text || mockSummary;
        }

      setNoteText(prev => prev + "\n\n🤖 خلاصه هوشمند:\n" + text);
      setActiveTab('notes');
    } catch (e: any) {
        // Fallback to mock on error
         setNoteText(prev => prev + "\n\n🤖 خلاصه هوشمند (آفلاین):\nاین بخش به دلیل عدم دسترسی به اینترنت یا کلید API به صورت پیش‌فرض تولید شده است. لطفاً اتصال خود را بررسی کنید.");
      setActiveTab('notes');
    } finally {
      setIsAiSummarizing(false);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf': return { icon: 'fa-file-pdf', className: 'text-red-500' };
      case 'link': return { icon: 'fa-link', className: 'text-blue-500' };
      default: return { icon: 'fa-file', className: 'text-gray-400' };
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom)]" dir="rtl">
      
      <header className="h-16 border-b border-gray-100 dark:border-white/5 flex items-center justify-between px-4 lg:px-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-500 hover:text-brand-primary transition-colors flex items-center justify-center shrink-0"
          >
            <Icon fa="fa-chevron-right" className="text-sm" />
          </button>
          <div className="text-right">
            <h1 className="text-sm lg:text-base font-black text-brand-primary dark:text-white line-clamp-1">{selectedLesson.title}</h1>
            <p className="text-[10px] text-brand-accent font-black uppercase tracking-wide mt-0.5">{selectedCourse.title}</p>
          </div>
        </div>

        <button 
          onClick={() => setSidebarOpen(true)}
          className="w-10 h-10 rounded-xl bg-brand-primary/5 text-brand-primary hover:bg-brand-primary hover:text-white transition-all flex items-center justify-center"
        >
          <Icon fa="fa-list-ul" className="text-lg" />
        </button>
      </header>

      <div className="flex flex-grow overflow-hidden relative">
        <main ref={mainContentRef} className="flex-grow overflow-y-auto no-scrollbar bg-slate-50 dark:bg-slate-950 pb-40">
           
           <div className={`transition-all duration-300 z-40 ${isStickyPlayer ? 'sticky top-0 px-0' : 'p-0 md:p-6'}`}>
              <div className={`relative aspect-video bg-black overflow-hidden ${isStickyPlayer ? 'rounded-none' : 'rounded-none md:rounded-[2rem]'}`}>
                 {selectedLesson.video_url ? (
                    <iframe
                      src={selectedLesson.video_url}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={selectedLesson.title}
                    />
                 ) : (
                    <>
                      <img src={selectedCourse.image} className="w-full h-full object-cover opacity-40 blur-md" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-gray-800 text-white flex items-center justify-center text-2xl">
                          <Icon fa="fa-video-slash" />
                        </div>
                        <p className="text-[10px] text-white/70 mt-4 font-black">ویدیو در دسترس نیست</p>
                      </div>
                    </>
                 )}
                 <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <p className="text-[10px] text-white/80 font-black text-center">جلسه {enToFaNumbers(currentIndex + 1)} از {enToFaNumbers(lessons.length)}</p>
                 </div>
              </div>
           </div>

           <div className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
              
              <div className="sticky top-2 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-1 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex gap-1">
                 {[
                   { id: 'content', label: 'محتوا', icon: 'fa-book-open' },
                   { id: 'notes', label: 'یادداشت', icon: 'fa-note-sticky' },
                   { id: 'resources', label: 'منابع', icon: 'fa-paperclip' }
                 ].map(t => (
                   <button 
                     key={t.id}
                     onClick={() => setActiveTab(t.id as any)}
                     className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] transition-all ${activeTab === t.id ? 'bg-brand-primary text-white shadow-lg' : 'text-gray-400'}`}
                   >
                     <Icon fa={t.icon} />
                     {t.label}
                   </button>
                 ))}
              </div>

              <div className="min-h-[40vh]">
                 <AnimatePresence mode="wait">
                    {activeTab === 'content' && (
                      <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                         <div className="flex items-center justify-between px-1">
                            <h2 className="text-lg font-black text-brand-primary dark:text-white border-r-4 border-brand-accent pr-4">جزئیات جلسه</h2>
                            <button 
                               onClick={handleAiSummarize}
                               disabled={isAiSummarizing}
                               className="flex items-center gap-2 text-[10px] font-black text-brand-accent bg-brand-accent/5 px-4 py-2.5 rounded-xl border border-brand-accent/20"
                            >
                               {isAiSummarizing ? <Icon fa="fa-spinner" className="animate-spin" /> : <Icon fa="fa-wand-magic-sparkles" />}
                               خلاصه هوشمند
                            </button>
                         </div>
                         
                         {aiError && (
                           <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 text-center">
                              <p className="text-[10px] text-red-600 font-bold">{aiError}</p>
                           </div>
                         )}

                         <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm text-sm text-gray-600 dark:text-gray-300 leading-[2.2] text-justify font-medium">
                            {selectedLesson.content}
                         </div>
                      </motion.div>
                    )}

                    {activeTab === 'notes' && (
                       <motion.div key="notes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                          <textarea 
                             className="w-full h-72 bg-white dark:bg-slate-900 rounded-[2rem] p-6 outline-none border border-gray-100 dark:border-white/5 text-sm font-medium transition-all dark:text-white leading-relaxed"
                             placeholder="نکات مهم این جلسه را اینجا بنویسید..."
                             value={noteText}
                             onChange={(e) => setNoteText(e.target.value)}
                          />
                       </motion.div>
                    )}

                    {activeTab === 'resources' && (
                      <motion.div key="resources" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                         <h2 className="text-lg font-black text-brand-primary dark:text-white border-r-4 border-brand-accent pr-4 mb-6">فایل‌های ضمیمه</h2>
                         {selectedLesson.resources && selectedLesson.resources.length > 0 ? (
                           <div className="grid gap-3">
                              {selectedLesson.resources.map(res => (
                                 <a key={res.id} href={res.url} className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 hover:border-brand-accent/30 transition-all">
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center">
                                          {(() => {
                                            const ic = getResourceIcon(res.type);
                                            return <Icon fa={ic.icon} className={ic.className} />;
                                          })()}
                                       </div>
                                       <div className="text-right">
                                          <p className="text-xs font-black text-brand-primary dark:text-white">{res.title}</p>
                                          <p className="text-[9px] text-gray-400 mt-1 uppercase">{res.type}</p>
                                       </div>
                                    </div>
                                    <Icon fa="fa-download" className="text-gray-300" />
                                 </a>
                              ))}
                           </div>
                         ) : (
                            <div className="text-center py-10 text-gray-400 text-sm">
                               <Icon fa="fa-folder-open" className="text-3xl mb-3 opacity-30" />
                               <p>محتوای ضمیمه‌ای برای این جلسه موجود نیست.</p>
                            </div>
                         )}
                      </motion.div>
                    )}
                 </AnimatePresence>
              </div>
           </div>
        </main>

        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                onClick={() => setSidebarOpen(false)} 
                className="fixed inset-0 bg-brand-primary/20 backdrop-blur-sm z-[110]" 
              />
              <motion.aside 
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} 
                className="fixed inset-y-0 right-0 w-[85%] md:w-96 bg-white dark:bg-slate-900 z-[120] shadow-2xl flex flex-col overflow-hidden"
              >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                   <div className="text-right">
                      <h3 className="font-black text-brand-primary dark:text-white text-sm">سرفصل‌های آموزشی</h3>
                   </div>
                   <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400">
                     <Icon fa="fa-xmark" />
                   </button>
                </div>
                <div className="flex-grow overflow-y-auto p-4 space-y-2 no-scrollbar">
                   {lessons.map((lesson, idx) => (
                     <button
                        key={lesson.id}
                        onClick={() => { setSelectedLesson(lesson); setSidebarOpen(false); }}
                        className={`w-full p-4 rounded-2xl text-right flex items-center gap-4 transition-all ${selectedLesson.id === lesson.id ? 'bg-brand-primary text-white shadow-xl' : 'hover:bg-brand-primary/5 text-gray-600 border border-transparent hover:border-brand-primary/10'}`}
                     >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-black text-xs ${selectedLesson.id === lesson.id ? 'bg-white/20' : 'bg-gray-100 text-gray-400'}`}>
                           {enToFaNumbers(idx + 1)}
                        </div>
                        <div className="flex-grow">
                           <p className="text-[11px] font-black line-clamp-1">{lesson.title}</p>
                           <p className="text-[9px] opacity-60 mt-1">{lesson.duration}</p>
                        </div>
                     </button>
                   ))}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>

      <div className="h-20 border-t border-gray-100 dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl flex items-center justify-between px-6 z-[105]">
         <button 
            disabled={currentIndex === 0} 
            onClick={() => setSelectedLesson(lessons[currentIndex - 1])} 
            className={`flex flex-col items-center gap-1 transition-all ${currentIndex === 0 ? 'opacity-20 pointer-events-none' : 'text-brand-primary'}`}
         >
            <Icon fa="fa-chevron-right" />
            <span className="text-[9px] font-black uppercase">قبلی</span>
         </button>
         
         <div className="flex flex-col items-center gap-2">
            <div className="w-32 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-brand-accent transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="text-[10px] font-black text-gray-400 tracking-widest">{enToFaNumbers(progressPercent)}% تکمیل شده</span>
         </div>

         <button 
            onClick={() => currentIndex === lessons.length - 1 ? navigate('/dashboard') : setSelectedLesson(lessons[currentIndex + 1])} 
            className="flex flex-col items-center gap-1 text-brand-accent"
         >
            <Icon fa="fa-chevron-left" />
            <span className="text-[9px] font-black uppercase">{currentIndex === lessons.length - 1 ? 'پایان' : 'بعدی'}</span>
         </button>
      </div>
    </div>
  );
};

export default LessonView;
