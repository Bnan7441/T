import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'achievement' | 'course' | 'info';
  read: boolean;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markNotificationsRead: () => void;
  setNotifications: (n: Notification[]) => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

const DEFAULT_NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'دستاورد جدید!', description: 'شما نشان "خواننده سریع" را کسب کردید.', time: '۵ دقیقه پیش', type: 'achievement', read: false },
  { id: '2', title: 'دوره جدید منتشر شد', description: 'آموزش هوش مصنوعی مقدماتی در دسترس است.', time: '۲ ساعت پیش', type: 'course', read: false },
];

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(DEFAULT_NOTIFICATIONS);

  const markNotificationsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markNotificationsRead, setNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
};
