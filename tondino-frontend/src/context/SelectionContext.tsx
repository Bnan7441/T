import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Course, Article, Lesson } from '@/types';

interface SelectionContextType {
  selectedCourse: Course | null;
  setSelectedCourse: (c: Course | null) => void;
  selectedArticle: Article | null;
  setSelectedArticle: (a: Article | null) => void;
  selectedLesson: Lesson | null;
  setSelectedLesson: (l: Lesson | null) => void;
  lastLesson: { courseId: string; lessonId: string } | null;
  setLastLesson: (l: { courseId: string; lessonId: string } | null) => void;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export const SelectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lastLesson, setLastLesson] = useState<{ courseId: string; lessonId: string } | null>(() => {
    try { const saved = localStorage.getItem('tondino_last_lesson'); return saved ? JSON.parse(saved) : null; } catch { return null; }
  });

  useEffect(() => {
    if (lastLesson) localStorage.setItem('tondino_last_lesson', JSON.stringify(lastLesson));
    else localStorage.removeItem('tondino_last_lesson');
  }, [lastLesson]);

  return (
    <SelectionContext.Provider value={{ selectedCourse, setSelectedCourse, selectedArticle, setSelectedArticle, selectedLesson, setSelectedLesson, lastLesson, setLastLesson }}>
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelection = () => {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error('useSelection must be used within SelectionProvider');
  return ctx;
};
