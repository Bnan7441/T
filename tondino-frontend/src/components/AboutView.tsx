
import React from 'react';
import IconWrapper from './IconWrapper';
import { motion } from 'framer-motion';

const AboutView: React.FC = () => {
  const roadmap = [
    { year: '۱۴۰۱', title: 'تولد تندینو', desc: 'شروع کار با ۳ نفر از متخصصین تندخوانی دانشگاه تهران.' },
    { year: '۱۴۰۲', title: 'ورود هوش مصنوعی', desc: 'اولین پلتفرم آموزشی در ایران با دستیار هوشمند اختصاصی.' },
    { year: '۱۴۰۳', title: 'باشگاه نخبگان', desc: 'راه اندازی سیستم Gamification و پاداش‌های آموزشی.' },
    { year: '۱۴۰۴', title: 'آینده تندینو', desc: 'توسعه به بازارهای بین‌المللی و آموزش به زبان‌های زنده دنیا.' },
  ];

  return (
    <div className="py-12 space-y-24">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8 max-w-4xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 dark:bg-white/10 text-brand-primary dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-brand-primary/10">
          <IconWrapper className="fa-solid fa-rocket" fa="fa-rocket" />
          درباره تندینو
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-brand-primary dark:text-white leading-tight">
          ما زمان را برای <br/><span className="text-brand-accent">آموزش</span> بازتعریف می‌کنیم
        </h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
          تندینو صرفاً یک اپلیکیشن نیست؛ یک فلسفه جدید برای یادگیری در عصر سرعت است. ما به شما یاد می‌دهیم که چگونه از تمام پتانسیل مغز خود استفاده کنید.
        </p>
      </motion.section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { label: 'دانش‌آموز فعال', val: '+۴۵,۰۰۰', icon: 'fa-users' },
          { label: 'دوره آموزشی', val: '+۱۲۰', icon: 'fa-book' },
          { label: 'رضایت کاربران', val: '۹۸٪', icon: 'fa-heart' },
          { label: 'صرفه‌جویی در زمان', val: '۳ برابر', icon: 'fa-clock' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-8 rounded-[2.5rem] text-center space-y-3 shadow-premium">
             <div className="w-12 h-12 bg-brand-primary/5 rounded-2xl flex items-center justify-center text-brand-primary dark:text-brand-accent mx-auto text-xl">
             <IconWrapper className={`fa-solid ${stat.icon}`} fa={stat.icon} />
           </div>
             <p className="text-3xl font-black text-brand-primary dark:text-white ltr-num">{stat.val}</p>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Roadmap Section */}
      <section className="space-y-12">
        <div className="text-right">
          <h2 className="text-4xl font-black text-brand-primary dark:text-white">مسیر رشد ما</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-xs">Our Roadmap</p>
        </div>

        <div className="relative">
           {/* Line */}
           <div className="absolute top-0 right-1/2 bottom-0 w-0.5 bg-gray-100 dark:bg-slate-800 hidden md:block"></div>
           
           <div className="space-y-12 relative z-10">
              {roadmap.map((item, idx) => (
                <div key={idx} className={`flex items-center justify-between gap-8 md:gap-0 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                   <div className="w-full md:w-[45%] text-right glass-card p-8 rounded-[2.5rem] shadow-premium hover:border-brand-accent transition-all">
                      <span className="text-4xl font-black text-brand-accent/20 block mb-2 ltr-num">{item.year}</span>
                      <h3 className="text-xl font-black text-brand-primary dark:text-white mb-2">{item.title}</h3>
                      <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{item.desc}</p>
                   </div>
                   <div className="hidden md:flex w-12 h-12 rounded-full bg-white dark:bg-slate-900 border-4 border-brand-accent items-center justify-center z-20 shadow-xl">
                      <div className="w-3 h-3 bg-brand-accent rounded-full animate-pulse"></div>
                   </div>
                   <div className="hidden md:block w-[45%]"></div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-slate-900 rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(57,124,124,0.15),transparent)] animate-pulse"></div>
        <div className="relative z-10 space-y-8">
           <h2 className="text-4xl md:text-6xl font-black max-w-3xl mx-auto leading-tight">تغییر از امروز شروع می‌شود</h2>
           <p className="text-white/60 text-lg font-medium max-w-xl mx-auto">به هزاران دانش‌آموزی بپیوندید که با تندینو یادگیری را لذت‌بخش‌تر و سریع‌تر کرده‌اند.</p>
           <div className="flex flex-wrap justify-center gap-4 pt-4">
              <button className="bg-brand-accent text-white px-10 py-5 rounded-2xl font-black shadow-glow hover:scale-105 transition-all">
                 مشاهده دوره‌ها
              </button>
           </div>
        </div>
      </section>
    </div>
  );
};

export default AboutView;
