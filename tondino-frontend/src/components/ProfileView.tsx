
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useStats } from '@/context/StatsContext';
import { useSelection } from '@/context/SelectionContext';
import { authAPI, coursesAPI } from '@/services/api';
import { Button } from './ui/Button';
import IconWrapper from './IconWrapper';
import { enToFaNumbers } from '@/utils/numToPersian';

const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Mehdi&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Jocelyn&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Buster&backgroundColor=ffd5dc',
];

const ProfileView: React.FC = () => {
   const navigate = useNavigate();
   const { userProfile, updateUserProfile, logout } = useAuth();
   const { userStats } = useStats();
   const { setSelectedCourse } = useSelection();
   const [isEditing, setIsEditing] = useState(false);
   const [editName, setEditName] = useState(userProfile.name);
   const [editAvatar, setEditAvatar] = useState(userProfile.avatar);
   const [myCourses, setMyCourses] = useState<any[]>([]);
   const [loadingCourses, setLoadingCourses] = useState(false);

   // Fetch user's courses on mount
   useEffect(() => {
     const fetchMyCourses = async () => {
       setLoadingCourses(true);
       try {
         const response = await coursesAPI.getMyCourses();
         setMyCourses(response.courses || []);
       } catch (err) {
         console.error('Failed to fetch user courses:', err);
         setMyCourses([]);
       } finally {
         setLoadingCourses(false);
       }
     };

     if (userProfile.email) {
       fetchMyCourses();
     }
   }, [userProfile.email]);

  const handleSave = () => {
    updateUserProfile({ name: editName, avatar: editAvatar });
    setIsEditing(false);
  };

  const handleLogout = () => {
    authAPI.logout();
    logout();
    navigate('/');
  };

  const handleCourseClick = (course: any) => {
    setSelectedCourse(course);
    navigate('/course-detail/' + course.id);
  };

  return (
    <div className="py-8 space-y-12 animate-in fade-in duration-700">
      {/* Navigation */}
      <div className="flex items-center justify-between">
         <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-brand-primary dark:text-gray-400 font-black hover:translate-x-1 transition-transform"
         >
            <IconWrapper className="fa-solid fa-arrow-right" fa="fa-arrow-right" />
            بازگشت به داشبورد
         </button>
         <div className="flex items-center gap-2 px-4 py-2 bg-brand-accent/10 rounded-full border border-brand-accent/20">
            <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></span>
            <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest">نمای کامل پروفایل</span>
         </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Profile Card & Stats */}
        <div className="lg:col-span-4 space-y-8">
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="glass-card p-10 rounded-[4rem] text-center space-y-8 relative overflow-hidden border-white/60"
           >
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-brand-accent to-brand-primary"></div>
              
                 <div className="relative mx-auto w-32 h-32 group">
                 <img src={userProfile.avatar} className="w-full h-full rounded-[2.5rem] object-cover border-4 border-white dark:border-slate-800 shadow-premium" alt={`پروفایل ${userProfile.name}`} />
                 <button 
                   onClick={() => setIsEditing(true)}
                   className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-accent text-white rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform"
                 >
                    <IconWrapper className="fa-solid fa-camera" fa="fa-camera" />
                 </button>
              </div>

              <div className="space-y-1">
                 <h2 className="text-2xl font-black text-brand-primary dark:text-white">{userProfile.name}</h2>
                 <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{userProfile.email}</p>
                 <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 bg-brand-primary/5 dark:bg-white/5 rounded-xl border border-brand-primary/10">
                    <IconWrapper className="fa-solid fa-calendar-check text-brand-accent text-[10px]" fa="fa-calendar-check" />
                    <span className="text-[10px] font-black text-gray-500">عضویت از {userProfile.joinDate}</span>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-8 border-y border-gray-100 dark:border-white/5">
                 <div className="text-center">
                    <p className="text-3xl font-black text-brand-primary dark:text-white ltr-num">{userStats.level}</p>
                    <p className="text-xs font-black text-gray-400 uppercase mt-2">سطح فعلی</p>
                 </div>
                 <div className="text-center">
                    <p className="text-3xl font-black text-brand-accent ltr-num">{userStats.topSpeed}</p>
                    <p className="text-xs font-black text-gray-400 uppercase mt-2">سرعت (WPM)</p>
                 </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="w-full rounded-2xl"
                >
                  ویرایش اطلاعات
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full rounded-2xl border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10"
                >
                  خروج از حساب
                </Button>
              </div>
           </motion.div>

           {/* Achievements Highlight */}
           <div className="space-y-4">
              <h3 className="section-title text-right pr-4">آخرین نشان‌ها</h3>
              <div className="grid grid-cols-3 gap-4">
                 {userStats.badges.slice(0, 3).map((badge, i) => (
                   <div key={i} className="glass-card p-4 rounded-3xl flex flex-col items-center justify-center gap-2 border-white/40">
                                 <div className="w-10 h-10 bg-brand-accent/10 rounded-xl flex items-center justify-center text-brand-accent text-lg">
                                    <IconWrapper className="fa-solid fa-medal" fa="fa-medal" />
                                 </div>
                      <span className="text-[8px] font-black text-center text-gray-500 line-clamp-1">{badge}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right Column: Content & Activity */}
        <div className="lg:col-span-8 space-y-10">
           
           {/* Section: Stats Overview */}
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { label: 'کل امتیازات', val: userStats.points.toLocaleString('fa-IR'), icon: 'fa-star', color: 'text-yellow-500' },
                { label: 'روزهای متوالی', val: userStats.streak, icon: 'fa-fire', color: 'text-orange-500' },
                { label: 'دوره‌های تمام شده', val: userStats.completedCourseIds.length, icon: 'fa-check-double', color: 'text-brand-accent' },
                { label: 'رتبه در هفته', val: '۱۲', icon: 'fa-ranking-star', color: 'text-brand-primary' },
              ].map((stat, i) => (
                <div key={i} className="glass-card p-6 rounded-[2.5rem] text-center space-y-2 border-white/50">
                      <div className={`w-10 h-10 mx-auto rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center ${stat.color}`}>
                   <IconWrapper className={`fa-solid ${stat.icon}`} fa={stat.icon} />
                </div>
                   <p className="text-xl font-black text-brand-primary dark:text-white ltr-num">{typeof stat.val === 'number' ? enToFaNumbers(stat.val) : stat.val}</p>
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
           </div>

           {/* Section: Completed Courses */}
           <section className="space-y-6">
              <div className="flex items-center justify-between px-4">
                 <h2 className="text-2xl font-black text-brand-primary dark:text-white border-r-4 border-brand-accent pr-4">دوره‌های تکمیل شده</h2>
                 <span className="text-[10px] font-black text-brand-textMuted uppercase tracking-widest">{myCourses.length} مورد</span>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6">
                 {myCourses.map((course: any) => (
                   <motion.div 
                     key={course.id || course.course_id}
                     whileHover={{ y: -5 }}
                     onClick={() => handleCourseClick(course)}
                     className="glass-card p-4 rounded-[2.5rem] flex items-center gap-5 border-white/40 cursor-pointer group"
                   >
                      <div className="w-24 h-24 rounded-[2rem] overflow-hidden shrink-0 shadow-premium bg-gray-100 dark:bg-slate-800">
                         <img src={course.image || '/images/hero/hero-1.jpg'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={course.title} />
                      </div>
                      <div className="text-right space-y-1 flex-grow">
                         <div className="flex items-center justify-end gap-1.5 text-green-500">
                            <IconWrapper className="fa-solid fa-circle-check text-[10px]" fa="fa-circle-check" />
                            <span className="text-[9px] font-black uppercase">ثبت نام شده</span>
                         </div>
                         <h4 className="font-black text-brand-primary dark:text-white group-hover:text-brand-accent transition-colors line-clamp-1">{course.title}</h4>
                         <p className="text-[10px] text-gray-400 font-bold">{course.instructor || 'مدرس'}</p>
                         <button onClick={() => handleCourseClick(course)} className="text-[9px] font-black text-brand-accent hover:underline mt-2">ادامه دوره</button>
                      </div>
                   </motion.div>
                 ))}
                 {myCourses.length === 0 && (
                   <div className="col-span-full py-16 text-center glass-card rounded-[3rem] border-dashed border-gray-200">
                      <p className="text-gray-400 font-black">{loadingCourses ? 'درحال بارگذاری...' : 'هنوز در هیچ دوره‌ای ثبت نام نکرده‌اید.'}</p>
                      <button onClick={() => navigate('/courses')} className="text-brand-accent font-black text-xs hover:underline mt-4">مرور دوره‌ها</button>
                   </div>
                 )}
              </div>
           </section>

           {/* Section: All Badges Gallery */}
           <section className="space-y-6">
              <h2 className="text-2xl font-black text-brand-primary dark:text-white border-r-4 border-brand-accent pr-4">گالری افتخارات</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                 {userStats.badges.map((badge, i) => (
                   <div key={i} className="glass-card p-6 rounded-[2rem] flex flex-col items-center justify-center text-center gap-3 border-white/40 group hover:bg-brand-primary/5 transition-all">
                      <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-2xl text-yellow-500 shadow-sm transform group-hover:rotate-12 transition-transform">
                        <IconWrapper className="fa-solid fa-award" fa="fa-award" />
                      </div>
                      <span className="text-[9px] font-black text-gray-500 dark:text-gray-300 uppercase tracking-tighter leading-tight">{badge}</span>
                   </div>
                 ))}
              </div>
           </section>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="fixed inset-0 z-[150] bg-brand-primary/40 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-[160] flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden pointer-events-auto p-8 md:p-12 space-y-10 text-right">
                 <div className="flex items-center justify-between">
                       <button onClick={() => setIsEditing(false)} className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-400">
                       <IconWrapper className="fa-solid fa-xmark" fa="fa-xmark" />
                    </button>
                    <h3 className="text-2xl font-black text-brand-primary dark:text-white">ویرایش پروفایل</h3>
                 </div>

                 <div className="space-y-6">
                    {/* Avatar Selection */}
                    <div className="space-y-4">
                       <p className="text-xs font-black text-gray-400 uppercase tracking-widest">انتخاب تصویر پروفایل</p>
                       <div className="flex flex-wrap justify-end gap-4">
                          {AVATAR_PRESETS.map((url, i) => (
                            <button 
                              key={i} 
                              onClick={() => setEditAvatar(url)}
                              className={`w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all ${editAvatar === url ? 'border-brand-accent scale-110 shadow-glow' : 'border-transparent opacity-60 hover:opacity-100'}`}
                            >
                               <img src={url} className="w-full h-full object-cover" alt="" />
                            </button>
                          ))}
                       </div>
                    </div>

                    {/* Name Input */}
                    <div className="space-y-2">
                       <label className="text-xs font-black text-gray-400 uppercase pr-1">نام و نام خانوادگی</label>
                       <input 
                         type="text" 
                         value={editName}
                         onChange={(e) => setEditName(e.target.value)}
                         className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-accent transition-all dark:text-white text-right"
                       />
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1 rounded-2xl">انصراف</Button>
                    <Button onClick={handleSave} variant="accent" className="flex-1 rounded-2xl shadow-glow">ذخیره تغییرات</Button>
                 </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileView;
