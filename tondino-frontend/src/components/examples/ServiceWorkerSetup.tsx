/**
 * Example Integration: Service Worker Setup in Main App
 * 
 * Shows how to integrate service worker with the application
 */

import React, { useEffect } from 'react';
import { useError } from '@/context/ErrorContext';
import {
  registerServiceWorker,
  setupNetworkListeners,
  checkForUpdates
} from '@/utils/serviceWorkerRegistration';

export const useServiceWorkerSetup = () => {
  const { showInfo, showSuccess, showWarning, showError } = useError();

  useEffect(() => {
    // Only register in production
    if (import.meta.env.PROD) {
      registerServiceWorker({
        onSuccess: (registration) => {
          // Service worker registered successfully
          
          // Check for updates every hour
          setInterval(() => {
            checkForUpdates();
          }, 60 * 60 * 1000);
        },
        
        onUpdate: (registration) => {
          showInfo('نسخه جدید در دسترس است', undefined, [
            {
              label: 'به‌روزرسانی',
              action: () => {
                if (registration.waiting) {
                  registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                  window.location.reload();
                }
              }
            }
          ]);
        }
      });

      // Setup network status listeners
      setupNetworkListeners({
        onOnline: () => {
          showSuccess('اتصال به اینترنت برقرار شد');
        },
        onOffline: () => {
          showWarning('اتصال به اینترنت قطع شد. برخی ویژگی‌ها ممکن است محدود باشند.');
        }
      });
    }
  }, [showInfo, showSuccess, showWarning, showError]);
};

// Usage in App.tsx
export const AppWithServiceWorker: React.FC = () => {
  useServiceWorkerSetup();

  return (
    <div className="app">
      {/* Your app content */}
    </div>
  );
};
