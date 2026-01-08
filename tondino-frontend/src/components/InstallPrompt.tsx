import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import IconWrapper from './IconWrapper';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone
      || document.referrer.includes('android-app://');

    setIsStandalone(isInStandaloneMode);

    // Check if it's iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if user has already dismissed the prompt
    const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-dismissed');

    // Only show prompt if:
    // 1. User hasn't seen it before
    // 2. App is not already installed
    // 3. It's the first visit or early visits
    if (!hasSeenPrompt && !isInStandaloneMode) {
      // Wait a bit before showing the prompt (better UX)
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000); // Show after 3 seconds

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setShowPrompt(false);
        localStorage.setItem('pwa-install-prompt-dismissed', 'true');
      }

      setDeferredPrompt(null);
    } else if (isIOS) {
      // For iOS, we can't trigger the install prompt programmatically
      // Just keep showing the instructions
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-prompt-dismissed', 'true');
  };

  const handleRemindLater = () => {
    setShowPrompt(false);
    // Don't set the dismissed flag, so it shows again on next visit
  };

  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-[400px] z-50"
      >
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-primary to-blue-600 p-4 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

            <div className="relative flex items-start gap-3">
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl">
                <IconWrapper className="fa-solid fa-mobile-screen-button" fa="fa-mobile-screen-button" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-lg mb-1">نصب تندینو</h3>
                <p className="text-sm text-white/90">برای دسترسی سریع‌تر و تجربه بهتر!</p>
              </div>
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <IconWrapper className="fa-solid fa-times text-sm" fa="fa-times" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {isIOS ? (
              // iOS Instructions
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-300 font-bold">
                  برای نصب تندینو روی آیفون یا آیپد:
                </p>
                <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary font-black text-xs">
                      ۱
                    </span>
                    <span>
                      روی آیکون <strong className="text-blue-500">اشتراک‌گذاری</strong> <IconWrapper className="fa-solid fa-arrow-up-from-bracket text-blue-500 text-xs" fa="fa-arrow-up-from-bracket" /> در پایین صفحه کلیک کنید
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary font-black text-xs">
                      ۲
                    </span>
                    <span>
                      گزینه <strong className="text-blue-500">Add to Home Screen</strong> را انتخاب کنید
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary font-black text-xs">
                      ۳
                    </span>
                    <span>روی <strong className="text-blue-500">Add</strong> کلیک کنید</span>
                  </li>
                </ol>
              </div>
            ) : (
              // Android/Desktop Instructions
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-300 font-bold">
                  مزایای نصب اپلیکیشن:
                </p>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <IconWrapper className="fa-solid fa-check-circle text-green-500" fa="fa-check-circle" />
                    <span>دسترسی سریع از صفحه اصلی گوشی</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <IconWrapper className="fa-solid fa-check-circle text-green-500" fa="fa-check-circle" />
                    <span>استفاده آفلاین بدون نیاز به اینترنت</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <IconWrapper className="fa-solid fa-check-circle text-green-500" fa="fa-check-circle" />
                    <span>تجربه کاربری بهتر و سریع‌تر</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <IconWrapper className="fa-solid fa-check-circle text-green-500" fa="fa-check-circle" />
                    <span>دریافت اعلان‌های آموزشی</span>
                  </li>
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {!isIOS && deferredPrompt && (
                <button
                  onClick={handleInstall}
                  className="flex-1 bg-brand-primary hover:bg-blue-700 text-white font-black py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl"
                >
                  <IconWrapper className="fa-solid fa-download ml-2" fa="fa-download" />
                  نصب کن
                </button>
              )}
              <button
                onClick={handleRemindLater}
                className={`${!isIOS && deferredPrompt ? 'flex-initial px-4' : 'flex-1'} bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 font-bold py-3 rounded-xl transition-colors`}
              >
                {!isIOS && deferredPrompt ? (
                  <IconWrapper className="fa-solid fa-clock" fa="fa-clock" />
                ) : (
                  'بعداً یادم بنداز'
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InstallPrompt;
