
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUI } from '../../context/UIContext';
import { useStats } from '../../context/StatsContext';
import { Button } from '../../components/ui/Button';
import { PERSONA_CONTENT, PersonaType, PersonaData } from '../../data/TestContent';
import { useTimer } from '../../hooks/useTimer';
import Icon from '../../components/Icon';

type TestStep = 'persona' | 'reading' | 'comprehension' | 'math' | 'results';

const AnimatedNumber: React.FC<{ value: number; duration?: number }> = ({ value, duration = 1500 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setDisplayValue(Math.floor(progress * value));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{displayValue}</>;
};

export const SpeedFocusTest: React.FC = () => {
  const { isSpeedFocusTestOpen, setIsSpeedFocusTestOpen } = useUI();
  const { updateTopSpeed, addPoints } = useStats();
  const [step, setStep] = useState<TestStep>('persona');
  const [activePersona, setActivePersona] = useState<PersonaData | null>(null);
  
  // Reading Stats
  const [readStartTime, setReadStartTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [isDistracted, setIsDistracted] = useState(false);
  
  // Quiz Stats
  const [quizScore, setQuizScore] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  // Math Focus Stats
  const [mathProblem, setMathProblem] = useState({ expression: '', answer: 0 });
  const [mathInput, setMathInput] = useState('');
  const [mathFocusScore, setMathFocusScore] = useState(0);
  const [mathDifficulty, setMathDifficulty] = useState(1);
  const [mathStartTime, setMathStartTime] = useState(0);

  const { seconds: timerSeconds, start: startTimer, stop: stopTimer, reset: resetTimer } = useTimer(5, () => {
    finishTest();
  });

  const closeTest = () => {
    setIsSpeedFocusTestOpen(false);
    setTimeout(() => {
      setStep('persona');
      setWpm(0);
      setQuizScore(0);
      setMathFocusScore(0);
      setCurrentQuestionIdx(0);
      setMathDifficulty(1);
      setActivePersona(null);
      setIsDistracted(false);
    }, 500);
  };

  const finishTest = () => {
    setStep('results');
    // Award points based on performance
    const pointsAwarded = Math.round((wpm / 10) + (quizScore * 50) + (mathFocusScore / 2));
    addPoints(pointsAwarded);
  };

  const handleSelectPersona = (type: PersonaType) => {
    const data = PERSONA_CONTENT[type];
    setActivePersona(data);
    setReadStartTime(performance.now());
    setStep('reading');
    setTimeout(() => setIsDistracted(true), 3000);
  };

  const handleFinishReading = () => {
    if (!activePersona) return;
    const endTime = performance.now();
    const durationInMinutes = (endTime - readStartTime) / 60000;
    const wordCount = activePersona.readingStory.join(" ").split(/\s+/).filter(w => w.length > 0).length;
    const calculatedWpm = Math.round(wordCount / durationInMinutes);
    setWpm(calculatedWpm);
    updateTopSpeed(calculatedWpm);
    setIsDistracted(false);
    setStep('comprehension');
  };

  const handleAnswer = (idx: number) => {
    if (!activePersona) return;
    if (idx === activePersona.quiz[currentQuestionIdx].correct) {
      setQuizScore(prev => prev + 1);
    }
    if (currentQuestionIdx < activePersona.quiz.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      generateMathProblem(1);
      setStep('math');
    }
  };

  const generateMathProblem = useCallback((level: number) => {
    if (!activePersona) return;
    let expression = '';
    let answer = 0;

    switch (activePersona.id) {
      case 'kid':
        const a = Math.floor(Math.random() * (10 * level)) + 2;
        const b = Math.floor(Math.random() * (10 * level)) + 2;
        expression = `${a} + ${b}`;
        answer = a + b;
        break;
      case 'teen':
        const x = Math.floor(Math.random() * 12) + 2;
        const y = Math.floor(Math.random() * 12) + 2;
        expression = `${x} × ${y}`;
        answer = x * y;
        break;
      case 'adult':
        const total = [40, 60, 80, 100, 200][Math.floor(Math.random() * 5)];
        const percent = [10, 15, 20, 25, 50][Math.floor(Math.random() * 5)];
        expression = `%${percent} از ${total}`;
        answer = (percent * total) / 100;
        break;
    }

    setMathProblem({ expression, answer });
    setMathInput('');
    setMathStartTime(performance.now());
    resetTimer(activePersona.mathTimer);
    startTimer();
  }, [activePersona, resetTimer, startTimer]);

  const handleMathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isCorrect = parseInt(mathInput) === mathProblem.answer;
    if (isCorrect) setMathFocusScore(prev => prev + 50);
    stopTimer();
    finishTest();
  };

  const speedStats = getSpeedCategory(wpm);
  const focusIndex = activePersona ? Math.round((quizScore / activePersona.quiz.length) * 50 + (Math.min(mathFocusScore, 100) / 100) * 50) : 0;

  function getSpeedCategory(val: number) {
    if (val > 300) return { label: 'استاد تندخوانی', color: 'from-yellow-400 to-orange-500' };
    if (val > 200) return { label: 'خواننده پیشرفته', color: 'from-brand-accent to-teal-500' };
    return { label: 'خواننده در حال رشد', color: 'from-brand-primary to-blue-600' };
  };

  if (!isSpeedFocusTestOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 md:bg-brand-primary/20 backdrop-blur-3xl overflow-hidden">
        <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} className="w-full h-full md:w-[95vw] md:h-[90vh] md:max-w-4xl bg-white dark:bg-slate-900 md:rounded-[3rem] shadow-premium overflow-hidden flex flex-col relative">
          
          <header className="p-4 md:p-8 flex items-center justify-between border-b border-gray-100 dark:border-white/5 z-20">
            <button onClick={closeTest} className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-slate-800 text-gray-400">
              <Icon fa="fa-xmark" className="text-base" />
            </button>
            <div className="flex items-center gap-3 text-right">
               <div className="text-right">
                  <h3 className="text-sm md:text-lg font-black text-brand-primary dark:text-white">ارزیابی تندینو</h3>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{activePersona ? `${activePersona.label} MODE` : 'LABORATORY'}</p>
               </div>
              <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center text-white ${activePersona ? activePersona.theme.primary : 'bg-brand-accent'}`}>
                <Icon fa={activePersona ? activePersona.theme.icon : 'fa-flask'} className="text-2xl" />
              </div>
            </div>
          </header>

          <main className="flex-grow p-6 md:p-12 overflow-y-auto no-scrollbar flex flex-col items-center justify-between z-10 text-right">
            <AnimatePresence mode="wait">
              {step === 'persona' && (
                <motion.div key="persona" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex flex-col justify-center items-center h-full space-y-8">
                  <h2 className="text-2xl md:text-3xl font-black text-brand-primary dark:text-white">کیستی؟</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                    {(Object.keys(PERSONA_CONTENT) as PersonaType[]).map(key => {
                      const p = PERSONA_CONTENT[key];
                      return (
                        <button key={p.id} onClick={() => handleSelectPersona(p.id)} className="p-6 rounded-3xl bg-gray-50 dark:bg-slate-800 hover:border-brand-accent border-2 border-transparent transition-all flex items-center gap-4 sm:flex-col shadow-sm">
                          <div className={`w-12 h-12 rounded-2xl ${p.theme.primary} text-white flex items-center justify-center text-2xl`}><Icon fa={p.theme.icon} className="text-2xl" /></div>
                          <span className="font-black text-brand-primary dark:text-white">{p.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {step === 'reading' && activePersona && (
                <motion.div key="reading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex flex-col h-full justify-between gap-6">
                  <div className="flex-grow flex flex-col justify-center space-y-6 max-w-2xl mx-auto">
                    {activePersona.readingStory.map((para, idx) => (
                      <p key={idx} className="text-base md:text-xl text-gray-700 dark:text-gray-200 leading-loose font-medium">{para}</p>
                    ))}
                  </div>
                  <Button variant="accent" size="lg" onClick={handleFinishReading} className="w-full md:w-auto md:mx-auto rounded-2xl py-5 px-16 shadow-glow">تمام کردم</Button>
                </motion.div>
              )}

              {step === 'comprehension' && activePersona && (
                <motion.div key="comprehension" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="w-full flex flex-col justify-center items-center h-full space-y-8">
                  <h2 className="text-xl md:text-2xl font-black text-brand-primary dark:text-white text-center">{activePersona.quiz[currentQuestionIdx].q}</h2>
                  <div className="grid gap-3 w-full max-w-md">
                    {activePersona.quiz[currentQuestionIdx].options.map((opt, i) => (
                      <button key={i} onClick={() => handleAnswer(i)} className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 text-right font-bold hover:bg-white border hover:border-brand-primary transition-all">
                        {opt}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 'math' && activePersona && (
                <motion.div key="math" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full flex flex-col justify-center items-center h-full space-y-10">
                  <div className="space-y-4 text-center">
                    <h3 className="text-lg font-black text-brand-primary dark:text-white">چالش تمرکز سریع</h3>
                    <p className="text-6xl font-black text-brand-primary dark:text-white ltr-num tracking-tight">{mathProblem.expression}</p>
                  </div>
                  <form onSubmit={handleMathSubmit} className="w-full max-w-xs space-y-4">
                    <input autoFocus type="number" inputMode="numeric" placeholder="؟" className="w-full text-center text-4xl font-black p-5 bg-gray-50 dark:bg-slate-800 rounded-[2rem] border-2 focus:border-brand-accent outline-none" value={mathInput} onChange={(e) => setMathInput(e.target.value)} />
                    <Button type="submit" variant="accent" className="w-full rounded-2xl py-4">تایید پاسخ</Button>
                  </form>
                </motion.div>
              )}

              {step === 'results' && activePersona && (
                <motion.div key="results" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full flex flex-col h-full justify-center space-y-8">
                  <h2 className="text-2xl font-black text-brand-primary dark:text-white text-center">تحلیل عملکرد شما</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-8 bg-gradient-to-br ${speedStats.color} rounded-[2.5rem] text-white shadow-xl`}>
                       <p className="text-5xl font-black ltr-num"><AnimatedNumber value={wpm} /></p>
                       <p className="text-xs font-bold pt-2 border-t border-white/20 mt-4">سرعت مطالعه (WPM)</p>
                    </div>
                    <div className="p-8 bg-gray-50 dark:bg-slate-800 rounded-[2.5rem] shadow-xl">
                       <p className="text-5xl font-black text-brand-primary dark:text-white ltr-num"><AnimatedNumber value={focusIndex} />%</p>
                       <p className="text-xs font-bold text-gray-400 pt-2 border-t border-gray-200 mt-4">شاخص تمرکز و درک مطلب</p>
                    </div>
                  </div>
                  <Button variant="accent" className="w-full py-5 rounded-2xl shadow-glow" onClick={closeTest}>ذخیره و پایان</Button>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
