'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLayout } from '@/context/LayoutContext';
import './sidebar.css';

const surveyItems = [
  { label: 'Add Survey', route: '/surveys/add' },
  { label: 'Ad Hoc Survey Request', route: '/surveys/requests' },
  { label: 'View Survey', route: '/surveys/view' },
  { label: 'Manage Report Builder', route: '/surveys/report' },
  { label: 'Published Surveys', route: '/surveys/published' },
  { label: 'Modify Survey Response', route: '/surveys/modify' },
];

const adminItems = [
  { label: 'Users', route: '/admin/users' },
  { label: 'Projects', route: '/admin/projects' },
  { label: 'Roundtables', route: '/admin/roundtables' },
  { label: 'Clients', route: '/admin/clients' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const layout = useLayout();

  const [surveysExpanded, setSurveysExpanded] = useState(false);
  const [adminExpanded, setAdminExpanded] = useState(false);

  const collapsedIcon = layout.sidebarCollapsed && !layout.mobileSidebarOpen;

  const isActive = (route) => pathname === route || pathname.startsWith(route + '/');

  const navigate = (path) => {
    if (!path.startsWith('/surveys')) setSurveysExpanded(false);
    if (!path.startsWith('/admin')) setAdminExpanded(false);
    router.push(path);
    if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
      layout.closeMobileSidebar();
    }
  };

  const toggleSubmenu = (which) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 1024;
    const setExpanded = which === 'surveys' ? setSurveysExpanded : setAdminExpanded;
    if (isMobile && !layout.mobileSidebarOpen) {
      layout.openMobileSidebar();
      setExpanded(true);
    } else {
      setExpanded((v) => !v);
    }
  };

  const toggleSidebar = () => layout.toggleSidebar();

  // Arrow key navigation for menu items (WAI-ARIA menubar pattern)
  const onMenuKeyDown = (event) => {
    const target = event.target;
    const menuItems = Array.from(event.currentTarget.querySelectorAll('[role="menuitem"]'));
    const currentIndex = menuItems.indexOf(target);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        nextIndex = (currentIndex + 1) % menuItems.length;
        break;
      case 'ArrowUp':
        event.preventDefault();
        nextIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        nextIndex = menuItems.length - 1;
        break;
      default:
        return;
    }
    menuItems[nextIndex]?.focus();
  };

  const onKeyActivate = (e, fn) => {
    if (e.key === 'Enter') fn();
    if (e.key === ' ') {
      fn();
      e.preventDefault();
    }
  };

  return (
    <nav
      className={`sidebar-container${layout.sidebarCollapsed ? ' collapsed' : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Blue VIZOR Header */}
      <div className="sidebar-brand">
        <img
          src={collapsedIcon ? '/assets/images/vizor-logo-collapsed-top.svg' : '/assets/images/vizor-logo.png'}
          alt="VIZOR Home"
          className={collapsedIcon ? 'brand-logo-icon' : 'brand-logo-img'}
          onClick={() => (layout.sidebarCollapsed ? toggleSidebar() : null)}
        />
        <button
          type="button"
          className="hamburger-btn-a11y"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar navigation"
          aria-expanded={!layout.sidebarCollapsed}
        >
          <img src="/assets/images/toggle.svg" alt="" className="menu-icon-img" aria-hidden="true" />
        </button>
      </div>

      {/* Navigation Menu */}
      <div className="sidebar-nav">
        <ul className="menu-items" role="menubar" aria-label="Primary navigation" onKeyDown={onMenuKeyDown}>
          {/* Home */}
          <li
            className={`menu-item${isActive('/home') ? ' active' : ''}`}
            role="menuitem"
            tabIndex={0}
            aria-current={isActive('/home') ? 'page' : undefined}
            onClick={() => navigate('/home')}
            onKeyDown={(e) => onKeyActivate(e, () => navigate('/home'))}
            title="Home"
          >
            <i className="pi pi-home menu-icon" aria-hidden="true"></i>
            <span className="menu-label">Home</span>
          </li>

          {/* Surveys with Submenu */}
          <li className="menu-item-group" role="none">
            <div
              className={`menu-item${isActive('/surveys') ? ' active' : ''}`}
              role="menuitem"
              tabIndex={0}
              aria-current={isActive('/surveys') ? 'page' : undefined}
              aria-expanded={surveysExpanded}
              aria-haspopup="true"
              onClick={() => toggleSubmenu('surveys')}
              onKeyDown={(e) => onKeyActivate(e, () => toggleSubmenu('surveys'))}
              title="Surveys"
            >
              <i className="pi pi-file-edit menu-icon" aria-hidden="true"></i>
              <span className="menu-label">Surveys</span>
              <i
                className={`pi ${surveysExpanded ? 'pi-angle-down' : 'pi-angle-right'}`}
                style={{ marginLeft: 'auto' }}
                aria-hidden="true"
              ></i>
            </div>
            {surveysExpanded && (
              <ul className="submenu" role="menu" aria-label="Surveys submenu">
                {surveyItems.map((item) => (
                  <li
                    key={item.route}
                    className={`submenu-item${isActive(item.route) ? ' active' : ''}`}
                    role="menuitem"
                    tabIndex={0}
                    aria-current={isActive(item.route) ? 'page' : undefined}
                    onClick={() => navigate(item.route)}
                    onKeyDown={(e) => onKeyActivate(e, () => navigate(item.route))}
                    title={item.label}
                  >
                    {item.label}
                  </li>
                ))}
              </ul>
            )}
          </li>

          {/* Interactive Benchmarks */}
          <li
            className={`menu-item${isActive('/benchmarks') ? ' active' : ''}`}
            role="menuitem"
            tabIndex={0}
            aria-current={isActive('/benchmarks') ? 'page' : undefined}
            onClick={() => navigate('/benchmarks')}
            onKeyDown={(e) => onKeyActivate(e, () => navigate('/benchmarks'))}
            title="Interactive Benchmarks"
          >
            <i className="pi pi-chart-bar menu-icon" aria-hidden="true"></i>
            <span className="menu-label">Interactive Benchmarks</span>
            <i className="pi pi-angle-right" style={{ marginLeft: 'auto' }} aria-hidden="true"></i>
          </li>

          {/* Meetings (AR Only) */}
          {auth.isArUser && (
            <li
              className={`menu-item${isActive('/meetings') ? ' active' : ''}`}
              role="menuitem"
              tabIndex={0}
              aria-current={isActive('/meetings') ? 'page' : undefined}
              onClick={() => navigate('/meetings')}
              onKeyDown={(e) => onKeyActivate(e, () => navigate('/meetings'))}
              title="Meetings"
            >
              <i className="pi pi-users menu-icon" aria-hidden="true"></i>
              <span className="menu-label">Meetings</span>
              <i className="pi pi-angle-right" style={{ marginLeft: 'auto' }} aria-hidden="true"></i>
            </li>
          )}

          {/* Tools */}
          <li
            className={`menu-item${isActive('/tools') ? ' active' : ''}`}
            role="menuitem"
            tabIndex={0}
            aria-current={isActive('/tools') ? 'page' : undefined}
            onClick={() => navigate('/tools')}
            onKeyDown={(e) => onKeyActivate(e, () => navigate('/tools'))}
            title="Tools"
          >
            <i className="pi pi-wrench menu-icon" aria-hidden="true"></i>
            <span className="menu-label">Tools</span>
            <i className="pi pi-angle-right" style={{ marginLeft: 'auto' }} aria-hidden="true"></i>
          </li>

          {/* Admin with Submenu (AR Only) */}
          {auth.isArUser && (
            <li className="menu-item-group" role="none">
              <div
                className={`menu-item${isActive('/admin') ? ' active' : ''}`}
                role="menuitem"
                tabIndex={0}
                aria-current={isActive('/admin') ? 'page' : undefined}
                aria-expanded={adminExpanded}
                aria-haspopup="true"
                onClick={() => toggleSubmenu('admin')}
                onKeyDown={(e) => onKeyActivate(e, () => toggleSubmenu('admin'))}
                title="Admin"
              >
                <i className="pi pi-shield menu-icon" aria-hidden="true"></i>
                <span className="menu-label">Admin</span>
                <i
                  className={`pi ${adminExpanded ? 'pi-angle-down' : 'pi-angle-right'}`}
                  style={{ marginLeft: 'auto' }}
                  aria-hidden="true"
                ></i>
              </div>
              {adminExpanded && (
                <ul className="submenu" role="menu" aria-label="Admin submenu">
                  {adminItems.map((item) => (
                    <li
                      key={item.route}
                      className={`submenu-item${isActive(item.route) ? ' active' : ''}`}
                      role="menuitem"
                      tabIndex={0}
                      aria-current={isActive(item.route) ? 'page' : undefined}
                      onClick={() => navigate(item.route)}
                      onKeyDown={(e) => onKeyActivate(e, () => navigate(item.route))}
                      title={item.label}
                    >
                      {item.label}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )}

          {/* Auriemma Exchange (AR Only) */}
          {auth.isArUser && (
            <li
              className={`menu-item${isActive('/exchange') ? ' active' : ''}`}
              role="menuitem"
              tabIndex={0}
              aria-current={isActive('/exchange') ? 'page' : undefined}
              onClick={() => navigate('/exchange')}
              onKeyDown={(e) => onKeyActivate(e, () => navigate('/exchange'))}
              title="Auriemma Exchange"
            >
              <i className="pi pi-sync menu-icon" aria-hidden="true"></i>
              <span className="menu-label">Auriemma Exchange</span>
              <i className="pi pi-angle-right" style={{ marginLeft: 'auto' }} aria-hidden="true"></i>
            </li>
          )}

          {/* Discussion Board/Chat (AR Only) */}
          {auth.isArUser && (
            <li
              className={`menu-item${isActive('/community') ? ' active' : ''}`}
              role="menuitem"
              tabIndex={0}
              aria-current={isActive('/community') ? 'page' : undefined}
              onClick={() => navigate('/community')}
              onKeyDown={(e) => onKeyActivate(e, () => navigate('/community'))}
              title="Discussion Board/Chat"
            >
              <i className="pi pi-comments menu-icon" aria-hidden="true"></i>
              <span className="menu-label">Discussion Board/Chat</span>
            </li>
          )}

          {/* Help */}
          <li
            className={`menu-item${isActive('/help') ? ' active' : ''}`}
            role="menuitem"
            tabIndex={0}
            aria-current={isActive('/help') ? 'page' : undefined}
            onClick={() => navigate('/help')}
            onKeyDown={(e) => onKeyActivate(e, () => navigate('/help'))}
            title="Help"
          >
            <i className="pi pi-question-circle menu-icon" aria-hidden="true"></i>
            <span className="menu-label">Help</span>
            <i className="pi pi-angle-right" style={{ marginLeft: 'auto' }} aria-hidden="true"></i>
          </li>
        </ul>
      </div>

      {/* Roundtables Branding */}
      <div className="sidebar-footer" aria-hidden="true">
        <img
          src={collapsedIcon ? '/assets/images/ar-logo-collapsed-bottom.svg' : '/assets/images/ar-roundtables-logo.png'}
          alt="Auriemma Roundtables"
          className="footer-logo"
        />
      </div>
    </nav>
  );
}
