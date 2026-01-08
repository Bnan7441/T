
import React from 'react';
import { MOCK_ARTICLES } from '@/data';
import { useAuth } from '@/context/AuthContext';
import { Button } from './ui/Button';
import { motion } from 'framer-motion';
import Icon from './Icon';

const AydinIdeasSpecial: React.FC = () => {
  const { isAuthenticated, login, userProfile } = useAuth();

  return (
    <section className="space-y-12">
      {/* Magazine Horizontal Scroll */}
      <div className="space-y-6">
        <div className="flex items-end justify-between px-2">
          <div className="space-y-1 text-right">
            <h2 className="section-title border-r-4">مجله هوشمند تندینو</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pr-4">Smart Learning Insights</p>
          </div>
          <button className="text-brand-accent dark:text-teal-400 font-label text-[10px] hover:underline underline-offset-4">آرشیو مطالب</button>
        </div>
        
        <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-6 pb-4 px-2" dir="rtl">
          {MOCK_ARTICLES.map(article => (
            <motion.div 
              key={article.id} 
              whileHover={{ y: -5 }}
              className="snap-start shrink-0 w-[80vw] md:w-[450px] group cursor-pointer space-y-4"
            >
              <div className="aspect-[16/9] rounded-[2.5rem] overflow-hidden shadow-premium border border-white dark:border-white/5 relative">
                <img src={article.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={article.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/80 via-transparent to-transparent opacity-60"></div>
                <div className="absolute bottom-6 right-6 left-6 text-right">
                   <div className="flex items-center gap-2 mb-2">
                      <span className="bg-brand-accent text-white px-2 py-0.5 rounded-md text-[9px] font-black uppercase">Article</span>
                      <span className="text-white/60 text-[10px] font-bold ltr-num">{article.date}</span>
                   </div>
                   <h3 className="text-lg font-heading text-white line-clamp-1">{article.title}</h3>
                </div>
              </div>
            </motion.div>
          ))}
          <div className="w-4 shrink-0" />
        </div>
      </div>

      {/* Club Horizontal Bento Widgets */}
      <div className="space-y-6">
        <div className="flex items-end justify-between px-2">
          <div className="space-y-1 text-right">
            <h2 className="section-title border-r-4">باشگاه و چالش‌ها</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pr-4">Gamified Rewards</p>
          </div>
        </div>

        <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-5 pb-6 px-2" dir="rtl">
          {/* Main Status Widget */}
          <div className="snap-start shrink-0 w-[85vw] md:w-[400px]">
            <div className={`rounded-[2.5rem] p-6 text-white relative overflow-hidden h-48 flex flex-col justify-between shadow-premium transition-all ${isAuthenticated ? 'bg-brand-primary dark:bg-slate-900' : 'bg-gray-900'}`}>
              <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-brand-accent/20 blur-[40px] rounded-full"></div>
               <div className="relative z-10 flex justify-between items-start">
                <div className="text-right">
                   <h3 className="text-lg font-heading">وضعیت شما</h3>
                   <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{isAuthenticated ? 'Active Member' : 'Guest Mode'}</p>
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-brand-accent">
                 <Icon fa="fa-trophy" className="text-xl" />
                </div>
              </div>

              {isAuthenticated ? (
                <div className="relative z-10 flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5">
                  <img src={userProfile.avatar} className="w-12 h-12 rounded-xl border border-brand-accent shadow-lg object-cover" alt="" />
                  <div className="text-right flex-grow">
                    <p className="text-sm font-heading">{userProfile.name}</p>
                    <div className="w-full h-1.5 bg-white/10 rounded-full mt-1.5 overflow-hidden">
                       <div className="h-full bg-brand-accent w-[74%]"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <Button onClick={() => login()} variant="accent" size="sm" className="relative z-10 w-full rounded-xl py-3">ورود به باشگاه</Button>
              )}
            </div>
          </div>

          {/* Activity Mini-Widgets */}
          {[
            { title: 'چالش روزانه', value: '۳۰ امتیاز', icon: 'fa-bolt', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
            { title: 'نشان‌های جدید', value: '۴ نشان', icon: 'fa-medal', color: 'text-brand-accent', bg: 'bg-brand-accent/10' },
            { title: 'روزهای متوالی', value: '۱۲ روز', icon: 'fa-fire', color: 'text-orange-500', bg: 'bg-orange-500/10' }
          ].map((item, idx) => (
            <div key={idx} className="snap-start shrink-0 w-40 h-48 glass-card p-6 rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-4 shadow-premium border-white/40">
              <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center text-2xl`}>
                <Icon fa={item.icon} className="text-2xl" />
              </div>
               <div className="space-y-1">
                 <p className="text-[10px] font-bold text-gray-400 uppercase">{item.title}</p>
                 <p className="text-lg font-data text-brand-primary dark:text-white ltr-num">{item.value}</p>
               </div>
            </div>
          ))}
          <div className="w-4 shrink-0" />
        </div>
      </div>
    </section>
  );
};

export default AydinIdeasSpecial;
