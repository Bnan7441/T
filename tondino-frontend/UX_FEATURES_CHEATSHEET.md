/**
 * UX FEATURES QUICK REFERENCE
 * Copy-paste ready code snippets for all new features
 */

// ============================================
// 1. SERVICE WORKER - OFFLINE SUPPORT
// ============================================

// Setup in main.tsx or App.tsx
import { registerServiceWorker, setupNetworkListeners } from '@/utils/serviceWorkerRegistration';
import { useError } from '@/context/ErrorContext';

function setupOfflineSupport() {
  const { showInfo, showSuccess, showWarning } = useError();

  registerServiceWorker({
    onUpdate: (reg) => showInfo('نسخه جدید آماده است')
  });

  setupNetworkListeners({
    onOnline: () => showSuccess('آنلاین'),
    onOffline: () => showWarning('آفلاین')
  });
}


// ============================================
// 2. PROGRESSIVE LOADING
// ============================================

import { ProgressiveImage, LazyLoad, ContentLoader } from '@/components/ui/ProgressiveLoader';

// Progressive Image
<ProgressiveImage 
  src="/path/to/image.jpg"
  alt="Description"
  className="w-full h-64 object-cover"
/>

// Lazy Load Component
<LazyLoad threshold={0.1} rootMargin="50px">
  <HeavyComponent />
</LazyLoad>

// Content Loader
<ContentLoader 
  isLoading={isLoading}
  skeleton={<Skeleton />}
>
  <Content />
</ContentLoader>


// ============================================
// 3. VIRTUAL SCROLLING
// ============================================

import { VirtualScroll, InfiniteScroll } from '@/components/ui/VirtualScroll';

// Fixed Height Virtual Scroll
<VirtualScroll
  items={courses}
  itemHeight={200}
  renderItem={(course) => <CourseCard course={course} />}
  overscan={3}
  className="h-screen"
/>

// Dynamic Height Virtual Scroll
<VirtualScroll
  items={items}
  itemHeight={(item, index) => item.expanded ? 300 : 150}
  renderItem={(item) => <Card item={item} />}
/>

// Infinite Scroll
<InfiniteScroll
  items={items}
  renderItem={(item) => <Item item={item} />}
  loadMore={async () => await fetchMore()}
  hasMore={hasMore}
  isLoading={isLoading}
  threshold={0.8}
/>


// ============================================
// 4. PULL TO REFRESH
// ============================================

import { PullToRefresh } from '@/components/ui/PullToRefresh';

// Basic Usage
<PullToRefresh
  onRefresh={async () => {
    await fetchData();
  }}
>
  <ContentList />
</PullToRefresh>

// Custom Hook
import { usePullToRefresh } from '@/components/ui/PullToRefresh';

const {
  pullDistance,
  isRefreshing,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  progress
} = usePullToRefresh(refreshHandler, { threshold: 80 });


// ============================================
// 5. REQUEST DEDUPLICATION
// ============================================

import { requestDeduplicator, useDedupedFetch } from '@/utils/requestDeduplication';

// Direct API Call
const courses = await requestDeduplicator.fetch('/api/courses', {
  headers: { 'Authorization': `Bearer ${token}` }
}, {
  ttl: 30000, // 30 second cache
  enabled: true
});

// React Hook
const { data, error, isLoading } = useDedupedFetch('/api/courses', {
  method: 'GET'
}, {
  ttl: 30000
});

// Cache Management
requestDeduplicator.invalidate('/api/courses'); // Clear specific
requestDeduplicator.invalidate(/^GET:\/api/); // Clear by pattern
requestDeduplicator.clearExpired(); // Clear expired

// Prefetch
await requestDeduplicator.prefetch('/api/course/123');

// Update API Services
export const coursesAPI = {
  getAll: () => requestDeduplicator.fetch('/api/courses', {}, { ttl: 30000 }),
  getOne: (id) => requestDeduplicator.fetch(`/api/courses/${id}`, {}, { ttl: 60000 }),
  create: (data) => requestDeduplicator.fetch('/api/courses', {
    method: 'POST',
    body: JSON.stringify(data)
  }, { enabled: false }) // Don't cache POST requests
};


// ============================================
// 6. ERROR BOUNDARIES (Already Implemented)
// ============================================

import { ErrorBoundary, RouteErrorBoundary, ComponentErrorBoundary } from '@/components/shared/ErrorBoundary';

// App Level
<ErrorBoundary>
  <App />
</ErrorBoundary>

// Route Level
<RouteErrorBoundary>
  <Route path="/dashboard" element={<Dashboard />} />
</RouteErrorBoundary>

// Component Level
<ComponentErrorBoundary componentName="UserProfile">
  <UserProfile />
</ComponentErrorBoundary>


// ============================================
// 7. TOAST NOTIFICATIONS (Already Implemented)
// ============================================

import { useError } from '@/context/ErrorContext';

function MyComponent() {
  const { showError, showSuccess, showWarning, showInfo, logError } = useError();

  // Simple messages
  showSuccess('عملیات موفق بود');
  showError('خطا رخ داد');
  showWarning('هشدار');
  showInfo('اطلاعات');

  // With details
  showError('خطا در ذخیره', 'اتصال به سرور برقرار نشد');

  // With actions
  showError('خطا', undefined, [
    { label: 'تلاش مجدد', action: () => retry() },
    { label: 'لغو', action: () => cancel() }
  ]);

  // Log errors
  try {
    await riskyOperation();
  } catch (error) {
    logError(error, 'MyComponent');
  }
}


// ============================================
// COMPLETE EXAMPLE - ALL FEATURES COMBINED
// ============================================

import React, { useState, useCallback, useEffect } from 'react';
import { VirtualScroll } from '@/components/ui/VirtualScroll';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { ProgressiveImage, LazyLoad } from '@/components/ui/ProgressiveLoader';
import { ComponentErrorBoundary } from '@/components/shared/ErrorBoundary';
import { useError } from '@/context/ErrorContext';
import { requestDeduplicator } from '@/utils/requestDeduplication';

function EnhancedList() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showError, showSuccess, logError } = useError();

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await requestDeduplicator.fetch('/api/items', {}, { ttl: 30000 });
      setItems(data);
    } catch (error) {
      logError(error, 'EnhancedList');
      showError('خطا در بارگذاری');
    } finally {
      setIsLoading(false);
    }
  }, [showError, logError]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleRefresh = async () => {
    requestDeduplicator.invalidate('/api/items');
    await fetchItems();
    showSuccess('به‌روزرسانی شد');
  };

  const renderItem = (item, index) => (
    <ComponentErrorBoundary componentName="ItemCard">
      <LazyLoad threshold={0.1}>
        <div className="card">
          <ProgressiveImage 
            src={item.image} 
            alt={item.title}
            className="w-full h-48"
          />
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </div>
      </LazyLoad>
    </ComponentErrorBoundary>
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <VirtualScroll
        items={items}
        itemHeight={250}
        renderItem={renderItem}
        overscan={3}
        className="h-screen"
      />
    </PullToRefresh>
  );
}

export default EnhancedList;


// ============================================
// PERFORMANCE MONITORING
// ============================================

// Monitor cache stats
const stats = requestDeduplicator.getStats();
console.log('Cache size:', stats.cacheSize);
console.log('In-flight requests:', stats.inFlightCount);

// Clear cache programmatically
import { clearCache } from '@/utils/serviceWorkerRegistration';
clearCache();

// Check online status
if (!navigator.onLine) {
  console.log('Offline mode');
}


// ============================================
// BUILD & DEPLOYMENT
// ============================================

// Build with service worker
npm run build

// Test locally
npx serve -s dist

// Performance audit
npx lighthouse http://localhost:3000 --view

// Bundle analysis
npm run build -- --analyze
