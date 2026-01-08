
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MOCK_ARTICLES } from '@/data';
import { useSelection } from '@/context/SelectionContext';
import Icon from './Icon';
import IconWrapper from '@/components/IconWrapper';

const BlogView: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedArticle } = useSelection();

  const handleArticleClick = (article: any) => {
    setSelectedArticle(article);
    navigate('/article-detail/' + article.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="py-12 space-y-16 animate-in fade-in duration-700 pb-[env(safe-area-inset-bottom)]">
      <div className="text-center space-y-4 max-w-3xl mx-auto md:gap-4 md:h-16">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-brand-primary/5 dark:bg-white/5 border border-brand-primary/10 text-brand-primary dark:text-brand-accent text-[10px] font-black uppercase tracking-widest">
          مجله تندینو
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-brand-primary dark:text-white leading-tight">
          یادگیری <span className="text-brand-accent">هرگز</span> متوقف نمی‌شود
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium text-lg leading-relaxed">
          تازه‌ترین اخبار تکنولوژی آموزشی، مقالات تخصصی تندخوانی و راهکارهای موفقیت در تحصیل از نگاه برترین متخصصان ایران.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        {/* Featured Article */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => handleArticleClick(MOCK_ARTICLES[0])}
          className="md:col-span-12 group cursor-pointer relative rounded-[3rem] overflow-hidden shadow-premium border border-white dark:border-white/5 h-[500px]"
        >
          <img src={MOCK_ARTICLES[0].image} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-primary via-brand-primary/20 to-transparent"></div>
          <div className="absolute bottom-10 right-10 left-10 text-right space-y-4">
            <span className="bg-brand-accent text-white px-3 py-1 rounded-lg text-xs font-black">مقاله برگزیده</span>
            <h2 className="text-3xl md:text-5xl font-black text-white">{MOCK_ARTICLES[0].title}</h2>
            <p className="text-white/70 max-w-2xl text-lg font-medium">{MOCK_ARTICLES[0].excerpt}</p>
            <div className="flex items-center justify-end gap-6 text-white/50 text-xs font-bold uppercase tracking-widest">
            <span className="flex items-center gap-2"><IconWrapper fa="fa-clock" className="" /> {MOCK_ARTICLES[0].readTime}</span>
            <span className="flex items-center gap-2"><IconWrapper fa="fa-calendar-days" className="" /> {MOCK_ARTICLES[0].date}</span>
          </div>
          </div>
        </motion.div>

        {/* Regular Articles */}
        <div className="md:col-span-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
          {MOCK_ARTICLES.slice(1).concat(MOCK_ARTICLES).map((article, idx) => (
            <motion.div 
              key={`${article.id}-${idx}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              onClick={() => handleArticleClick(article)}
              className="glass-card rounded-[2.5rem] overflow-hidden flex flex-col group border-white/30 cursor-pointer"
            >
              <div className="aspect-[16/10] overflow-hidden rounded-t-[2.5rem]">
                <img src={article.image} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
              </div>
              <div className="p-8 text-right space-y-4 flex-grow flex flex-col">
                <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase">
                  <span className="text-brand-accent">{article.category}</span>
                  <span>{article.date}</span>
                </div>
                <h3 className="text-xl font-black text-brand-primary dark:text-white group-hover:text-brand-accent transition-colors line-clamp-2 leading-relaxed">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium line-clamp-3 leading-relaxed">
                  {article.excerpt}
                </p>
                <div className="pt-4 border-t border-gray-100 dark:border-white/5 mt-auto flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400">{article.readTime} مطالعه</span>
                  <button className="text-brand-primary dark:text-brand-accent font-black text-xs group-hover:translate-x-[-4px] transition-transform flex items-center gap-2">
                    ادامه مطلب <IconWrapper fa="fa-arrow-left" className="text-[8px]" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogView;
