'use client';

import type React from 'react';

import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/navigation/sidebar';
import MobileNav from '@/components/navigation/mobile-nav';
import { useMediaQuery } from '@/hooks/use-media-query';

// Key for storing sidebar state in localStorage
const SIDEBAR_STATE_KEY = 'sidebar-open-state';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use a ref to track if this is the initial render
  const isFirstRender = useRef(true);

  // Initialize state with a function to avoid the initial flash
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem(SIDEBAR_STATE_KEY);
      return savedState === null ? true : savedState === 'true';
    }
    return true;
  });

  const isMobile = useMediaQuery('(max-width: 768px)');

  // This effect runs once after the component mounts
  useEffect(() => {
    // Skip the first render since we've already initialized from localStorage
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // After that, any state changes should be saved to localStorage
    localStorage.setItem(SIDEBAR_STATE_KEY, sidebarOpen.toString());
  }, [sidebarOpen]);

  // Custom setter function that only updates the state (no animation on page load)
  const handleSetSidebarOpen = (state: boolean) => {
    setSidebarOpen(state);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {!isMobile && (
        <div
          className={`fixed left-0 top-0 z-40 h-screen transition-none ${
            sidebarOpen ? 'w-64' : 'w-16'
          }`}
        >
          <Sidebar open={sidebarOpen} setOpen={handleSetSidebarOpen} />
        </div>
      )}
      <main
        className={`flex-1 ${
          !isMobile ? (sidebarOpen ? 'ml-64' : 'ml-16') : 'ml-0'
        } transition-none`}
      >
        <div className="container mx-auto max-w-4xl px-4 py-4">{children}</div>
      </main>

      {isMobile && <MobileNav />}
    </div>
  );
}
