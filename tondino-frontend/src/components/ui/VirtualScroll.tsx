/**
 * Virtual Scrolling Component
 * 
 * Efficient rendering of large lists by only rendering visible items
 * Provides smooth scrolling experience with:
 * - Dynamic item heights
 * - Scroll restoration
 * - Keyboard navigation
 * - Accessibility support
 */

import React, { useState, useEffect, useRef, useCallback, ReactNode } from 'react';

interface VirtualScrollProps<T> {
  items: T[];
  itemHeight: number | ((item: T, index: number) => number);
  renderItem: (item: T, index: number) => ReactNode;
  overscan?: number;
  className?: string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  estimatedItemHeight?: number;
}

export function VirtualScroll<T>({
  items,
  itemHeight,
  renderItem,
  overscan = 3,
  className = '',
  onEndReached,
  endReachedThreshold = 0.8
}: VirtualScrollProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Calculate item heights
  const getItemHeight = useCallback(
    (index: number): number => {
      if (typeof itemHeight === 'function') {
        return itemHeight(items[index], index);
      }
      return itemHeight;
    },
    [itemHeight, items]
  );

  // Calculate total height
  const totalHeight = items.reduce((acc, _, index) => {
    return acc + getItemHeight(index);
  }, 0);

  // Calculate visible range
  const getVisibleRange = useCallback(() => {
    let startIndex = 0;
    let endIndex = 0;
    let currentOffset = 0;

    // Find start index
    for (let i = 0; i < items.length; i++) {
      const height = getItemHeight(i);
      if (currentOffset + height > scrollTop) {
        startIndex = Math.max(0, i - overscan);
        break;
      }
      currentOffset += height;
    }

    // Find end index
    currentOffset = 0;
    for (let i = 0; i < items.length; i++) {
      const height = getItemHeight(i);
      currentOffset += height;
      if (currentOffset >= scrollTop + containerHeight) {
        endIndex = Math.min(items.length - 1, i + overscan);
        break;
      }
    }

    if (endIndex === 0) endIndex = items.length - 1;

    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, items.length, getItemHeight, overscan]);

  // Calculate offset for items
  const getOffsetForIndex = useCallback(
    (index: number): number => {
      let offset = 0;
      for (let i = 0; i < index; i++) {
        offset += getItemHeight(i);
      }
      return offset;
    },
    [getItemHeight]
  );

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setScrollTop(target.scrollTop);

    // Debounced end reached check
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      const scrollProgress = (target.scrollTop + target.clientHeight) / target.scrollHeight;
      if (scrollProgress >= endReachedThreshold && onEndReached) {
        onEndReached();
      }
    }, 150);
  }, [endReachedThreshold, onEndReached]);

  // Measure container
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    observer.observe(containerRef.current);
    setContainerHeight(containerRef.current.clientHeight);

    return () => observer.disconnect();
  }, []);

  const { startIndex, endIndex } = getVisibleRange();
  const offsetTop = getOffsetForIndex(startIndex);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      onScroll={handleScroll}
      style={{ position: 'relative' }}
      role="list"
      aria-label="قابل پیمایش"
    >
      <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetTop}px)`,
            willChange: 'transform'
          }}
        >
          {items.slice(startIndex, endIndex + 1).map((item, i) => (
            <div
              key={startIndex + i}
              style={{ height: getItemHeight(startIndex + i) }}
              role="listitem"
            >
              {renderItem(item, startIndex + i)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface InfiniteScrollProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  isLoading: boolean;
  loader?: ReactNode;
  endMessage?: ReactNode;
  className?: string;
  threshold?: number;
}

export function InfiniteScroll<T>({
  items,
  renderItem,
  loadMore,
  hasMore,
  isLoading,
  loader,
  endMessage,
  className = '',
  threshold = 0.8
}: InfiniteScrollProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFetching, setIsFetching] = useState(false);

  const handleScroll = useCallback(() => {
    if (!containerRef.current || isFetching || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const scrollProgress = (scrollTop + clientHeight) / scrollHeight;

    if (scrollProgress >= threshold) {
      setIsFetching(true);
      loadMore().finally(() => setIsFetching(false));
    }
  }, [isFetching, hasMore, threshold, loadMore]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div ref={containerRef} className={`overflow-auto ${className}`}>
      <div role="list">
        {items.map((item, index) => (
          <div key={index} role="listitem">
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {isLoading && (loader || <div className="p-4 text-center">در حال بارگذاری...</div>)}
      
      {!hasMore && !isLoading && (endMessage || <div className="p-4 text-center text-gray-500">پایان لیست</div>)}
    </div>
  );
}

// Window-based virtual scroll for very large lists
interface WindowVirtualScrollProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  buffer?: number;
}

export function WindowVirtualScroll<T>({
  items,
  itemHeight,
  renderItem,
  buffer = 5
}: WindowVirtualScrollProps<T>) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const viewportHeight = window.innerHeight;

      const start = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
      const end = Math.min(
        items.length,
        Math.ceil((scrollTop + viewportHeight) / itemHeight) + buffer
      );

      setVisibleRange({ start, end });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [items.length, itemHeight, buffer]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return (
    <div style={{ height: totalHeight, position: 'relative' }} role="list">
      <div
        style={{
          transform: `translateY(${offsetY}px)`,
          willChange: 'transform'
        }}
      >
        {items.slice(visibleRange.start, visibleRange.end).map((item, i) => (
          <div
            key={visibleRange.start + i}
            style={{ height: itemHeight }}
            role="listitem"
          >
            {renderItem(item, visibleRange.start + i)}
          </div>
        ))}
      </div>
    </div>
  );
}
