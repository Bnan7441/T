import React from 'react';
import { useNotifications } from '@/context/NotificationsContext';
import { useUI } from '@/context/UIContext';
import Icon from './Icon';

const NotificationDrawer: React.FC = () => {
  const { notifications, markNotificationsRead } = useNotifications();
  const { isNotificationsOpen, setIsNotificationsOpen } = useUI();

  if (!isNotificationsOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-[70] bg-brand-secondary/40 backdrop-blur-sm animate-in fade-in"
        onClick={() => setIsNotificationsOpen(false)}
      />
      <div className="fixed inset-y-0 left-0 w-80 md:w-96 bg-white dark:bg-slate-900 z-[80] shadow-2xl animate-in slide-in-from-left duration-500 flex flex-col border-r border-gray-100 dark:border-white/5">
        <div className="p-6 border-b border-gray-50 dark:border-white/5 flex items-center justify-between">
          <button 
            onClick={() => setIsNotificationsOpen(false)}
            className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-brand-primary dark:hover:text-white transition-colors"
          >
            <Icon fa="fa-xmark" className="text-lg" />
          </button>
          <div className="flex items-center gap-3">
             <h3 className="text-xl font-black text-brand-primary dark:text-white">اعلان‌ها</h3>
             <Icon fa="fa-bell" className="text-brand-accent" />
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-3">
          {notifications.map((n) => (
            <div 
              key={n.id} 
              className={`p-5 rounded-[1.5rem] border transition-all text-right group relative ${
                n.read ? 'bg-white dark:bg-slate-800 border-gray-50 dark:border-white/5' : 'bg-brand-primary/5 dark:bg-white/5 border-brand-primary/10 dark:border-brand-accent/20'
              }`}
            >
              {!n.read && <span className="absolute top-4 right-4 w-2 h-2 bg-brand-accent rounded-full"></span>}
              <div className="flex items-start gap-4 rtl:flex-row-reverse">
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                   n.type === 'achievement' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                 }`}>
                    <Icon fa={n.type === 'achievement' ? 'fa-medal' : 'fa-book-open'} className="" />
                 </div>
                 <div className="space-y-1">
                    <h4 className="font-black text-brand-primary dark:text-white text-sm">{n.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{n.description}</p>
                    <p className="text-[10px] text-gray-300 dark:text-gray-600 font-bold mt-2 uppercase">{n.time}</p>
                 </div>
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-4">
              <Icon fa="fa-ghost" className="text-4xl text-gray-200" />
              <p className="text-gray-400 font-medium">هیچ اعلانی ندارید.</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-50 dark:border-white/5">
          <button 
            onClick={markNotificationsRead}
            className="w-full py-4 text-xs font-black text-brand-primary dark:text-brand-accent bg-brand-primary/5 dark:bg-white/5 rounded-2xl hover:bg-brand-primary hover:text-white transition-all"
          >
            علامت‌گذاری همه به عنوان خوانده شده
          </button>
        </div>
      </div>
    </>
  );
};

export default NotificationDrawer;