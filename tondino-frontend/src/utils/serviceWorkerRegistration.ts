/**
 * Service Worker Registration
 * 
 * Handles service worker lifecycle and provides hooks for app integration
 */

interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

export async function registerServiceWorker(config: ServiceWorkerConfig = {}) {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported in this browser');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/'
    });

    console.log('[SW] Registered successfully:', registration.scope);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('[SW] New version available');
          config.onUpdate?.(registration);
        }
      });
    });

    // Handle successful activation
    if (registration.active) {
      config.onSuccess?.(registration);
    }

    return registration;
  } catch (error) {
    console.error('[SW] Registration failed:', error);
    return null;
  }
}

export function unregisterServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return Promise.resolve();
  }

  return navigator.serviceWorker.ready
    .then((registration) => {
      return registration.unregister();
    })
    .catch((error) => {
      console.error('[SW] Unregister failed:', error);
    });
}

export function skipWaiting() {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' });
}

export function clearCache() {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.controller?.postMessage({ type: 'CLEAR_CACHE' });
}

export function checkForUpdates() {
  if (!('serviceWorker' in navigator)) return Promise.resolve();

  return navigator.serviceWorker.ready
    .then((registration) => {
      return registration.update();
    })
    .catch((error) => {
      console.error('[SW] Update check failed:', error);
    });
}

// Online/Offline detection
export function setupNetworkListeners(config: ServiceWorkerConfig) {
  window.addEventListener('online', () => {
    console.log('[Network] Back online');
    config.onOnline?.();
  });

  window.addEventListener('offline', () => {
    console.log('[Network] Gone offline');
    config.onOffline?.();
  });

  // Check current status
  if (!navigator.onLine) {
    config.onOffline?.();
  }
}

// Request background sync
export async function requestBackgroundSync(tag: string = 'sync-data') {
  if (!('serviceWorker' in navigator) || !('sync' in ServiceWorkerRegistration.prototype)) {
    console.warn('Background sync not supported');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    // @ts-ignore - SyncManager is not yet in standard lib
    await registration.sync.register(tag);
    console.log('[SW] Background sync registered:', tag);
    return true;
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
    return false;
  }
}

// Request push notification permission
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// Subscribe to push notifications
export async function subscribeToPush(vapidPublicKey: string) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });

    console.log('[SW] Push subscription created');
    return subscription;
  } catch (error) {
    console.error('[SW] Push subscription failed:', error);
    return null;
  }
}

// Helper function
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
