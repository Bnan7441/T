
import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import IconWrapper from './IconWrapper';
import { GoogleGenAI } from '@google/genai';

const AiAssistant: React.FC = () => {
  const { isChatOpen, setIsChatOpen, chatHistory, addChatMessage, updateLastChatMessage } = useChat();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatOpen) scrollToBottom();
  }, [chatHistory, isTyping, isChatOpen]);

  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setErrorMessage("مرورگر شما از تشخیص گفتار پشتیبانی نمی‌کند.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'fa-IR';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setErrorMessage(null);
    };
    recognition.onresult = (event: any) => setInput(event.results[0][0].transcript);
    recognition.onerror = () => {
      setIsListening(false);
      setErrorMessage("در دریافت صدا مشکلی پیش آمد.");
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleSend = async (e?: React.FormEvent, retryText?: string) => {
    e?.preventDefault();
    const messageToSend = retryText || input.trim();
    if (!messageToSend || isTyping) return;

    setInput('');
    setErrorMessage(null);
    
    if (!retryText) {
      addChatMessage(messageToSend, 'user');
    }
    
    setIsTyping(true);

    try {
      if (!import.meta.env.VITE_GOOGLE_AI_KEY) {
        throw new Error("کلید دسترسی هوش مصنوعی تنظیم نشده است.");
      }

      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_AI_KEY });
      const contents = chatHistory.concat([{ role: 'user', content: messageToSend }]).map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: contents,
        config: {
          systemInstruction: 'شما دستیار آموزشی هوشمند تندینو هستید. متخصص در تندخوانی، تمرکز و برنامه ریزی درسی. همیشه مهربان و حرفه‌ای پاسخ دهید.',
        }
      });

      const aiText = response.text;
      if (!aiText) throw new Error("پاسخی از سرور دریافت نشد.");
      
      addChatMessage(aiText, 'model');
    } catch (error: any) {
      console.error('AI Error:', error);
      setErrorMessage(error.message.includes('API_KEY') ? "خطا در پیکربندی سرور" : "خطا در برقراری ارتباط با هوش مصنوعی");
    } finally {
      setIsTyping(false);
    }
  };

  if (!isChatOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-[110] bg-brand-secondary/20 backdrop-blur-sm animate-in fade-in"
        onClick={() => setIsChatOpen(false)}
      />
      <div className="fixed inset-y-0 left-0 w-full sm:w-96 md:w-[450px] bg-white dark:bg-slate-900 z-[120] shadow-2xl animate-in slide-in-from-left duration-500 flex flex-col border-r border-gray-100 dark:border-white/5">
        <div className="p-6 bg-brand-primary text-white flex items-center justify-between">
          <div className="flex items-center gap-3 text-right">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
             <IconWrapper className="fa-solid fa-robot" fa="fa-robot" />
           </div>
             <div>
                <h3 className="font-black text-lg">دستیار هوشمند</h3>
                <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">آماده پاسخگویی به سوالات شما</p>
             </div>
          </div>
          <button onClick={() => setIsChatOpen(false)} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <IconWrapper className="fa-solid fa-xmark" fa="fa-xmark" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-6 no-scrollbar">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm whitespace-pre-wrap ${
                msg.role === 'user' ? 'bg-brand-primary text-white rounded-tr-none' : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 rounded-tl-none border border-gray-200 dark:border-white/5'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
               <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
               </div>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 p-4 rounded-2xl text-center space-y-3">
               <p className="text-xs text-red-600 dark:text-red-400 font-bold">{errorMessage}</p>
               <button 
                onClick={() => handleSend(undefined, chatHistory[chatHistory.length - 1]?.content)}
                className="text-[10px] font-black text-brand-primary underline"
               >
                 تلاش مجدد
               </button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-6 border-t border-gray-100 dark:border-white/5">
          <div className="relative flex items-center gap-2">
            <div className="relative flex-grow">
                <input 
                  type="text"
                  placeholder={isListening ? "در حال شنیدن صدای شما..." : "سوالی دارید بپرسید..."}
                  className={`w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-brand-accent transition-all text-sm font-bold dark:text-white ${isListening ? 'ring-2 ring-brand-accent animate-pulse' : ''}`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  dir="rtl"
                />
                <button 
                  type="button"
                  onClick={startVoiceRecognition}
                  className={`absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center ${isListening ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-brand-accent'}`}
                >
                  <IconWrapper className={`fa-solid ${isListening ? 'fa-microphone-lines' : 'fa-microphone'}`} fa={isListening ? 'fa-microphone-lines' : 'fa-microphone'} />
                </button>
            </div>
            <button type="submit" disabled={!input.trim() || isTyping} className="w-12 h-12 bg-brand-accent text-white rounded-2xl flex items-center justify-center hover:bg-brand-accentDark transition-all disabled:opacity-30">
              <IconWrapper className="fa-solid fa-paper-plane -rotate-45" fa="fa-paper-plane" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AiAssistant;
