
import React from 'react';
import Icon from './Icon';

const TrustSection: React.FC = () => {
  return (
    <section className="space-y-24">
      {/* B2B_Services: Tondino for Schools */}
      <div className="bg-brand-primary dark:bg-slate-800 rounded-[2.5rem] p-10 md:p-12 text-right text-white relative overflow-hidden shadow-2xl shadow-brand-primary/20 transition-colors duration-300">
        <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-white/10 blur-3xl rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="grid grid-cols-12 h-full border-l border-white/20">
            {Array(12).fill(0).map((_, i) => <div key={i} className="border-r border-white/20 h-full"></div>)}
          </div>
        </div>
        
        <div className="relative z-10 max-w-4xl mr-0 space-y-8">
          <div className="space-y-3">
            <span className="bg-white/20 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">خدمات سازمانی و مدارس</span>
            <h2 className="text-2xl md:text-4xl font-black">تندینو در خدمت آموزش رسمی</h2>
            <p className="text-brand-surface/80 text-base md:text-lg font-medium leading-relaxed max-w-2xl">
              پنل مدیریت اختصاصی برای مدارس و سازمان‌ها. با استفاده از داشبوردهای پیشرفته هوش مصنوعی، عملکرد تحصیلی دانش‌آموزان خود را پایش و تقویت کنید.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <button className="bg-white text-brand-primary px-8 py-3 md:py-4 rounded-2xl font-black shadow-xl active:scale-95 transition-all text-sm">
              درخواست دمو و همکاری
            </button>
            <button className="bg-brand-primaryDark/50 backdrop-blur-md text-white border border-white/20 px-8 py-3 md:py-4 rounded-2xl font-black active:scale-95 transition-all text-sm">
              مشاهده لیست شرکای آموزشی
            </button>
          </div>
        </div>
      </div>

      {/* WhyTondino_List & UserTestimonials */}
      <div className="grid lg:grid-cols-12 gap-16 items-start">
        <div className="lg:col-span-5 space-y-10 text-right">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-black text-brand-primary dark:text-white leading-tight">چرا خانواده‌ها به <br/><span className="text-brand-accent dark:text-teal-400">تندینو</span> اعتماد دارند؟</h2>
            <p className="text-gray-400 font-medium">ما فراتر از یک اپلیکیشن، یک همراه هوشمند برای مسیر رشد فرزندان شما هستیم.</p>
          </div>
          
          <ul className="space-y-6">
            {[
              { title: "یادگیری تطبیقی", desc: "هوش مصنوعی سطح آموزش را با توانایی دانش‌آموز هماهنگ می‌کند.", icon: "fa-brain" },
              { title: "اساتید تایید شده", desc: "تمامی مدرسین از برترین دانشگاه‌های کشور انتخاب شده‌اند.", icon: "fa-user-tie" },
              { title: "تکنیک‌های تندخوانی", desc: "افزایش ۳ برابری سرعت مطالعه و درک مطلب با متدهای اختصاصی.", icon: "fa-bolt" }
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-5 group">
                  <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 dark:bg-white/10 text-brand-primary dark:text-white flex items-center justify-center flex-shrink-0 group-hover:bg-brand-accent group-hover:text-white transition-all">
                  <Icon fa={item.icon} className="text-lg" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-brand-primary dark:text-white text-lg">{item.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-7 grid md:grid-cols-2 gap-8 text-right">
          <div className="p-8 md:p-10 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl border border-gray-50 dark:border-white/5 relative group hover:shadow-2xl transition-all">
             <Icon fa="fa-quote-right" className="absolute top-8 left-10 text-brand-accent/10 dark:text-white/5 text-6xl" />
             <p className="text-gray-600 dark:text-gray-300 font-medium leading-relaxed mb-8 relative z-10">"تندینو ترس دخترم از ریاضی را به کنجکاوی تبدیل کرد. مربی هوش مصنوعی دقیقاً مثل یک دوست واقعی است که حوصله زیادی دارد."</p>
             <div className="flex items-center gap-4 justify-end">
               <div className="text-left">
                 <p className="font-black text-brand-primary dark:text-white">خانم مریم ک.</p>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">والد دانش‌آموز پایه پنجم</p>
               </div>
               <img src="https://picsum.photos/60/60?u=mom1" className="w-14 h-14 rounded-2xl object-cover shadow-md" />
             </div>
          </div>
          <div className="p-8 md:p-10 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl border border-gray-50 dark:border-white/5 relative group hover:shadow-2xl transition-all translate-y-0 md:translate-y-12">
             <Icon fa="fa-quote-right" className="absolute top-8 left-10 text-brand-accent/10 dark:text-white/5 text-6xl" />
             <p className="text-gray-600 dark:text-gray-300 font-medium leading-relaxed mb-8 relative z-10">"قابلیت 'استاد شو' به من کمک کرد امتحانات نهایی را در نیمی از زمان معمول جمع‌بندی کنم. واقعاً نجات‌دهنده بود!"</p>
             <div className="flex items-center gap-4 justify-end">
               <div className="text-left">
                 <p className="font-black text-brand-primary dark:text-white">علی‌رضا م.</p>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">دانش‌آموز پایه دوازدهم</p>
               </div>
               <img src="https://picsum.photos/60/60?u=student1" className="w-14 h-14 rounded-2xl object-cover shadow-md" />
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
