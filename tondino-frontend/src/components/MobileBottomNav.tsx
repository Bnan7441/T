import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  BookOpen,
  PlayCircle,
  GraduationCap,
  Search,
  Bell,
  User
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { useSelection } from '@/context/SelectionContext';
import { useNotifications } from '@/context/NotificationsContext';

/**
 * NavButton Sub-component
 * Individual navigation button with touch target optimization
 */
interface NavButtonProps {
  icon: React.ComponentType<any>;
  label: string;
  to?: string;
  onClick?: () => void;
  isActive: boolean;
  badge?: number;
}

const NavButton: React.FC<NavButtonProps> = ({
  icon: Icon,
  label,
  to,
  onClick,
  isActive,
  badge
}) => {
  const content = (
    <motion.div
      whileTap={{ scale: 0.95 }}
      className="flex flex-col items-center justify-center gap-1 min-w-[48px] min-h-[48px] relative"
    >
      {/* Badge for notifications */}
      {badge && badge > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black rounded-full w-4 h-4 flex items-center justify-center">
          {badge > 9 ? '9+' : badge}
        </span>
      )}

      {/* Icon */}
      <Icon
        size={20}
        strokeWidth={2}
        className={isActive ? 'text-brand-primary' : 'text-gray-400'}
      />

      {/* Label */}
      <span
        className={`text-[10px] font-black ${
          isActive ? 'text-brand-primary' : 'text-gray-500'
        }`}
      >
        {label}
      </span>
    </motion.div>
  );

  if (to) {
    return (
      <Link to={to} className="w-full h-full flex items-center justify-center">
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className="w-full h-full flex items-center justify-center">
      {content}
    </button>
  );
};

/**
 * MobileBottomNav Component
 *
 * High-end mobile navigation bar with:
 * - 5 navigation items (Home, My Courses, FAB, Search, Notifications, Profile)
 * - Glassmorphism effect (backdrop-blur-md)
 * - Contextual FAB (Resume Lesson vs All Courses)
 * - Safe area support for iPhone notches
 * - Touch-friendly 48x48px minimum buttons
 * - Framer Motion tap animations
 */
const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { setIsAuthModalOpen, setIsSearchOpen, setIsNotificationsOpen } = useUI();
  const { lastLesson } = useSelection();
  const { unreadCount } = useNotifications();

  const location = useLocation();

  /**
   * Contextual FAB Configuration
   *
   * IF user has a lesson in progress (lastLesson exists):
   *   - Show "Resume Last Lesson" (ادامه درس)
   *   - Use PlayCircle icon
   *   - Color: brand-accent
   *
   * ELSE:
   *   - Show "All Courses" (همه دوره‌ها)
   *   - Use GraduationCap icon
   *   - Color: brand-primary
   */
  const fabConfig = useMemo(() => {
    if (lastLesson) {
      return {
        label: 'ادامه درس',
        icon: PlayCircle,
        action: () => {
          // Navigate to the last lesson's course view
          // (LessonView uses the route param as courseId)
          navigate(`/lesson/${lastLesson.courseId}`);
        },
        color: 'bg-brand-accent'
      };
    }

    return {
      label: 'همه دوره‌ها',
      icon: GraduationCap,
      action: () => {
        navigate('/courses');
      },
      color: 'bg-brand-primary'
    };
  }, [lastLesson, navigate]);

  return (
    <nav className="fixed bottom-0 inset-x-0 z-mobile-nav lg:hidden pb-[env(safe-area-inset-bottom)]">
      {/* Glassmorphism container with semi-transparent background and blur effect */}
      <div className="mx-4 mb-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-[1.75rem] border border-gray-200/60 dark:border-white/5 shadow-premium">
        {/* Navigation items grid: 5 columns with equal spacing */}
        <div className="grid grid-cols-5 gap-2 p-2 h-16">
          {/* HOME */}
          <NavButton
            icon={Home}
            label="خانه"
            to="/"
            isActive={location.pathname === '/'}
          />

          {/* MY COURSES / DASHBOARD */}
          <NavButton
            icon={BookOpen}
            label="دوره‌ها"
            to={isAuthenticated ? '/dashboard' : '/courses'}
            isActive={
              location.pathname === '/dashboard' || location.pathname === '/courses'
            }
          />

          {/* CONTEXTUAL FAB (Center position) */}
          <motion.button
            onClick={fabConfig.action}
            whileTap={{ scale: 0.9 }}
            className={`
              relative -mt-8 w-14 h-14 rounded-full ${fabConfig.color}
              shadow-lg flex items-center justify-center
              border-4 border-white dark:border-slate-950
              transition-colors duration-300 hover:shadow-xl
              justify-self-center
            `}
            aria-label={fabConfig.label}
          >
            <fabConfig.icon size={24} strokeWidth={2} className="text-white" />
          </motion.button>

          {/* NOTIFICATIONS */}
          <NavButton
            icon={Bell}
            label="اعلان‌ها"
            onClick={() => setIsNotificationsOpen(true)}
            isActive={false}
            badge={unreadCount > 0 ? unreadCount : undefined}
          />

          {/* PROFILE / LOGIN */}
          <NavButton
            icon={User}
            label={isAuthenticated ? 'حساب' : 'ورود'}
            to={isAuthenticated ? '/profile' : undefined}
            onClick={!isAuthenticated ? () => setIsAuthModalOpen(true) : undefined}
            isActive={location.pathname === '/profile'}
          />
        </div>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
