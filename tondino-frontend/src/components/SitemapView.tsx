
import React from 'react';
import { useNavigate } from 'react-router-dom';
import IconWrapper from '@/components/IconWrapper';
import { motion } from 'framer-motion';
import { useUI } from '@/context/UIContext';

const SitemapView: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveCategory, setActiveAgeGroup } = useUI();

  const handleNav = (page: string, category?: string, age?: any) => {
    if (category) setActiveCategory(category);
    if (age) setActiveAgeGroup(age);
    navigate('/' + page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sitemapData = [
    {
      title: 'صفحات اصلی پلتفرم',
      icon: 'fa-house-chimney',
      color: 'text-brand-primary',
        links: [
        { name: 'خانه و ویترین', id: 'home' },
        { name: 'کاتالوگ تمام دوره‌ها', id: 'courses' },
        { name: 'باشگاه نخبگان تندینو', id: 'club' },
        { name: 'مجله و بلاگ آموزشی', id: 'blog' },
        { name: 'درباره ما و اهداف تندینو', id: 'about' },
      ]
    },
    {
      title: 'بخش کاربری و یادگیری',
      icon: 'fa-user-gear',
      color: 'text-brand-accent',
        links: [
        { name: 'داشبورد من', id: 'dashboard' },
        { name: 'ویرایش حساب کاربری', id: 'profile' },
        { name: 'نشان‌های افتخار من', id: 'dashboard' },
        { name: 'امتیازات و فعالیت‌ها', id: 'club' },
      ]
    },
    {
      title: 'دسته‌بندی‌های آموزشی',
      icon: 'fa-layer-group',
      color: 'text-orange-500',
        links: [
        { name: 'تندخوانی و تمرکز', id: 'courses', category: 'تندخوانی' },
        { name: 'تقویت حافظه', id: 'courses', category: 'تقویت حافظه' },
        { name: 'هوش مصنوعی دانش‌آموزی', id: 'courses', category: 'هوش مصنوعی' },
        { name: 'مشاوره و مهارت', id: 'courses', category: 'مشاوره' },
        { name: 'آموزش زبان‌های خارجی', id: 'courses', category: 'زبان' },
      ]
    },
    {
      title: 'مقاطع تحصیلی',
      icon: 'fa-graduation-cap',
      color: 'text-indigo-500',
        links: [
        { name: 'دوره های کودکان', id: 'courses', age: 'kid' },
        { name: 'دوره های نوجوانان', id: 'courses', age: 'teen' },
        { name: 'دوره های بزرگسالان', id: 'courses', age: 'adult' },
        { name: 'بخش ویژه کنکور', id: 'courses', category: 'کنکور' },
      ]
    }
  ];

  return (
    <div className="py-12 space-y-16 animate-in fade-in duration-700">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/5 dark:bg-white/5 border border-brand-primary/10 text-brand-primary dark:text-brand-accent text-[10px] font-black uppercase tracking-widest">
          راهنمای ناوبری
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-brand-primary dark:text-white leading-tight">
          نقشه <span className="text-brand-accent">جامع</span> سایت
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
          دسترسی سریع به تمام بخش‌های آموزشی، مقالات و امکانات پنل کاربری تندینو در یک نگاه.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {sitemapData.map((section, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-8 rounded-[3rem] border-white/40 shadow-premium flex flex-col space-y-6"
          >
            <div className="flex items-center gap-4 border-b border-gray-100 dark:border-white/5 pb-4">
              <div className={`w-12 h-12 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-xl ${section.color}`}>
                <IconWrapper fa={section.icon} className={`fa-solid ${section.icon}`} />
              </div>
              <h3 className="font-black text-brand-primary dark:text-white text-base">{section.title}</h3>
            </div>
            
            <ul className="space-y-3">
              {section.links.map((link, lIdx) => (
                <li key={lIdx}>
                  <button 
                    onClick={() => handleNav(link.id, (link as any).category, (link as any).age)}
                    className="flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-brand-accent transition-colors group w-full text-right"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-slate-700 group-hover:bg-brand-accent transition-colors"></span>
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <div className="bg-brand-primary rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/20 blur-[100px] rounded-full"></div>
         <div className="relative z-10 space-y-6">
            <h2 className="text-2xl font-black">سوالی دارید که پاسخش اینجا نیست؟</h2>
            <p className="text-white/60 text-sm font-medium max-w-xl mx-auto">تیم پشتیبانی تندینو در تمام روزهای هفته آماده راهنمایی و مشاوره آموزشی به شماست.</p>
            <div className="flex flex-wrap justify-center gap-4">
               <button className="bg-white text-brand-primary px-8 py-3 rounded-2xl font-black text-xs hover:scale-105 transition-transform">تماس با پشتیبانی</button>
               <button className="bg-brand-accent text-white px-8 py-3 rounded-2xl font-black text-xs hover:scale-105 transition-transform">سوالات متداول</button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default SitemapView;
