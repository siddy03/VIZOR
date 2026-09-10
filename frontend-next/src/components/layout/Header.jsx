'use client';

import { useRef } from 'react';
import { Menu } from 'primereact/menu';
import { Avatar } from 'primereact/avatar';
import { useAuth } from '@/context/AuthContext';
import { useLayout } from '@/context/LayoutContext';
import './header.css';

export function Header() {
  const auth = useAuth();
  const layout = useLayout();
  const menuRef = useRef(null);

  const user = auth.currentUser;
  const displayName = !user ? 'User' : user.role === 'ar' ? 'Admin User' : 'Client User';
  const avatarLabel = !user ? 'U' : user.role === 'ar' ? 'A' : 'C';

  const pageTitle = layout.pageTitleOverride ?? layout.title;

  const userMenuItems = [
    { label: 'Profile', icon: 'pi pi-user' },
    { label: 'Settings', icon: 'pi pi-cog' },
    { separator: true },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => auth.logout(),
    },
  ];

  return (
    <div className="header-container" role="toolbar" aria-label="Page header toolbar">
      <h1 className="page-title" id="page-heading">
        {pageTitle}
      </h1>

      <div className="header-actions">
        <div className="search-wrapper" role="search" aria-label="Global search">
          <label htmlFor="global-search" className="sr-only">
            Global search
          </label>
          <i className="pi pi-search search-icon" aria-hidden="true"></i>
          <input
            id="global-search"
            type="text"
            placeholder="Search"
            className="search-input-field p-inputtext"
            aria-label="Global search"
          />
        </div>

        <button className="p-button p-button-text notification-btn" aria-label="Notifications" title="Notifications" type="button">
          <i className="pi pi-bell" aria-hidden="true"></i>
          <span className="notification-dot" aria-hidden="true"></span>
          <span className="sr-only">You have new notifications</span>
        </button>

        <div
          className="user-section"
          onClick={(e) => menuRef.current?.toggle(e)}
          role="button"
          tabIndex={0}
          aria-haspopup="true"
          aria-label={`User menu, ${displayName}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter') menuRef.current?.toggle(e);
            if (e.key === ' ') {
              menuRef.current?.toggle(e);
              e.preventDefault();
            }
          }}
        >
          <Avatar label={avatarLabel} shape="circle" className="user-avatar" aria-hidden="true" />
          <span className="user-name">{displayName}</span>
        </div>

        <Menu
          ref={menuRef}
          popup
          model={userMenuItems}
          appendTo={typeof document !== 'undefined' ? document.body : undefined}
          baseZIndex={2000}
          className="user-overlay-menu"
          aria-label="User menu"
        />
      </div>
    </div>
  );
}
