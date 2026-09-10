'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  toggleSidebar as toggleSidebarAction,
  setSidebarState as setSidebarStateAction,
  setTitle as setTitleAction,
} from '@/store/layoutSlice';

const LayoutContext = createContext(undefined);

export function LayoutProvider({ children }) {
  const dispatch = useAppDispatch();
  const sidebarCollapsed = useAppSelector((s) => s.layout.sidebarCollapsed);
  const title = useAppSelector((s) => s.layout.title);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [pageTitleOverride, setPageTitleOverride] = useState(null);

  const toggleSidebar = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setMobileSidebarOpen((v) => !v);
    } else {
      dispatch(toggleSidebarAction());
    }
  }, [dispatch]);

  const setSidebarState = useCallback(
    (collapsed) => {
      dispatch(setSidebarStateAction(collapsed));
    },
    [dispatch]
  );

  const openMobileSidebar = useCallback(() => setMobileSidebarOpen(true), []);
  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);
  const setTitle = useCallback((t) => dispatch(setTitleAction(t)), [dispatch]);

  const value = {
    sidebarCollapsed,
    mobileSidebarOpen,
    pageTitleOverride,
    title,
    toggleSidebar,
    setSidebarState,
    openMobileSidebar,
    closeMobileSidebar,
    setPageTitleOverride,
    setTitle,
  };

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return ctx;
}
