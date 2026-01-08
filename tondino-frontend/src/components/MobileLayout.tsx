import React from 'react';

interface MobileLayoutProps {
  children: React.ReactNode;
  fullScreen?: boolean;
}

/**
 * MobileLayout Wrapper Component
 *
 * Adds mobile-specific bottom padding to account for the fixed bottom navigation bar.
 * Respects safe-area-inset-bottom for devices with notches/home indicators (iPhone X+).
 *
 * @param children - Content to wrap
 * @param fullScreen - If true, disables padding (for full-screen pages like LessonView)
 */
const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  fullScreen = false
}) => {
  // Full-screen pages (e.g., LessonView) manage their own layout
  if (fullScreen) {
    return <>{children}</>;
  }

  // Mobile screens (below lg breakpoint): Add bottom padding for nav bar + safe area
  // Desktop screens (lg and above): No padding needed
  return (
    <div
      className="lg:pb-0 pb-[calc(4rem+env(safe-area-inset-bottom))] backdrop-blur-sm animate-fade-in"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {children}
    </div>
  );
};

export default MobileLayout;
