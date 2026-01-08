import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error reporting service (e.g., Sentry)
    }

    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-exclamation-triangle text-2xl text-red-500" />
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              خطایی رخ داده است
            </h2>
            
            <p className="text-gray-600 mb-6">
              متاسفانه مشکلی در برنامه پیش آمده است. لطفاً دوباره تلاش کنید.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-4 text-right">
                <summary className="text-sm text-gray-500 cursor-pointer mb-2">
                  جزئیات خطا (محیط توسعه)
                </summary>
                <pre className="text-xs bg-red-50 p-2 rounded text-red-700 overflow-auto text-left">
                  {this.state.error.message}
                  {this.state.error.stack && (
                    <>
                      {'\n\nStack trace:\n'}
                      {this.state.error.stack}
                    </>
                  )}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 bg-brand-primary text-white px-4 py-2 rounded hover:bg-brand-primary-dark transition-colors"
              >
                تلاش مجدد
              </button>
              
              <button
                onClick={this.handleReload}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
              >
                بارگیری مجدد صفحه
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Specialized error boundaries for different app sections
export const RouteErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    fallback={
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center p-8">
          <i className="fas fa-exclamation-circle text-4xl text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">خطا در بارگیری صفحه</h3>
          <p className="text-gray-600 mb-4">این صفحه به درستی بارگیری نشد</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-brand-primary text-white px-4 py-2 rounded hover:bg-brand-primary-dark"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);

export const ComponentErrorBoundary: React.FC<{ 
  children: ReactNode; 
  componentName?: string;
}> = ({ children, componentName }) => (
  <ErrorBoundary
    fallback={
      <div className="bg-red-50 border border-red-200 rounded p-4 text-center">
        <i className="fas fa-exclamation-triangle text-red-500 mb-2" />
        <p className="text-sm text-red-700">
          خطا در نمایش {componentName || 'این بخش'}
        </p>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);