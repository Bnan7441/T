import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

export interface ErrorMessage {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  timestamp: Date;
  details?: string;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

interface ErrorContextType {
  errors: ErrorMessage[];
  showError: (message: string, details?: string, actions?: ErrorMessage['actions']) => void;
  showWarning: (message: string, details?: string) => void;
  showSuccess: (message: string) => void;
  showInfo: (message: string, details?: string, actions?: ErrorMessage['actions']) => void;
  clearError: (id: string) => void;
  clearAllErrors: () => void;
  logError: (error: Error, context?: string) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [errors, setErrors] = useState<ErrorMessage[]>([]);

  const generateId = useCallback(() => Math.random().toString(36).substring(2) + Date.now().toString(36), []);

  const clearError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const addError = useCallback((message: string, type: ErrorMessage['type'], details?: string, actions?: ErrorMessage['actions']) => {
    const error: ErrorMessage = {
      id: generateId(),
      message,
      type,
      details,
      actions,
      timestamp: new Date(),
    };
    setErrors(prev => [...prev, error]);

    // Auto-remove success/info messages after 5 seconds
    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        clearError(error.id);
      }, 5000);
    }
  }, [generateId, clearError]);

  const showError = useCallback((message: string, details?: string, actions?: ErrorMessage['actions']) => {
    addError(message, 'error', details, actions);
  }, [addError]);

  const showWarning = useCallback((message: string, details?: string) => {
    addError(message, 'warning', details);
  }, [addError]);

  const showSuccess = useCallback((message: string) => {
    addError(message, 'success');
  }, [addError]);

  const showInfo = useCallback((message: string, details?: string, actions?: ErrorMessage['actions']) => {
    addError(message, 'info', details, actions);
  }, [addError]);

  const logError = useCallback((error: any, context?: string) => {
    // Ensure we have a proper Error object
    const errorObj = error instanceof Error ? error : new Error(String(error || 'Unknown error'));
    
    // Log to console for development
    console.error(`[Error ${context ? `- ${context}` : ''}]:`, errorObj);

    // In production, this would also send to a logging service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to logging service (e.g., Sentry, LogRocket)
    }

    // Show user-friendly error message
    const userMessage = getUserFriendlyMessage(errorObj, context);
    showError(userMessage, errorObj.message);
  }, [showError]);

  return (
    <ErrorContext.Provider value={{
      errors,
      showError,
      showWarning,
      showSuccess,
      showInfo,
      clearError,
      clearAllErrors,
      logError,
    }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const ctx = useContext(ErrorContext);
  if (!ctx) throw new Error('useError must be used within ErrorProvider');
  return ctx;
};

// Helper function to convert technical errors to user-friendly messages
function getUserFriendlyMessage(error: Error, context?: string): string {
  const message = error.message.toLowerCase();

  if (message.includes('network') || message.includes('fetch')) {
    return 'خطا در برقراری ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی کنید.';
  }

  if (message.includes('unauthorized') || message.includes('401')) {
    return 'نشست شما منقضی شده است. لطفاً مجدداً وارد شوید.';
  }

  if (message.includes('forbidden') || message.includes('403')) {
    return 'شما اجازه دسترسی به این بخش را ندارید.';
  }

  if (message.includes('not found') || message.includes('404')) {
    return 'محتوای درخواستی یافت نشد.';
  }

  if (message.includes('timeout')) {
    return 'زمان درخواست تمام شد. لطفاً دوباره تلاش کنید.';
  }

  if (context === 'api' || context === 'server') {
    return 'خطا در سرور. لطفاً چند لحظه دیگر تلاش کنید.';
  }

  if (context === 'courses') {
    return 'خطا در بارگیری دوره‌ها. لطفاً صفحه را تازه‌سازی کنید.';
  }

  if (context === 'auth') {
    return 'خطا در احراز هویت. لطفاً اطلاعات ورود خود را بررسی کنید.';
  }

  // Default fallback
  return 'خطایی رخ داده است. لطفاً دوباره تلاش کنید.';
}