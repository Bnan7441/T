
import React, { createContext, useContext, ReactNode } from 'react';
import { UserStats, Course, Article, Lesson, AgeGroup, User } from '@/types';
import { UIProvider, useUI } from './UIContext';
import { SelectionProvider, useSelection } from './SelectionContext';
import { NotificationsProvider, useNotifications } from './NotificationsContext';
import { ChatProvider, useChat } from './ChatContext';
import { StatsProvider, useStats } from './StatsContext';
import { AuthProvider } from './AuthContext';
import { ErrorProvider } from './ErrorContext';
import { CoursesProvider } from './CoursesContext';

export const TondinoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ErrorProvider>
      <AuthProvider>
        <CoursesProvider>
          <UIProvider>
          <SelectionProvider>
            <NotificationsProvider>
              <ChatProvider>
                <StatsProvider>
                  {children}
                </StatsProvider>
              </ChatProvider>
            </NotificationsProvider>
          </SelectionProvider>
          </UIProvider>
        </CoursesProvider>
      </AuthProvider>
    </ErrorProvider>
  );
};

// NOTE: legacy `useTondino` wrapper has been removed. Use the focused hooks instead:
// - `useAuth()` from `src/context/AuthContext`
// - `useUI()` from `src/context/UIContext`
// - `useSelection()` from `src/context/SelectionContext`
// - `useNotifications()` from `src/context/NotificationsContext`
// - `useChat()` from `src/context/ChatContext`
// - `useStats()` from `src/context/StatsContext`
// - `useError()` from `src/context/ErrorContext`
// - `useCourses()` from `src/context/CoursesContext`

export default TondinoProvider;
