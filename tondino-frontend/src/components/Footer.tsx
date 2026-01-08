
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Icon from '@/components/Icon';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const handleScroll = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={`bg-brand-primary text-white pt-12 sm:pt-16 md:pt-20 pb-8 sm:pb-10 ${className}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 text-right">
        {/* Top Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 md:gap-16 mb-12 md:mb-20">
          
          <div className="space-y-6 sm:space-y-8">
            <div className="flex items-center gap-2 sm:gap-3 justify-end">
              <span className="text-2xl sm:text-3xl font-black tracking-tight">تندینو</span>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-lg sm:rounded-2xl flex items-center justify-center border border-white/20">
                <span className="text-white font-black text-xl sm:text-2xl italic">T</span>
              </div>
            </div>
            <p className="text-brand-surface/60 text-xs sm:text-sm leading-relaxed max-w-xs font-medium mr-auto ml-0 md:mr-0 md:ml-auto">
              {t('footer.description')}
            </p>
            <div className="flex gap-3 sm:gap-4 justify-end">
              {[
                { icon: 'fa-instagram', href: '#' },
                { icon: 'fa-linkedin-in', href: '#' },
                { icon: 'fa-telegram', href: '#' },
                { icon: 'fa-x-twitter', href: '#' }
              ].map((social, i) => (
                <a key={i} href={social.href} className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/5 flex items-center justify-center hover:bg-brand-accent transition-all hover:-translate-y-1">
                  <Icon fa={social.icon} className="text-sm sm:text-lg" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-black text-lg mb-8 border-r-4 border-brand-accent pr-4 leading-none">{t('footer.quickLinks')}</h4>
            <ul className="space-y-4 text-brand-surface/50 text-sm font-bold">
              <li><Link to="/courses" onClick={handleScroll} className="hover:text-brand-accent transition-colors flex items-center gap-2 justify-end w-full"><span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>{t('common.courses')}</Link></li>
              <li><Link to="/club" onClick={handleScroll} className="hover:text-brand-accent transition-colors flex items-center gap-2 justify-end w-full"><span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>{t('common.club')}</Link></li>
              <li><Link to="/blog" onClick={handleScroll} className="hover:text-brand-accent transition-colors flex items-center gap-2 justify-end w-full"><span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>{t('common.blog')}</Link></li>
              <li><Link to="/sitemap" onClick={handleScroll} className="hover:text-brand-accent transition-colors flex items-center gap-2 justify-end w-full"><span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>{t('common.sitemap', 'نقشه کامل سایت')}</Link></li>
              <li><Link to="/about" onClick={handleScroll} className="hover:text-brand-accent transition-colors flex items-center gap-2 justify-end w-full"><span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>{t('common.about')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-lg mb-8 border-r-4 border-brand-accent pr-4 leading-none">{t('footer.organization')}</h4>
            <ul className="space-y-4 text-brand-surface/50 text-sm font-bold">
              <li><button className="hover:text-brand-accent transition-colors text-right w-full">همکاری با مدارس</button></li>
              <li><button className="hover:text-brand-accent transition-colors text-right w-full">جذب مدرس</button></li>
              <li><button className="hover:text-brand-accent transition-colors text-right w-full">پنل نمایندگی</button></li>
              <li><button className="hover:text-brand-accent transition-colors text-right w-full">فرصت‌های شغلی</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-lg mb-8 border-r-4 border-brand-accent pr-4 leading-none">تاییده‌های رسمی</h4>
            <div className="grid grid-cols-2 gap-4">
               {/* 
               <div className="aspect-square bg-white rounded-[1.5rem] flex items-center justify-center p-5 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 cursor-pointer transition-all border border-white/5">
                  <img src="https://trustseal.enamad.ir/logo.aspx?id=123456&p=ABCDEF" alt="Enamad" className="max-w-full" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
               </div>
               <div className="aspect-square bg-white rounded-[1.5rem] flex items-center justify-center p-5 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 cursor-pointer transition-all border border-white/5">
                  <img src="https://logo.samandehi.ir/logo.aspx?id=123456&p=ABCDEF" alt="Samandehi" className="max-w-full" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
               </div>
               */}
               <div className="col-span-2 text-center text-xs text-brand-surface/30 border border-brand-surface/10 rounded-xl p-4">
                 نمادهای اعتماد (در حال دریافت)
               </div>
            </div>
          </div>

        </div>

        {/* Partnership Logos Section */}
        <div className="pt-10 border-t border-white/5 mb-10">
          <p className="text-[10px] text-center text-brand-surface/30 font-black uppercase tracking-[0.3em] mb-8">همکاران و حامیان معتبر ما</p>
           <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-30">
             <Icon fa="fa-university" className="text-4xl hover:opacity-100 transition-opacity" />
             <Icon fa="fa-school" className="text-4xl hover:opacity-100 transition-opacity" />
             <Icon fa="fa-graduation-cap" className="text-4xl hover:opacity-100 transition-opacity" />
             <Icon fa="fa-building-columns" className="text-4xl hover:opacity-100 transition-opacity" />
           </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-brand-surface/40 font-black uppercase tracking-widest">
          <p dir="ltr">© 2024 TONDINO - ALL RIGHTS RESERVED.</p>
          <p>© ۱۴۰۳ تندینو - پلتفرم هوشمند آموزش و تندخوانی ایران. تمامی حقوق محفوظ است.</p>
          <div className="flex gap-6">
             <button className="hover:text-brand-accent transition-colors">حریم خصوصی</button>
             <button className="hover:text-brand-accent transition-colors">قوانین و مقررات</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
