/**
 * Progressive Loading Components
 * 
 * Provides smooth progressive loading experiences with:
 * - Content placeholders
 * - Intersection observer for lazy loading
 * - Fade-in animations
 * - Accessibility support
 */

import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { Skeleton } from './LoadingStates';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  alt,
  className = '',
  placeholderClassName = '',
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const img = imgRef.current;
    
    if (img.complete && img.naturalHeight !== 0) {
      setIsLoaded(true);
      onLoad?.();
    }
  }, [onLoad]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <i className="fas fa-image text-gray-400 text-2xl" />
      </div>
    );
  }

  return (
    <div className="relative">
      {!isLoaded && (
        <Skeleton 
          variant="rectangular" 
          className={`absolute inset-0 ${placeholderClassName}`}
        />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
};

interface LazyLoadProps {
  children: ReactNode;
  placeholder?: ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  onVisible?: () => void;
}

export const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  placeholder,
  className = '',
  threshold = 0.1,
  rootMargin = '50px',
  onVisible
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            onVisible?.();
            observer.disconnect();
          }
        });
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, isVisible, onVisible]);

  return (
    <div ref={containerRef} className={className}>
      {isVisible ? children : (placeholder || <Skeleton className="w-full h-48" />)}
    </div>
  );
};

interface ProgressiveContentProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export const ProgressiveContent: React.FC<ProgressiveContentProps> = ({
  children,
  delay = 0,
  className = ''
}) => {
  const [isReady, setIsReady] = useState(delay === 0);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setIsReady(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  if (!isReady) return null;

  return (
    <div className={`animate-in fade-in duration-300 ${className}`}>
      {children}
    </div>
  );
};

interface ContentLoaderProps {
  isLoading: boolean;
  skeleton?: ReactNode;
  children: ReactNode;
  minLoadingTime?: number;
}

export const ContentLoader: React.FC<ContentLoaderProps> = ({
  isLoading,
  skeleton,
  children,
  minLoadingTime = 300
}) => {
  const [showContent, setShowContent] = useState(!isLoading);
  const loadStartTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!isLoading) {
      const elapsed = Date.now() - loadStartTimeRef.current;
      const remainingTime = Math.max(0, minLoadingTime - elapsed);

      setTimeout(() => {
        setShowContent(true);
      }, remainingTime);
    } else {
      loadStartTimeRef.current = Date.now();
      setShowContent(false);
    }
  }, [isLoading, minLoadingTime]);

  if (!showContent) {
    return <>{skeleton || <Skeleton className="w-full h-48" />}</>;
  }

  return <div className="animate-in fade-in duration-300">{children}</div>;
};
