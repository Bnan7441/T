import React from "react";
import { useUI } from "@/context/UIContext";
import { useAuth } from "@/context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, BookOpen, User, GraduationCap } from 'lucide-react';

const BottomNav: React.FC = () => {
  const { setIsSearchOpen, setIsAuthModalOpen } = useUI();
  const { isAuthenticated, userProfile } = useAuth();
  const location = useLocation();

  const getPathClass = (path: string) => {
    return location.pathname === path ? "text-brand-primary dark:text-white" : "text-gray-400 dark:text-gray-500";
  };

  const getCourseButtonClass = () => {
    return location.pathname.startsWith("/courses") || location.pathname.startsWith("/course-detail")
      ? "bg-brand-primary shadow-brand-primary/20"
      : "bg-brand-accent shadow-brand-accent/20";
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 z-[60] lg:hidden px-4 pb-4 pt-1">
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-gray-200/60 ring-1 ring-black/5 rounded-[1.75rem] shadow-premium flex items-center justify-around p-1.5 h-16 pb-[env(safe-area-inset-bottom)]">
          <Link 
            to="/"
            className={`flex-1 flex flex-col items-center py-1 ${getPathClass("/")} active:scale-90`}
          >
              <div className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center ${location.pathname === '/' ? 'text-primary' : 'text-current'}`}>
                <Home size={20} />
              </div>
            <span className="text-[11px] font-black mt-1 text-slate-600">خانه</span>
          </Link>
          
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="flex-1 flex flex-col items-center py-1 text-slate-600 dark:text-gray-500 active:scale-90"
          >
              <div className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center">
                <Search size={20} />
              </div>
            <span className="text-[11px] font-black mt-1 text-slate-600">جستجو</span>
          </button>
          
          <div className="flex-1 flex justify-center items-center">
             <Link 
              to="/courses"
              className={`w-14 h-14 rounded-full ${getCourseButtonClass()} shadow-xl text-white flex items-center justify-center text-xl transform -translate-y-5 border-4 border-brand-surface dark:border-slate-950 transition-all duration-300`}
             >
               <GraduationCap size={20} />
             </Link>
          </div>

          <Link 
            to={isAuthenticated ? "/dashboard" : "/courses"}
            className={`flex-1 flex flex-col items-center py-1 ${getPathClass("/dashboard")} active:scale-90`}
          >
            <div className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center">
              <BookOpen size={20} />
            </div>
            <span className="text-[11px] font-black mt-1 text-slate-600">{isAuthenticated ? "پنل" : "دوره‌ها"}</span>
          </Link>
          
          <Link 
            to={isAuthenticated ? "/profile" : "#"} // If not authenticated, open auth modal.
            onClick={!isAuthenticated ? () => setIsAuthModalOpen(true) : undefined}
            className={`flex-1 flex flex-col items-center py-1 ${getPathClass("/profile")}`}
          >
            {isAuthenticated ? (
               <div className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full overflow-hidden border-2 border-brand-primary/30">
                 <img src={userProfile?.avatar} className="w-full h-full object-cover" alt="" />
               </div>
            ) : (
               <div className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center">
                 <User size={20} />
               </div>
            )}
            <span className="text-[11px] font-black mt-1 text-slate-600">{isAuthenticated ? "حساب" : "ورود"}</span>
          </Link>
       </div>
    </nav>
  );
};

export default BottomNav;
