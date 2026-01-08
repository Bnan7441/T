import React, { useState } from 'react';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminCategories from '@/components/admin/AdminCategories';
import AdminCourses from '@/components/admin/AdminCourses';
import AdminUsers from '@/components/admin/AdminUsers';
import { motion, AnimatePresence } from 'framer-motion';
import IconWrapper from '@/components/IconWrapper';
import { useNavigate } from 'react-router-dom';

const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses' | 'users' | 'categories'>('dashboard');
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', label: 'داشبورد', icon: 'fa-gauge' },
    { id: 'courses', label: 'مدیریت دوره‌ها', icon: 'fa-graduation-cap' },
    { id: 'categories', label: 'دسته‌بندی‌ها', icon: 'fa-layer-group' },
    { id: 'users', label: 'کاربران', icon: 'fa-users' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col md:flex-row" dir="rtl">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-l border-gray-200 dark:border-white/5 flex-shrink-0">
        <div className="p-6 flex items-center justify-between md:justify-center border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg transform -rotate-6">
                <span className="text-white font-black text-xl italic">T</span>
             </div>
             <span className="font-black text-xl text-gray-800 dark:text-white">پنل مدیریت</span>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        activeTab === item.id 
                        ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 font-bold' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                >
                    <IconWrapper className={`${activeTab === item.id ? 'text-white' : ''}`} fa={`fa-solid ${item.icon}`} />
                    <span>{item.label}</span>
                </button>
            ))}
            
            <button
                onClick={() => navigate('/')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 transition-all duration-200 mt-8"
            >
                <IconWrapper fa="fa-solid fa-sign-out-alt" />
                <span>خروج از پنل</span>
            </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8 overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
        <header className="mb-8 flex items-center justify-between">
           <div>
              <h1 className="text-2xl md:text-3xl font-black text-brand-primary dark:text-white mb-2">
                {menuItems.find(i => i.id === activeTab)?.label}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-bold">
                به پنل مدیریت تندینو خوش آمدید
              </p>
           </div>
        </header>

        <AnimatePresence mode="wait">
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
            >
                {activeTab === 'dashboard' && <AdminDashboard />}
                {activeTab === 'courses' && <AdminCourses />}
                {activeTab === 'users' && <AdminUsers />}
                {activeTab === 'categories' && <AdminCategories />}
            </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminView;
