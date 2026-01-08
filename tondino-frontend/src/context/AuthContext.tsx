/**
 * AuthContext - Authentication state management
 * 
 * Architecture: Zero-Trust localStorage - all auth flows through server-side
 * httpOnly cookies. This context manages UI state only, not auth tokens.
 */
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/types';
import { authAPI } from '@/services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User; // Alias for userProfile for backward compatibility
  login: (targetPage?: string) => Promise<void>;
  logout: () => void;
  userProfile: User;
  updateUserProfile: (data: Partial<User>) => void;
  loadGoogleGSI: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Auth state is determined by successful API calls, not localStorage
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const [userProfile, setUserProfile] = useState<User>({
    id: 0,
    name: '',
    avatar: '',
    email: '',
    joinDate: '',
    isAdmin: false,
  });

  // Check auth status on mount by attempting to fetch profile
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Use checkStatus to avoid 401 console errors if not logged in
        const status = await authAPI.checkStatus();
        
        if (status.isAuthenticated && status.user) {
          setIsAuthenticated(true);
          updateProfileFromAPI(status.user);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        // Fallback or network error
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);

  const updateProfileFromAPI = (profileData: any) => {
    const p: any = profileData;
    const name = p.name || p.user?.name || '';
    const email = p.email || p.user?.email || '';
    const avatar = p.avatar || p.user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`;
    const joinDateRaw = p.joinDate || p.join_date || p.user?.join_date || '';
    const joinDate = joinDateRaw ? new Date(joinDateRaw).toLocaleDateString('fa-IR') : '';
    const isAdmin = p.isAdmin ?? p.is_admin ?? p.user?.is_admin ?? false;
    const id = p.id || p.user?.id || 0;
    setUserProfile({ id, name, email, avatar, joinDate, isAdmin });
  };

  const login = async (targetPage?: string) => {
    setIsAuthenticated(true);
    // Fetch profile from backend
    try {
      const profileData = await authAPI.getProfile();
      updateProfileFromAPI(profileData);
      
      // Trigger CoursesActor to load user's courses after successful login
      const { CoursesActor } = await import('@/actors/CoursesActor');
      await CoursesActor.loadMyCourses();
    } catch (err) {
      console.error('Auth login profile load failed:', err);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout(); // Clear httpOnly cookie on server
      
      // Reset CoursesActor state on logout
      const { CoursesActor } = await import('@/actors/CoursesActor');
      await CoursesActor.reset();
    } catch (err) {
      console.error('Logout failed:', err);
    }
    setIsAuthenticated(false);
    setUserProfile({ id: 0, name: '', avatar: '', email: '', joinDate: '', isAdmin: false });
  };

  const updateUserProfile = (data: Partial<User>) => {
    setUserProfile(prev => ({ ...prev, ...data }));
  };

  const loadGoogleGSI = () => {
    return new Promise<void>((resolve, reject) => {
      if (typeof window !== 'undefined' && (window as any).google) return resolve();
      const existing = document.querySelector('script[data-google-gsi]');
      if (existing) {
        // wait until window.google becomes available
        const check = () => {
          if ((window as any).google) return resolve();
          setTimeout(check, 100);
        };
        check();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.setAttribute('data-google-gsi', '1');
      script.onload = () => {
        // small delay to ensure google object initialized
        setTimeout(() => resolve(), 50);
      };
      script.onerror = (e) => reject(new Error('Failed to load Google Sign-In'));
      document.head.appendChild(script);
    });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, userProfile, user: userProfile, updateUserProfile, loadGoogleGSI }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
