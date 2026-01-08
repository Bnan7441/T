
import React from 'react';
import Icon from './Icon';

const AppDownload: React.FC = () => {
  return (
    <div className="bg-brand-primary rounded-[2.5rem] overflow-hidden relative shadow-2xl shadow-brand-primary/20">
      <div className="absolute inset-0 bg-gradient-to-r from-brand-accent/10 to-transparent"></div>
      
      <div className="max-w-5xl mx-auto px-6 py-8 md:py-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-right relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-6">
           <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
           <Icon fa="fa-mobile-screen" className="text-white text-3xl" />
         </div>
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-black text-white">یادگیری در هر زمان، هر مکان</h2>
            <p className="text-brand-surface/60 text-sm font-medium">اپلیکیشن تندینو را برای تجربه یادگیری آفلاین دانلود کنید.</p>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3">
            <button className="flex items-center gap-3 bg-white text-brand-primary px-5 py-2.5 rounded-xl font-black hover:bg-brand-surface transition-all active:scale-95">
            <Icon fa="fa-apple" className="text-2xl" />
            <div className="text-right leading-tight">
              <div className="text-[9px] uppercase opacity-60">دریافت از</div>
              <div className="text-xs">App Store</div>
            </div>
          </button>
          <button className="flex items-center gap-3 bg-white text-brand-primary px-5 py-2.5 rounded-xl font-black hover:bg-brand-surface transition-all active:scale-95">
            <Icon fa="fa-google-play" className="text-2xl" />
            <div className="text-right leading-tight">
              <div className="text-[9px] uppercase opacity-60">دریافت از</div>
              <div className="text-xs">Google Play</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppDownload;
