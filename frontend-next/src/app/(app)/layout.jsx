'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useLayout } from '@/context/LayoutContext';
import { resolveRouteTitle } from '@/lib/routeTitles';

function Shell({ children }) {
  const {
    sidebarCollapsed,
    mobileSidebarOpen,
    setSidebarState,
    closeMobileSidebar,
    setTitle,
    setPageTitleOverride,
  } = useLayout();
  const pathname = usePathname();

  // Responsive sidebar handling (ports AppComponent.handleResize)
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 1024) {
        setSidebarState(true);
        closeMobileSidebar();
      } else {
        closeMobileSidebar();
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarState, closeMobileSidebar]);

  // Page title on route change (ports AppComponent.handleRouteChange)
  useEffect(() => {
    const title = resolveRouteTitle(pathname);
    setTitle(title);
    setPageTitleOverride(null);
    document.title = `${title} | VIZOR`;
  }, [pathname, setTitle, setPageTitleOverride]);

  return (
    <div className="app-container">
      {/* Skip link for keyboard / screen-reader users */}
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      {/* Mobile backdrop overlay */}
      <div
        className={`sidebar-backdrop${mobileSidebarOpen ? ' visible' : ''}`}
        onClick={closeMobileSidebar}
        role="presentation"
        aria-hidden="true"
      ></div>

      {/* Sidebar Navigation Landmark */}
      <aside
        className={`app-sidebar${sidebarCollapsed ? ' collapsed' : ''}${mobileSidebarOpen ? ' mobile-open' : ''}`}
        aria-label="Sidebar navigation"
      >
        <Sidebar />
      </aside>

      <div className={`app-main${sidebarCollapsed ? ' collapsed' : ''}`}>
        {/* Header Landmark */}
        <header className="app-header" role="banner" aria-label="Page header">
          <Header />
        </header>

        {/* Main Content Landmark */}
        <div className="app-content" role="main" id="main-content" tabIndex={-1} aria-label="Main content">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function AppLayout({ children }) {
  return (
    <AuthGuard>
      <Shell>{children}</Shell>
    </AuthGuard>
  );
}
