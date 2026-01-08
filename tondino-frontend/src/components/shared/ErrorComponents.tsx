import React from 'react';
import { useError, ErrorMessage } from '@/context/ErrorContext';

export const ErrorToast: React.FC<{ error: ErrorMessage }> = ({ error }) => {
  const { clearError } = useError();

  const getErrorStyles = (type: ErrorMessage['type']) => {
    switch (type) {
      case 'error':
        return 'bg-red-500 border-red-600 text-white';
      case 'warning':
        return 'bg-yellow-500 border-yellow-600 text-white';
      case 'success':
        return 'bg-green-500 border-green-600 text-white';
      case 'info':
        return 'bg-blue-500 border-blue-600 text-white';
      default:
        return 'bg-gray-500 border-gray-600 text-white';
    }
  };

  const getIcon = (type: ErrorMessage['type']) => {
    switch (type) {
      case 'error':
        return 'fa-exclamation-triangle';
      case 'warning':
        return 'fa-exclamation-circle';
      case 'success':
        return 'fa-check-circle';
      case 'info':
        return 'fa-info-circle';
      default:
        return 'fa-bell';
    }
  };

  return (
    <div
      className={`
        relative p-4 rounded-lg border shadow-lg max-w-md w-full
        transform transition-all duration-300 ease-in-out
        animate-in slide-in-from-top-5 fade-in
        ${getErrorStyles(error.type)}
      `}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start space-x-3 space-x-reverse">
        <div className="flex-shrink-0">
          <i className={`fas ${getIcon(error.type)} text-lg`} aria-hidden="true" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{error.message}</p>
          
          {error.details && (
            <p className="text-xs mt-1 opacity-90">{error.details}</p>
          )}
          
          {error.actions && error.actions.length > 0 && (
            <div className="flex gap-2 mt-2">
              {error.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="text-xs px-2 py-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => clearError(error.id)}
          className="flex-shrink-0 text-white hover:text-opacity-75 transition-opacity"
          aria-label="بستن پیام"
        >
          <i className="fas fa-times text-sm" />
        </button>
      </div>
    </div>
  );
};

export const ErrorDisplay: React.FC = () => {
  const { errors } = useError();

  if (errors.length === 0) return null;

  return (
    <div
      className="fixed top-20 left-4 right-4 z-50 space-y-2 pointer-events-none"
      style={{ maxHeight: 'calc(100vh - 6rem)', overflowY: 'auto' }}
    >
      <div className="flex flex-col items-end space-y-2">
        {errors.slice(-5).map(error => (
          <div key={error.id} className="pointer-events-auto">
            <ErrorToast error={error} />
          </div>
        ))}
      </div>
    </div>
  );
};

export const ErrorBanner: React.FC<{ 
  message: string;
  type?: ErrorMessage['type'];
  onClose?: () => void;
  actions?: ErrorMessage['actions'];
}> = ({ 
  message, 
  type = 'error', 
  onClose,
  actions 
}) => {
  const getStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return 'fa-exclamation-triangle text-red-500';
      case 'warning':
        return 'fa-exclamation-circle text-yellow-500';
      case 'success':
        return 'fa-check-circle text-green-500';
      case 'info':
        return 'fa-info-circle text-blue-500';
      default:
        return 'fa-bell text-gray-500';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getStyles()}`} role="alert">
      <div className="flex items-start">
        <i className={`fas ${getIcon()} mt-0.5 text-lg flex-shrink-0`} />
        
        <div className="mr-3 flex-1">
          <p className="text-sm font-medium">{message}</p>
          
          {actions && actions.length > 0 && (
            <div className="flex gap-2 mt-2">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="text-sm font-medium underline hover:no-underline"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-current hover:text-opacity-75 transition-opacity"
            aria-label="بستن پیام"
          >
            <i className="fas fa-times" />
          </button>
        )}
      </div>
    </div>
  );
};