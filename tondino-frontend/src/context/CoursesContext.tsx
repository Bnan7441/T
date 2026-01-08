/**
 * CoursesContext - React Context wrapper for CoursesActor
 * 
 * Architecture: This context is now a thin React adapter over the CoursesActor,
 * following the strict actor pattern. All state lives in the actor, and this
 * context merely provides React hooks for subscribing to actor state changes.
 * 
 * NO localStorage - all auth is handled via server-side sessions.
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CoursesActor, type CoursesActorState } from '@/actors/CoursesActor';
import { useError } from './ErrorContext';
import { useAuth } from './AuthContext';
import type { Course } from '@/types';

interface CoursesContextType {
  courses: Course[];
  myCourses: Course[];
  loading: boolean;
  refreshCourses: () => Promise<void>;
  refreshMyCourses: () => Promise<void>;
  getCourseById: (id: string) => Course | undefined;
}

const CoursesContext = createContext<CoursesContextType | undefined>(undefined);

export const CoursesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { logError } = useError();
  const { isAuthenticated } = useAuth();
  
  // Subscribe to actor state
  const [actorState, setActorState] = useState<CoursesActorState>({
    courses: [],
    myCourses: [],
    loading: true,
    error: null,
    lastRefresh: null,
  });

  useEffect(() => {
    // Initialize the actor
    CoursesActor.getInstance();
    
    // Subscribe to state changes
    const unsubscribe = CoursesActor.subscribe((newState) => {
      setActorState(newState);
      
      // Log errors to error context if present
      if (newState.error) {
        logError(new Error(newState.error), 'courses');
      }
    });

    // Load initial data
    CoursesActor.loadCourses();

    return () => {
      unsubscribe();
    };
  }, [logError]);

  useEffect(() => {
    CoursesActor.getInstance();

    if (isAuthenticated) {
      CoursesActor.loadMyCourses();
      return;
    }

    // Clear myCourses on logout to avoid showing stale purchased courses
    void CoursesActor.getInstance().send({ type: 'courses:clear_my_courses' });
  }, [isAuthenticated]);

  const refreshCourses = async () => {
    await CoursesActor.loadCourses();
  };

  const refreshMyCourses = async () => {
    await CoursesActor.loadMyCourses();
  };

  const getCourseById = (id: string): Course | undefined => {
    return actorState.courses.find(c => c.id === id || c.course_id === id);
  };

  const value: CoursesContextType = {
    courses: actorState.courses,
    myCourses: actorState.myCourses,
    loading: actorState.loading,
    refreshCourses,
    refreshMyCourses,
    getCourseById,
  };

  return <CoursesContext.Provider value={value}>{children}</CoursesContext.Provider>;
};

export const useCourses = (): CoursesContextType => {
  const context = useContext(CoursesContext);
  if (!context) {
    throw new Error('useCourses must be used within CoursesProvider');
  }
  return context;
};
