
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/Button';
import { useUI } from '@/context/UIContext';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';

interface BannerSlide {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  cta: string;
  icon: string;
  color: string;
  action: () => void;
}

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setIsSpeedFocusTestOpen, setIsChatOpen } = useUI();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(true);

  const BANNERS: BannerSlide[] = [
    {
      id: 1,
      title: t('hero.slide1Title'),
      subtitle: t('hero.slide1Subtitle'),
      image: "/images/hero/hero-1.jpg",
      cta: t('hero.slide1Cta'),
      icon: "fa-brain",
      color: "from-brand-primary/80",
      action: () => navigate('/courses')
    },
    {
      id: 2,
      title: t('hero.slide2Title'),
      subtitle: t('hero.slide2Subtitle'),
      image: "/images/hero/hero-2.jpg",
      cta: t('hero.slide2Cta'),
      icon: "fa-bolt",
      color: "from-orange-600/80",
      action: () => setIsSpeedFocusTestOpen(true)
    },
    {
      id: 3,
      title: t('hero.slide3Title'),
      subtitle: t('hero.slide3Subtitle'),
      image: "/images/hero/hero-3.jpg",
      cta: t('hero.slide3Cta'),
      icon: "fa-wand-magic-sparkles",
      color: "from-teal-600/80",
      action: () => setIsChatOpen(true)
    },
    {
      id: 4,
      title: t('hero.slide4Title'),
      subtitle: t('hero.slide4Subtitle'),
      image: "/images/hero/hero-4.jpg",
      cta: t('hero.slide4Cta'),
      icon: "fa-crown",
      color: "from-indigo-600/80",
      action: () => navigate('/club')
    }
  ];

  return (
    <section className="relative w-full pt-4 pb-8 lg:py-16 px-0">
      <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-center w-full">
        
        {/* Right Content (Visual Banner Slider) */}
        <div className="lg:col-span-5 order-1 relative h-[280px] lg:h-[520px]">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-10 p-3 lg:p-4"
            >
              {/* Slide Card */}
              <div className="relative h-full rounded-lg lg:rounded-xl shadow-premium overflow-hidden border-4 lg:border-8 border-white dark:border-slate-800 transform group">
                {/* Banner image with skeleton placeholder */}
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gray-200 dark:bg-slate-800 animate-pulse" />
                )}
                <img 
                  src={BANNERS[currentSlide].image} 
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageLoaded(true)}
                  className={`w-full h-full object-cover transition-transform duration-[6000ms] ease-linear group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`} 
                  alt={BANNERS[currentSlide].title} 
                />
                
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${BANNERS[currentSlide].color} via-transparent to-transparent`}></div>
                
                {/* Content Overlay */}
                <div className="absolute bottom-4 sm:bottom-6 md:bottom-10 right-4 sm:right-6 md:right-8 left-4 sm:left-6 md:left-8 text-right space-y-1 sm:space-y-2">
                  <motion.div
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="text-white/80 font-black text-[10px] sm:text-xs uppercase tracking-widest mb-2">
                      {BANNERS[currentSlide].subtitle}
                    </p>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight">
                      {BANNERS[currentSlide].title}
                    </h3>
                  </motion.div>

                  <motion.div
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="pt-4"
                  >
                    <Button 
                      variant="white" 
                      size="sm" 
                      onClick={BANNERS[currentSlide].action}
                      className="px-6 shadow-xl text-sm font-black"
                    >
                      {BANNERS[currentSlide].cta || 'مشاهده بیشتر'}
                    </Button>
                  </motion.div>
                </div>

                {/* Floating Category Icon */}
                <div className="absolute top-4 sm:top-5 md:top-6 lg:top-8 left-4 sm:left-5 md:left-6 lg:left-8 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl md:rounded-[1.25rem] lg:rounded-[1.5rem] bg-white/20 border border-white/30 flex items-center justify-center text-white text-sm sm:text-base md:text-lg lg:text-xl">
                  <Icon fa={BANNERS[currentSlide].icon} />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slider Pagination Dots */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {BANNERS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1 transition-all duration-300 rounded-full ${currentSlide === idx ? 'w-4 bg-brand-primary' : 'w-1 bg-brand-primary/20'}`}
              />
            ))}
          </div>
        </div>

        {/* Left Content (Text & Features) */}
        <div className="lg:col-span-7 order-2 text-right space-y-4 sm:space-y-5 md:space-y-8 lg:space-y-10">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-start pt-2 sm:pt-3 md:pt-4 items-center"
          >
            <motion.div
               animate={{ scale: [1, 1.02, 1] }}
               transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
                  <Button 
                  variant="accent" 
                  size="lg" 
                  onClick={() => setIsSpeedFocusTestOpen(true)}
                    className="rounded-full px-6 sm:px-8 md:px-10 lg:px-12 shadow-lg text-xs sm:text-sm md:text-base lg:text-lg group bg-brand-accent py-2.5 sm:py-3 md:py-3.5 lg:py-4 text-[#1A237E] flex items-center justify-center text-center leading-none min-h-[40px] sm:min-h-[44px] md:min-h-[48px]"
                >
                  تست سرعت مطالعه
                  <Icon fa="fa-gauge-high" className="ml-2 group-hover:translate-x-[-4px] transition-transform" />
                </Button>
            </motion.div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
