
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/Button';
import { useStats } from '../../context/StatsContext';
import Icon from '../../components/Icon';

export const ReadingTestWidget: React.FC = () => {
  const { updateTopSpeed } = useStats();
  const [speed, setSpeed] = useState<number | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [text, setText] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timerDisplay, setTimerDisplay] = useState(0); // seconds
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let interval: any;
    if (isReading) {
      interval = setInterval(() => {
        setTimerDisplay(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isReading]);

  const handleStart = () => {
    if (!text.trim()) {
      alert("لطفاً ابتدا متنی را برای مطالعه وارد کنید.");
      return;
    }
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount < 10) {
      alert("متن بسیار کوتاه است. حداقل ۱۰ کلمه وارد کنید.");
      return;
    }

    setIsReading(true);
    setStartTime(Date.now());
    setTimerDisplay(0);
    setSpeed(null);
  };

  const handleFinish = () => {
    if (!startTime) return;
    
    const endTime = Date.now();
    const durationInMinutes = (endTime - startTime) / 60000;
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    
    let calculatedSpeed = 0;
    if (durationInMinutes > 0.001) {
       calculatedSpeed = Math.round(wordCount / durationInMinutes);
       setSpeed(calculatedSpeed);
       updateTopSpeed(calculatedSpeed);
    }
    
    setIsReading(false);
    setStartTime(null);
  };

  const resetTest = () => {
    setSpeed(null);
    setText('');
    setTimerDisplay(0);
  };

  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="w-full h-full min-h-[400px] bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2.5rem] shadow-premium border border-white/60 dark:border-white/5 relative overflow-hidden text-right flex flex-col transition-colors duration-300">
      <div className="absolute top-0 right-0 w-48 h-48 bg-brand-accent/5 dark:bg-teal-900/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col h-full gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-lg transition-colors duration-500 ${isReading ? 'bg-orange-500 text-white animate-pulse' : 'bg-brand-accent text-white shadow-brand-accent/20'}`}>
              <Icon fa={isReading ? 'fa-hourglass-half' : 'fa-gauge-high'} className="text-lg" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-black text-brand-primary dark:text-white text-base">سنجش سرعت واقعی</h3>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                 {isReading ? 'زمان سپری شده: ' + timerDisplay + ' ثانیه' : 'محاسبه‌گر کلمه در دقیقه'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-grow bg-brand-surface dark:bg-slate-700/50 rounded-[1.5rem] p-5 border border-gray-100 dark:border-white/5 relative overflow-hidden flex flex-col transition-all">
          
          {speed !== null ? (
            <div role="status" className="flex flex-col items-center justify-center h-full space-y-4 animate-in zoom-in duration-500">
              <div className="text-center">
                 <span className="text-6xl font-black text-brand-primary dark:text-white tracking-tighter block">{speed.toLocaleString('fa-IR')}</span>
                 <span className="text-xs font-bold text-gray-400">کلمه در دقیقه</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-[10px] font-black">
                {speed > 200 ? (
                  <><Icon fa="fa-trophy" className="text-yellow-500" /> عالی! سرعت شما بالاتر از میانگین است</>
                ) : (
                  <><Icon fa="fa-person-running" className="text-blue-500" /> خوب، اما نیاز به تمرین تندخوانی دارید</>
                )}
              </div>
              <p className="text-[10px] text-gray-400 max-w-[200px] text-center leading-relaxed">
                 شما {wordCount.toLocaleString('fa-IR')} کلمه را در {timerDisplay.toLocaleString('fa-IR')} ثانیه مطالعه کردید.
              </p>
              <button 
                onClick={resetTest}
                className="text-xs text-brand-accent dark:text-teal-400 font-black hover:underline mt-2"
              >
                انجام تست مجدد
              </button>
            </div>
          ) : (
            <div className="h-full flex flex-col relative">
               {isReading && (
                 <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl pointer-events-none">
                    <p className="bg-brand-primary text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xl animate-bounce">
                       در حال مطالعه... پس از اتمام دکمه پایان را بزنید
                    </p>
                 </div>
               )}
               <textarea
                 ref={textareaRef}
                 className={`w-full h-full bg-transparent resize-none outline-none text-xs md:text-sm text-gray-600 dark:text-gray-300 font-medium placeholder-gray-400 dark:placeholder-gray-500 leading-relaxed transition-opacity ${isReading ? 'opacity-50 blur-[1px]' : 'opacity-100'}`}
                 placeholder="یک متن را برای آزمایش اینجا بنویسید یا کپی کنید..."
                 value={text}
                 onChange={(e) => setText(e.target.value)}
                 readOnly={isReading}
               ></textarea>
               {!isReading && (
                   <div className="mt-auto pt-3 flex justify-between items-center text-[9px] text-gray-400 dark:text-gray-500 font-bold border-t border-gray-100/50 dark:border-white/5">
                     <span>متن را وارد کرده و دکمه شروع را بزنید</span>
                     <span>{wordCount.toLocaleString('fa-IR')} کلمه</span>
                   </div>
               )}
            </div>
          )}
        </div>

        <Button 
            onClick={isReading ? handleFinish : handleStart} 
            disabled={!isReading && (!text.trim() || speed !== null)}
            variant={isReading ? 'primary' : 'accent'}
            className={`w-full py-3.5 rounded-xl text-sm font-black shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${isReading ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}`}
        >
            {isReading ? (
                <>
                  <Icon fa="fa-stop" className="" />
                  پایان و محاسبه سرعت
                </>
            ) : (
                <>
                  <Icon fa="fa-play" className="" />
                  {speed !== null ? 'سرعت ثبت شد' : 'شروع چالش سرعت'}
                </>
            )}
        </Button>
      </div>
    </div>
  );
};
