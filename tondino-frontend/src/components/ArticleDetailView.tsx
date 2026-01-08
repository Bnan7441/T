
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelection } from '@/context/SelectionContext';
import { MOCK_ARTICLES } from '@/data';
import { Button } from './ui/Button';
import Icon from './Icon';
import IconWrapper from '@/components/IconWrapper';

const ArticleDetailView: React.FC = () => {
   const navigate = useNavigate();
   const { selectedArticle, setSelectedArticle } = useSelection();

  useEffect(() => {
    if (!selectedArticle) {
      navigate('/blog');
    }
  }, [selectedArticle, navigate]);

  if (!selectedArticle) {
    return null;
  }

  // Related articles logic
  const related = MOCK_ARTICLES.filter(a => a.id !== selectedArticle.id).slice(0, 2);

  return (
    <div className="pb-20 animate-in fade-in duration-700">
      
      {/* Article Header & Navigation */}
      <div className="flex items-center justify-between mb-10">
         <button 
            onClick={() => navigate('/blog')}
            className="flex items-center gap-2 text-brand-primary dark:text-gray-400 font-black hover:translate-x-1 transition-transform"
         >
            <IconWrapper fa="fa-arrow-right" className="text-base" />
            بازگشت به مجله
         </button>
         <div className="flex gap-4">
            <button className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 text-gray-400 flex items-center justify-center hover:text-brand-accent transition-colors">
               <IconWrapper fa="fa-share-nodes" className="text-base" />
            </button>
            <button className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 text-gray-400 flex items-center justify-center hover:text-brand-accent transition-colors">
               <IconWrapper fa="fa-bookmark" className="text-base" />
            </button>
         </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Title and Metadata */}
        <header className="space-y-6 text-center">
           <div className="flex items-center justify-center gap-4 text-[11px] font-black uppercase tracking-widest text-brand-accent bg-brand-accent/5 py-2 px-6 rounded-full w-fit mx-auto">
              <span>{selectedArticle.category}</span>
              <span className="w-1 h-1 rounded-full bg-brand-accent"></span>
              <span>زمان مطالعه: {selectedArticle.readTime}</span>
              <span className="w-1 h-1 rounded-full bg-brand-accent"></span>
              <span>{selectedArticle.date}</span>
           </div>
           <h1 className="text-4xl md:text-6xl font-black text-brand-primary dark:text-white leading-[1.2]">
              {selectedArticle.title}
           </h1>
        </header>

        {/* Hero Image */}
        <div className="aspect-[21/9] rounded-[3rem] overflow-hidden shadow-premium">
           <img src={selectedArticle.image} className="w-full h-full object-cover" alt={selectedArticle.title} />
        </div>

        {/* Article Summary Box */}
        <div className="bg-brand-primary/5 dark:bg-white/5 border border-brand-primary/10 dark:border-white/5 rounded-[2.5rem] p-8 md:p-12 text-right relative overflow-hidden">
           <IconWrapper fa="fa-lightbulb" className="absolute top-8 left-10 text-brand-accent/10 text-6xl" />
           <h3 className="text-xl font-black text-brand-primary dark:text-white mb-4">آنچه در این مقاله می‌آموزید:</h3>
           <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
              در این یادداشت، به بررسی علمی و عملی تکنیک پومودورو می‌پردازیم. یاد می‌گیرید چگونه با فواصل زمانی ۲۵ دقیقه‌ای، از فرسودگی ذهنی جلوگیری کرده و تمرکز خود را به حداکثر برسانید.
           </p>
        </div>

        {/* Content Section - Optimized for Reading */}
        <article className="prose prose-lg dark:prose-invert max-w-none text-right font-medium text-gray-700 dark:text-gray-300 space-y-8 leading-[2.2]">
           <h2 className="text-2xl font-black text-brand-primary dark:text-white border-r-4 border-brand-accent pr-4">تکنیک پومودورو چیست؟</h2>
           <p>
              تکنیک پومودورو در اواخر دهه ۱۹۸۰ توسط فرانچسکو سیریلو ابداع شد. واژه پومودورو در ایتالیایی به معنای گوجه‌فرنگی است و دلیل این نام‌گذاری، استفاده سیریلو از یک تایمر آشپزخانه به شکل گوجه‌فرنگی بود. ایده اصلی ساده است: مغز انسان برای تمرکز طولانی‌مدت ساخته نشده است، اما می‌تواند در فواصل کوتاه، عملکردی فوق‌العاده داشته باشد.
           </p>

           <h3 className="text-xl font-black text-brand-primary dark:text-white">مراحل اجرای پومودورو در مطالعه:</h3>
           <ul className="list-disc pr-6 space-y-3">
              <li>یک وظیفه مشخص (مثلاً مطالعه فصل سوم فیزیک) انتخاب کنید.</li>
              <li>تایمر را برای ۲۵ دقیقه تنظیم کنید (یک پومودورو).</li>
              <li>تا زمان زنگ خوردن تایمر، فقط و فقط روی همان کار تمرکز کنید.</li>
              <li>پس از ۲۵ دقیقه، ۵ دقیقه استراحت مطلق داشته باشید (بدون گوشی!).</li>
              <li>بعد از انجام ۴ پومودورو، یک استراحت طولانی‌تر (۱۵ تا ۳۰ دقیقه) به خود بدهید.</li>
           </ul>

           <div className="bg-gray-50 dark:bg-slate-800 p-8 rounded-[2rem] border-r-4 border-brand-primary italic">
              "تمرکز واقعی به معنای بله گفتن به یک چیز نیست، بلکه به معنای نه گفتن به هزاران چیز دیگر است که در آن لحظه حواستان را پرت می‌کنند."
           </div>

           <h3 className="text-xl font-black text-brand-primary dark:text-white">چرا پومودورو معجزه می‌کند؟</h3>
           <p>
              تحقیقات نشان می‌دهد که دانستن اینکه زمان محدودی دارید، باعث می‌شود کمتر وسوسه شوید تا کار را به تعویق بیندازید. همچنین استراحت‌های کوتاه به مغز اجازه می‌دهد تا اطلاعات دریافتی را در حافظه کوتاه‌مدت طبقه‌بندی کرده و برای دریافت اطلاعات جدید آماده شود.
           </p>
        </article>

        {/* Footer Actions */}
        <div className="pt-12 border-t border-gray-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-6">
           <div className="flex gap-2">
              <span className="bg-gray-100 dark:bg-slate-800 px-4 py-1.5 rounded-xl text-[10px] font-black text-gray-400">#تندخوانی</span>
              <span className="bg-gray-100 dark:bg-slate-800 px-4 py-1.5 rounded-xl text-[10px] font-black text-gray-400">#تمرکز</span>
              <span className="bg-gray-100 dark:bg-slate-800 px-4 py-1.5 rounded-xl text-[10px] font-black text-gray-400">#موفقیت</span>
           </div>
           <Button variant="accent" className="rounded-2xl px-12 py-4 shadow-glow">ارسال دیدگاه</Button>
        </div>

        {/* Related Articles Section */}
        <section className="pt-20 space-y-8">
           <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-brand-primary dark:text-white">مطالب مرتبط پیشنهادی</h2>
              <button onClick={() => navigate('/blog')} className="text-xs font-black text-brand-accent hover:underline">مشاهده همه مقالات</button>
           </div>
           <div className="grid md:grid-cols-2 gap-8">
              {related.map(article => (
                <div 
                  key={article.id} 
                  onClick={() => {
                    setSelectedArticle(article);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="glass-card p-4 rounded-[2.5rem] flex items-center gap-5 border-white/30 cursor-pointer group hover:shadow-xl transition-all"
                >
                   <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden shrink-0">
                      <img src={article.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" loading="lazy" />
                   </div>
                   <div className="text-right space-y-1">
                      <span className="text-[9px] font-black text-brand-accent uppercase">{article.category}</span>
                      <h4 className="font-black text-brand-primary dark:text-white group-hover:text-brand-accent transition-colors line-clamp-2">{article.title}</h4>
                      <p className="text-[10px] text-gray-400 font-bold">{article.date}</p>
                   </div>
                </div>
              ))}
           </div>
        </section>

      </div>
    </div>
  );
};

export default ArticleDetailView;
