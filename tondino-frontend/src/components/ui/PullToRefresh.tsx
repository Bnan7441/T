/**
 * Pull to Refresh Component
 * 
 * Provides native-like pull-to-refresh UX for mobile devices
 * Features:
 * - Touch gesture detection
 * - Smooth animations
 * - Haptic feedback (where supported)
 * - Customizable thresholds
 * - Accessibility support
 */

import React, { useState, useRef, useCallback, ReactNode, useEffect } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
  pullDownThreshold?: number;
  maxPullDown?: number;
  refreshingContent?: ReactNode;
  pullingContent?: ReactNode;
  disabled?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  className = '',
  pullDownThreshold = 80,
  maxPullDown = 150,
  refreshingContent,
  pullingContent,
  disabled = false
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Trigger haptic feedback
  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing) return;

    const container = containerRef.current;
    if (!container) return;

    // Only start pull if at top of scroll
    if (container.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, [disabled, isRefreshing]);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing || !isPulling) return;

    const container = containerRef.current;
    if (!container || container.scrollTop > 0) {
      setIsPulling(false);
      setPullDistance(0);
      return;
    }

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;

    if (distance > 0) {
      e.preventDefault();
      
      // Apply resistance for smoother feel
      const resistance = 0.5;
      const adjustedDistance = Math.min(distance * resistance, maxPullDown);
      
      setPullDistance(adjustedDistance);

      // Haptic feedback at threshold
      if (adjustedDistance >= pullDownThreshold && pullDistance < pullDownThreshold) {
        triggerHaptic();
      }
    }
  }, [disabled, isRefreshing, isPulling, pullDownThreshold, maxPullDown, pullDistance, triggerHaptic]);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    if (disabled || isRefreshing || !isPulling) return;

    setIsPulling(false);

    if (pullDistance >= pullDownThreshold) {
      setIsRefreshing(true);
      triggerHaptic();
      
      onRefresh().finally(() => {
        setIsRefreshing(false);
        setPullDistance(0);
      });
    } else {
      setPullDistance(0);
    }
  }, [disabled, isRefreshing, isPulling, pullDistance, pullDownThreshold, onRefresh, triggerHaptic]);

  // Setup event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const progress = Math.min((pullDistance / pullDownThreshold) * 100, 100);
  const isAtThreshold = pullDistance >= pullDownThreshold;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      style={{ touchAction: isPulling ? 'none' : 'auto' }}
    >
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-transform"
        style={{
          transform: `translateY(${pullDistance - 60}px)`,
          height: '60px',
          opacity: pullDistance > 0 ? 1 : 0
        }}
      >
        {isRefreshing ? (
          refreshingContent || (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-600">در حال به‌روزرسانی...</span>
            </div>
          )
        ) : (
          pullingContent || (
            <div className="flex flex-col items-center gap-2">
              <div 
                className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center transition-transform"
                style={{
                  transform: `rotate(${progress * 1.8}deg)`,
                  borderColor: isAtThreshold ? '#2f6969' : '#cbd5e0'
                }}
              >
                <i className={`fas fa-arrow-down text-sm ${isAtThreshold ? 'text-brand-primary' : 'text-gray-400'}`} />
              </div>
              <span className="text-xs text-gray-500">
                {isAtThreshold ? 'رها کنید تا به‌روزرسانی شود' : 'برای به‌روزرسانی بکشید'}
              </span>
            </div>
          )
        )}
      </div>

      {/* Content */}
      <div
        style={{
          transform: isRefreshing ? 'translateY(60px)' : `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Simple pull-to-refresh hook for custom implementations
export function usePullToRefresh(
  onRefresh: () => Promise<void>,
  options: {
    threshold?: number;
    maxPullDown?: number;
    disabled?: boolean;
  } = {}
) {
  const {
    threshold = 80,
    maxPullDown = 150,
    disabled = false
  } = options;

  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    startY.current = e.touches[0].clientY;
  }, [disabled, isRefreshing]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;

    if (distance > 0) {
      const resistance = 0.5;
      const adjustedDistance = Math.min(distance * resistance, maxPullDown);
      setPullDistance(adjustedDistance);
    }
  }, [disabled, isRefreshing, maxPullDown]);

  const onTouchEnd = useCallback(() => {
    if (disabled || isRefreshing) return;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      onRefresh().finally(() => {
        setIsRefreshing(false);
        setPullDistance(0);
      });
    } else {
      setPullDistance(0);
    }
  }, [disabled, isRefreshing, pullDistance, threshold, onRefresh]);

  return {
    pullDistance,
    isRefreshing,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    progress: Math.min((pullDistance / threshold) * 100, 100)
  };
}
