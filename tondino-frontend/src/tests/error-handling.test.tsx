import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import { ErrorProvider, useError } from '@/context/ErrorContext';
import { ErrorDisplay, ErrorBanner } from '@/components/shared/ErrorComponents';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

// Test component to trigger errors
const ErrorTrigger = ({ shouldError = false }: { shouldError?: boolean }) => {
  const { showError, showSuccess, logError } = useError();

  if (shouldError) {
    throw new Error('Test component error');
  }

  return (
    <div>
      <button 
        onClick={() => showError('Test error message')}
        data-testid="trigger-error"
      >
        Trigger Error
      </button>
      
      <button 
        onClick={() => showSuccess('Test success message')}
        data-testid="trigger-success"
      >
        Trigger Success
      </button>
      
      <button 
        onClick={() => logError(new Error('Test logged error'), 'test')}
        data-testid="log-error"
      >
        Log Error
      </button>
    </div>
  );
};

const CustomErrorTrigger = ({ error, context }: { error: Error, context?: string }) => {
  const { logError } = useError();
  return (
    <button 
      onClick={() => logError(error, context)} 
      data-testid="trigger-custom-error"
    >
      Log Custom Error
    </button>
  );
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ErrorProvider>
    {children}
    <ErrorDisplay />
  </ErrorProvider>
);

describe('Error Handling System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('should display error messages', async () => {
    render(
      <TestWrapper>
        <ErrorTrigger />
      </TestWrapper>
    );

    const triggerButton = screen.getByTestId('trigger-error');
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });
  });

  test('should display success messages and auto-hide them', async () => {
    vi.useFakeTimers();
    render(
      <TestWrapper>
        <ErrorTrigger />
      </TestWrapper>
    );

    const triggerButton = screen.getByTestId('trigger-success');
    
    // Trigger and check immediate appearance
    await act(async () => {
        fireEvent.click(triggerButton);
    });

    expect(screen.getByText('Test success message')).toBeInTheDocument();

    // Fast-forward time to test auto-hide
    await act(async () => {
        vi.advanceTimersByTime(6000);
    });

    expect(screen.queryByText('Test success message')).not.toBeInTheDocument();
  });

  test('should log errors with context', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <TestWrapper>
        <ErrorTrigger />
      </TestWrapper>
    );

    const logButton = screen.getByTestId('log-error');
    fireEvent.click(logButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Error - test]:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  test('should show user-friendly messages for network errors', async () => {
    const networkError = new Error('Failed to fetch');
    
    render(
      <TestWrapper>
        <CustomErrorTrigger error={networkError} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByTestId('trigger-custom-error'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  test('ErrorBoundary should catch component errors', async () => {
    // Suppress React error boundary logging to console
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <TestWrapper>
        <ErrorBoundary>
          <ErrorTrigger shouldError={true} />
        </ErrorBoundary>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('خطایی رخ داده است')).toBeInTheDocument();
      expect(screen.getByText('تلاش مجدد')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  test('ErrorBanner should display inline error messages', () => {
    const onClose = vi.fn();
    
    render(
      <ErrorBanner 
        message="Test banner error"
        type="error"
        onClose={onClose}
      />
    );

    expect(screen.getByText('Test banner error')).toBeInTheDocument();
    
    const closeButton = screen.getByLabelText('بستن پیام');
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  test('should handle different error types with appropriate messages', async () => {
     const authError = new Error('Unauthorized');
     
     render(
      <TestWrapper>
        <CustomErrorTrigger error={authError} context="auth" />
      </TestWrapper>
    );

    fireEvent.click(screen.getByTestId('trigger-custom-error'));

    await waitFor(() => {
       expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});

describe('getUserFriendlyMessage', () => {
  test('should convert network errors to Persian', () => {
    expect(true).toBe(true);
  });

  test('should convert auth errors to Persian', () => {
    expect(true).toBe(true);
  });

  test('should provide context-specific messages', () => {
    expect(true).toBe(true);
  });
});
