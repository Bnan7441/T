import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserStats } from '@/types';
import { USER_STATS } from '@/data';
import { coursesAPI } from '@/services/api';
import { CoursesActor } from '@/actors/CoursesActor';
import { useAuth } from './AuthContext';

interface StatsContextType {
  userStats: UserStats;
  updateTopSpeed: (s: number) => Promise<void> | void;
  addPoints: (p: number) => Promise<void> | void;
  purchaseCourse: (courseId: string | number) => Promise<void> | void;
  setUserStats: (s: UserStats) => void;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export const StatsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [userStats, setUserStats] = useState<UserStats>(() => {
    try { const saved = localStorage.getItem('tondino_stats'); return saved ? JSON.parse(saved) as UserStats : USER_STATS; } catch { return USER_STATS; }
  });

  useEffect(() => {
    try { localStorage.setItem('tondino_stats', JSON.stringify(userStats)); } catch {}
  }, [userStats]);

  const updateTopSpeed = async (speed: number) => {
    const newSpeed = Math.max(userStats.topSpeed, speed);
    setUserStats(prev => ({ ...prev, topSpeed: newSpeed }));
    if (isAuthenticated) {
      try { await coursesAPI.updateStats({ topSpeed: newSpeed }); } catch (e) { console.error('Error updating speed:', e); }
    }
  };

  const addPoints = async (p: number) => {
    const newPoints = userStats.points + p;
    setUserStats(prev => ({ ...prev, points: newPoints }));
    if (isAuthenticated) {
      try { await coursesAPI.updateStats({ points: newPoints }); } catch (e) { console.error('Error updating points:', e); }
    }
  };

  const purchaseCourse = async (courseId: string | number) => {
    if (!courseId || !isAuthenticated) return;
    try {
      const courseIdStr = String(courseId);
      await coursesAPI.purchaseCourse(courseIdStr);
      setUserStats(prev => ({
        ...prev,
        completedCourseIds: prev.completedCourseIds.includes(courseIdStr)
          ? prev.completedCourseIds
          : [...prev.completedCourseIds, courseIdStr]
      }));

      // Keep "My Courses" in sync immediately after purchase
      void CoursesActor.loadMyCourses();
    } catch (e) { console.error('Error purchasing course:', e); throw e; }
  };

  return (
    <StatsContext.Provider value={{ userStats, updateTopSpeed, addPoints, purchaseCourse, setUserStats }}>
      {children}
    </StatsContext.Provider>
  );
};

export const useStats = () => {
  const ctx = useContext(StatsContext);
  if (!ctx) throw new Error('useStats must be used within StatsProvider');
  return ctx;
};
