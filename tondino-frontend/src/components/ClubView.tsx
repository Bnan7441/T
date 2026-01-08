
import React from 'react';
import IconWrapper from '@/components/IconWrapper';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useStats } from '@/context/StatsContext';
import { useUI } from '@/context/UIContext';
import { Button } from './ui/Button';

const ClubView: React.FC = () => {
   const { isAuthenticated, userProfile } = useAuth();
   const { userStats } = useStats();
   const { setIsAuthModalOpen } = useUI();

  if (!isAuthenticated) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center space-y-10 animate-in fade-in zoom-in duration-700">
        <div className="relative">
              <div className="w-40 h-40 bg-brand-primary/10 rounded-full flex items-center justify-center text-6xl text-brand-primary animate-pulse">
              <IconWrapper className="fa-solid fa-crown" fa="fa-crown" />
           </div>
           <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center text-white shadow-lg rotate-12">
              <IconWrapper className="fa-solid fa-star" fa="fa-star" />
           </div>
        </div>
        <div className="space-y-4 max-w-lg">
          <h1 className="text-4xl font-black text-brand-primary dark:text-white">باشگاه نخبگان تندینو</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg leading-relaxed">
            برای شرکت در چالش‌های روزانه، کسب امتیاز و دریافت جوایز نقدی، باید به حساب خود وارد شوید. همین حالا شروع کنید!
          </p>
        </div>
        <Button 
          variant="accent" 
          size="lg" 
          onClick={() => setIsAuthModalOpen(true)}
          className="rounded-2xl px-12 py-5 shadow-glow"
        >
          ورود به باشگاه و دریافت هدیه
        </Button>
      </div>
    );
  }

  return (
    <div className="py-12 space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row items-center justify-between gap-8 bg-brand-primary dark:bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/20 blur-[100px] rounded-full"></div>
        <div className="relative z-10 flex items-center gap-6 text-right">
           <img src={userProfile.avatar} className="w-24 h-24 rounded-3xl border-4 border-brand-accent/30 shadow-2xl object-cover" alt="" />
           <div className="space-y-2">
              <h2 className="text-3xl font-black">{userProfile.name} <span className="text-xs bg-brand-accent px-2 py-0.5 rounded-lg mr-2">VIP MEMBER</span></h2>
              <p className="text-white/60 font-medium">سطح {userStats.level} - قهرمان تندخوانی تندینو</p>
           </div>
        </div>
        <div className="relative z-10 flex gap-8">
           <div className="text-center space-y-1">
              <p className="text-4xl font-black ltr-num">{userStats.points.toLocaleString('fa-IR')}</p>
              <p className="text-[10px] font-black uppercase text-brand-accent">Tondino Points</p>
           </div>
           <div className="text-center space-y-1">
              <p className="text-4xl font-black ltr-num">{userStats.streak}</p>
              <p className="text-[10px] font-black uppercase text-orange-400">Day Streak</p>
           </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Daily Challenges */}
        <div className="lg:col-span-8 space-y-6">
           <h3 className="section-title">چالش‌های امروز</h3>
           <div className="grid gap-4">
              {[
                { title: '۵۰۰ کلمه در یک دقیقه', prize: '+۱۰۰ امتیاز', progress: 0, icon: 'fa-bolt', color: 'bg-yellow-400' },
                { title: 'درک مطلب درس اول ریاضی', prize: '+۲۵۰ امتیاز', progress: 100, icon: 'fa-brain', color: 'bg-brand-accent' },
                { title: 'دعوت از یک دوست', prize: '+۵۰۰ امتیاز', progress: 40, icon: 'fa-users', color: 'bg-indigo-500' }
              ].map((challenge, idx) => (
                <div key={idx} className="glass-card p-6 rounded-[2rem] border-white/30 flex items-center justify-between group">
                   <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 ${challenge.color} text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                         <IconWrapper fa={challenge.icon} className={`fa-solid ${challenge.icon}`} />
                      </div>
                      <div className="text-right space-y-1">
                         <h4 className="font-black text-brand-primary dark:text-white">{challenge.title}</h4>
                         <div className="w-48 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-accent" style={{ width: `${challenge.progress}%` }}></div>
                         </div>
                      </div>
                   </div>
                   <div className="text-left">
                      <p className="text-sm font-black text-brand-accent">{challenge.prize}</p>
                      <button className="text-[10px] font-black text-gray-400 hover:text-brand-primary transition-colors mt-1">جزئیات چالش</button>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Badges/Inventory */}
        <div className="lg:col-span-4 space-y-6">
           <h3 className="section-title">نشان‌های من</h3>
           <div className="glass-card p-8 rounded-[2.5rem] border-white/30 grid grid-cols-2 gap-6">
              {userStats.badges.map((badge, idx) => (
                <div key={idx} className="flex flex-col items-center text-center gap-3 group">
                      <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-3xl text-gray-300 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-all cursor-help relative">
                      <IconWrapper className="fa-solid fa-medal" fa="fa-medal" />
                      <div className="absolute inset-0 bg-brand-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   </div>
                   <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase">{badge}</span>
                </div>
              ))}
              <div className="flex flex-col items-center text-center gap-3 opacity-30">
                    <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center text-2xl text-gray-300">
                    <IconWrapper className="fa-solid fa-lock" fa="fa-lock" />
                 </div>
                 <span className="text-[10px] font-black text-gray-400">قفل شده</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ClubView;
