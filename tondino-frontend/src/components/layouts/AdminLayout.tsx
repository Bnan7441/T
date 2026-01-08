import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Tags, 
  LogOut, 
  Bell,
  Globe
} from 'lucide-react';

interface Props {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: any) => void;
}

export const AdminLayout: React.FC<Props> = ({ children, activeTab, onTabChange }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { id: 'dashboard', label: 'داشبورد', icon: LayoutDashboard },
    { id: 'courses', label: 'مدیریت دوره‌ها', icon: BookOpen },
    { id: 'users', label: 'کاربران', icon: Users },
    { id: 'categories', label: 'دسته‌بندی‌ها', icon: Tags },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden font-sans text-right" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-white/5 flex flex-col shadow-xl z-30">
        <div className="p-6 border-b border-gray-200 dark:border-white/5 flex items-center justify-center gap-3">
           <div className="w-10 h-10 bg-gradient-to-br from-brand-accent to-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
             <span className="text-white font-black text-xl">T</span>
           </div>
           <span className="font-black text-xl text-gray-800 dark:text-white tracking-tight">پنل مدیریت تندینو</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                activeTab === item.id 
                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30 font-bold' 
                  : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5 hover:text-gray-900'
              }`}
            >
              <item.icon size={20} className={`transition-transform duration-200 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
           <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border-2 border-brand-accent/20 overflow-hidden shadow-sm flex items-center justify-center">
                 <Users size={20} className="text-gray-400" />
              </div>
              <div className="flex-1 min-w-0 text-right">
                 <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name || 'مدیر'}</p>
                 <p className="text-xs text-gray-500 truncate" dir="ltr">{user?.email}</p>
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-2">
             <Link 
               to="/"
               className="flex items-center justify-center gap-2 text-gray-600 hover:text-brand-primary hover:bg-white dark:hover:bg-slate-800 py-2 rounded-lg transition-all text-sm font-medium border border-transparent hover:border-gray-200 dark:hover:border-white/10"
             >
               <Globe size={16} />
               <span>سایت</span>
             </Link>
             <button 
               onClick={handleLogout}
               className="flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 py-2 rounded-lg transition-colors text-sm font-medium"
             >
               <LogOut size={16} />
               <span>خروج</span>
             </button>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50 dark:bg-slate-950">
        {/* Top Header */}
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-8 shadow-sm z-20 sticky top-0">
           <div>
             <h2 className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-3">
               {navItems.find(i => i.id === activeTab)?.icon && React.createElement(navItems.find(i => i.id === activeTab)!.icon, { className: "text-brand-accent" })}
               {navItems.find(i => i.id === activeTab)?.label}
             </h2>
             <p className="text-xs text-gray-400 mt-1 font-medium">به پنل مدیریت تندینو خوش آمدید</p>
           </div>

           <div className="flex items-center gap-4">
              <div className="h-10 px-4 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center gap-2 text-sm text-gray-500 border border-transparent hover:border-gray-300 transition-colors cursor-pointer">
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                 وضعیت سیستم: آنلاین
              </div>
              <button className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full relative transition-colors">
                 <Bell size={20} />
                 <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
           </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-8 scroll-smooth">
           <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
             {children}
           </div>
        </div>
      </main>
    </div>
  );
};
