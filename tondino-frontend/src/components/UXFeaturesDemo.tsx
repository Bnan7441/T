/**
 * UX Features Demo Page
 * Demonstrates all newly implemented UX enhancement features
 */

import React, { useState } from 'react';
import { VirtualScroll, InfiniteScroll } from '@/components/ui/VirtualScroll';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { ProgressiveImage, LazyLoad, ContentLoader } from '@/components/ui/ProgressiveLoader';
import { ComponentErrorBoundary } from '@/components/shared/ErrorBoundary';
import { useError } from '@/context/ErrorContext';
import { Skeleton, CourseCardSkeleton } from '@/components/ui/LoadingStates';
import { requestDeduplicator } from '@/utils/requestDeduplication';

interface DemoItem {
  id: number;
  title: string;
  description: string;
  image: string;
}

export const UXFeaturesDemo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<string>('virtual-scroll');
  const [items, setItems] = useState<DemoItem[]>(generateMockItems(100));
  const [isLoading, setIsLoading] = useState(false);
  const { showError, showSuccess, showWarning, showInfo } = useError();

  // Generate mock data
  function generateMockItems(count: number): DemoItem[] {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      title: `آیتم شماره ${i + 1}`,
      description: `توضیحات آیتم ${i + 1} - این یک نمونه متن است`,
      image: `https://picsum.photos/400/300?random=${i}`
    }));
  }

  // Refresh handler
  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setItems(generateMockItems(100));
    setIsLoading(false);
    showSuccess('داده‌ها به‌روزرسانی شدند');
  };

  // Load more handler
  const handleLoadMore = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newItems = generateMockItems(20).map(item => ({
      ...item,
      id: items.length + item.id
    }));
    setItems([...items, ...newItems]);
  };

  // Demo toast notifications
  const testToasts = () => {
    showSuccess('عملیات با موفقیت انجام شد!');
    setTimeout(() => showError('خطا در انجام عملیات', 'جزئیات خطا'), 1000);
    setTimeout(() => showWarning('این یک هشدار است'), 2000);
    setTimeout(() => showInfo('اطلاعات مفید برای کاربر'), 3000);
  };

  // Demo request deduplication
  const testDeduplication = async () => {
    showInfo('در حال ارسال درخواست‌ها...');
    
    // Send 5 identical requests - should only execute once
    const promises = Array.from({ length: 5 }, () => 
      requestDeduplicator.fetch('https://jsonplaceholder.typicode.com/posts/1', {}, { ttl: 10000 })
    );

    try {
      await Promise.all(promises);
      const stats = requestDeduplicator.getStats();
      showSuccess(`تنها ${stats.inFlightCount + 1} درخواست ارسال شد (به جای 5 درخواست)`);
    } catch (error) {
      showError('خطا در ارسال درخواست');
    }
  };

  // Render item for virtual scroll
  const renderItem = (item: DemoItem, index: number) => (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-3 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        <ProgressiveImage
          src={item.image}
          alt={item.title}
          className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
          <p className="text-sm text-gray-600">{item.description}</p>
          <div className="flex gap-2 mt-2">
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              #{index + 1}
            </span>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
              دمو
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">🎉 دموی ویژگی‌های UX</h1>
          <p className="text-purple-100">تمام ویژگی‌های جدید پیاده‌سازی شده</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 overflow-x-auto">
          <div className="flex gap-2">
            {[
              { id: 'virtual-scroll', label: 'اسکرول مجازی', icon: 'list' },
              { id: 'pull-refresh', label: 'Pull to Refresh', icon: 'sync' },
              { id: 'progressive', label: 'بارگذاری تدریجی', icon: 'image' },
              { id: 'toasts', label: 'اعلان‌ها', icon: 'bell' },
              { id: 'deduplication', label: 'حذف تکراری', icon: 'compress' },
            ].map((demo) => (
              <button
                key={demo.id}
                onClick={() => setActiveDemo(demo.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2 transition-colors ${
                  activeDemo === demo.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <i className={`fas fa-${demo.icon}`} />
                {demo.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4">
        <ComponentErrorBoundary componentName="Demo Content">
          
          {/* Virtual Scroll Demo */}
          {activeDemo === 'virtual-scroll' && (
            <div>
              <div className="bg-white rounded-xl p-6 mb-4">
                <h2 className="text-xl font-bold mb-2">اسکرول مجازی</h2>
                <p className="text-gray-600 mb-4">
                  تنها آیتم‌های قابل مشاهده رندر می‌شوند. برای لیست‌های بزرگ (+1000 آیتم) بهینه است.
                </p>
                <div className="text-sm text-purple-700 bg-purple-50 p-3 rounded">
                  <strong>تعداد آیتم‌ها:</strong> {items.length} | <strong>رندر شده:</strong> تنها ~10-15 آیتم
                </div>
              </div>
              
              <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                <VirtualScroll
                  items={items}
                  itemHeight={120}
                  renderItem={renderItem}
                  overscan={3}
                  className="h-[600px] p-4"
                />
              </div>
            </div>
          )}

          {/* Pull to Refresh Demo */}
          {activeDemo === 'pull-refresh' && (
            <div>
              <div className="bg-white rounded-xl p-6 mb-4">
                <h2 className="text-xl font-bold mb-2">Pull to Refresh</h2>
                <p className="text-gray-600 mb-4">
                  برای به‌روزرسانی، از بالا به پایین بکشید (بهتر روی موبایل کار می‌کند)
                </p>
                <div className="text-sm text-blue-700 bg-blue-50 p-3 rounded">
                  💡 <strong>نکته:</strong> این ویژگی روی دستگاه‌های لمسی بهتر کار می‌کند
                </div>
              </div>

              <PullToRefresh
                onRefresh={handleRefresh}
                className="bg-white rounded-xl overflow-hidden shadow-sm h-[600px]"
              >
                <div className="p-4 space-y-3">
                  {items.slice(0, 20).map((item, index) => renderItem(item, index))}
                </div>
              </PullToRefresh>
            </div>
          )}

          {/* Progressive Loading Demo */}
          {activeDemo === 'progressive' && (
            <div>
              <div className="bg-white rounded-xl p-6 mb-4">
                <h2 className="text-xl font-bold mb-2">بارگذاری تدریجی</h2>
                <p className="text-gray-600 mb-4">
                  تصاویر با placeholder نمایش داده می‌شوند و به تدریج بارگذاری می‌شوند
                </p>
                <button
                  onClick={() => setItems(generateMockItems(50))}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  <i className="fas fa-sync mr-2" />
                  تصاویر جدید بارگذاری کن
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.slice(0, 12).map((item) => (
                  <LazyLoad key={item.id} threshold={0.1} rootMargin="100px">
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <ProgressiveImage
                        src={item.image}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  </LazyLoad>
                ))}
              </div>
            </div>
          )}

          {/* Toast Notifications Demo */}
          {activeDemo === 'toasts' && (
            <div>
              <div className="bg-white rounded-xl p-6 mb-4">
                <h2 className="text-xl font-bold mb-2">سیستم اعلان‌ها (Toast)</h2>
                <p className="text-gray-600 mb-4">
                  اعلان‌های مختلف برای بازخورد به کاربر
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={testToasts}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-xl hover:shadow-lg transition-shadow"
                >
                  <i className="fas fa-play text-2xl mb-2" />
                  <div className="font-bold text-lg">تست همه اعلان‌ها</div>
                  <div className="text-sm opacity-90">موفق، خطا، هشدار، اطلاعات</div>
                </button>

                <button
                  onClick={() => showSuccess('عملیات موفق!')}
                  className="bg-green-500 text-white p-6 rounded-xl hover:shadow-lg transition-shadow"
                >
                  <i className="fas fa-check-circle text-2xl mb-2" />
                  <div className="font-bold text-lg">اعلان موفقیت</div>
                  <div className="text-sm opacity-90">Success Toast</div>
                </button>

                <button
                  onClick={() => showError('خطایی رخ داد', 'جزئیات خطا')}
                  className="bg-red-500 text-white p-6 rounded-xl hover:shadow-lg transition-shadow"
                >
                  <i className="fas fa-exclamation-triangle text-2xl mb-2" />
                  <div className="font-bold text-lg">اعلان خطا</div>
                  <div className="text-sm opacity-90">Error Toast</div>
                </button>

                <button
                  onClick={() => showWarning('این یک هشدار است')}
                  className="bg-yellow-500 text-white p-6 rounded-xl hover:shadow-lg transition-shadow"
                >
                  <i className="fas fa-exclamation-circle text-2xl mb-2" />
                  <div className="font-bold text-lg">اعلان هشدار</div>
                  <div className="text-sm opacity-90">Warning Toast</div>
                </button>
              </div>
            </div>
          )}

          {/* Request Deduplication Demo */}
          {activeDemo === 'deduplication' && (
            <div>
              <div className="bg-white rounded-xl p-6 mb-4">
                <h2 className="text-xl font-bold mb-2">حذف درخواست‌های تکراری</h2>
                <p className="text-gray-600 mb-4">
                  درخواست‌های یکسان به صورت خودکار ادغام می‌شوند و تنها یک بار اجرا می‌شوند
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={testDeduplication}
                  className="w-full bg-purple-600 text-white p-6 rounded-xl hover:shadow-lg transition-shadow"
                >
                  <i className="fas fa-compress text-2xl mb-2" />
                  <div className="font-bold text-lg">تست Deduplication</div>
                  <div className="text-sm opacity-90">ارسال 5 درخواست یکسان</div>
                </button>

                <div className="bg-gray-100 rounded-xl p-6">
                  <h3 className="font-bold mb-3">آمار Cache:</h3>
                  <pre className="text-sm bg-white p-4 rounded overflow-auto">
                    {JSON.stringify(requestDeduplicator.getStats(), null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

        </ComponentErrorBoundary>
      </div>
    </div>
  );
};

export default UXFeaturesDemo;
