/**
 * Accessibility Utilities
 *
 * Provides utilities for ARIA labels, keyboard navigation, screen reader support,
 * and other accessibility enhancements following WCAG 2.1 guidelines.
 */

import React, { useEffect, useRef } from 'react';

// ARIA live region utilities
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('class', 'sr-only');
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Focus management utilities
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }

      if (e.key === 'Escape') {
        // Find and click the close button or trigger close action
        const closeButton = container.querySelector('[data-close-modal]') as HTMLElement;
        if (closeButton) {
          closeButton.click();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Focus first element when trap activates
    if (firstElement) {
      firstElement.focus();
    }

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);

  return containerRef;
};

// Form field accessibility helpers
export const getFieldErrorId = (fieldName: string) => `${fieldName}-error`;

export const getFieldDescribedBy = (fieldName: string, hasError: boolean, hasHelp?: boolean) => {
  const ids: string[] = [];
  if (hasError) ids.push(getFieldErrorId(fieldName));
  if (hasHelp) ids.push(`${fieldName}-help`);
  return ids.length > 0 ? ids.join(' ') : undefined;
};

// Color contrast utilities
export const getContrastColor = (backgroundColor: string): 'white' | 'black' => {
  // Simple contrast calculation - in production, use a proper color library
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? 'black' : 'white';
};

// Reduced motion utilities
export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const useReducedMotion = () => {
  const [prefersReduced, setPrefersReduced] = React.useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReduced;
};

// Touch target size validation (minimum 44x44px for iOS/Android)
export const validateTouchTarget = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  return rect.width >= 44 && rect.height >= 44;
};

// Keyboard navigation helpers
export const useKeyboardNavigation = (
  items: any[],
  onSelect: (item: any) => void,
  loop: boolean = true
) => {
  const [focusedIndex, setFocusedIndex] = React.useState(-1);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev =>
          loop ? (prev + 1) % items.length : Math.min(prev + 1, items.length - 1)
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev =>
          loop ? (prev - 1 + items.length) % items.length : Math.max(prev - 1, 0)
        );
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < items.length) {
          onSelect(items[focusedIndex]);
        }
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(items.length - 1);
        break;
    }
  };

  return { focusedIndex, handleKeyDown };
};