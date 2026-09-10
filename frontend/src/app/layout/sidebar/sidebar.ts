import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { Subscription, filter } from 'rxjs';
import { LayoutService } from '../layout.service';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, PanelMenuModule, ButtonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent implements OnInit, OnDestroy {
  layoutService = inject(LayoutService);
  authService = inject(AuthService);
  currentRoute: string = '';
  private routerSubscription?: Subscription;

  menuItems = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      route: '/home'
    },
    {
      label: 'Surveys',
      icon: 'pi pi-file-edit',
      route: '/surveys',
      expanded: false,
      items: [
        { label: 'Add Survey', route: '/surveys/add' },
        { label: 'Ad Hoc Survey Request', route: '/surveys/requests' },
        { label: 'View Survey', route: '/surveys/view' },
        { label: 'Manage Report Builder', route: '/surveys/report' },
        { label: 'Published Surveys', route: '/surveys/published' },
        { label: 'Modify Survey Response', route: '/surveys/modify' }
      ]
    },
    {
      label: 'Interactive Benchmarks',
      icon: 'pi pi-chart-bar',
      route: '/benchmarks'
    },
    {
      label: 'Meetings',
      icon: 'pi pi-users',
      route: '/meetings'
    },
    {
      label: 'Tools',
      icon: 'pi pi-wrench',
      route: '/tools'
    },
    {
      label: 'Admin',
      icon: 'pi pi-shield',
      route: '/admin',
      expanded: false,
      items: [
        { label: 'Users', route: '/admin/users' },
        { label: 'Projects', route: '/admin/projects' },
        { label: 'Roundtables', route: '/admin/roundtables' },
        { label: 'Clients', route: '/admin/clients' }
      ]
    },
    {
      label: 'Auriemma Exchange',
      icon: 'pi pi-sync',
      route: '/exchange'
    },
    {
      label: 'Community',
      icon: 'pi pi-comments',
      route: '/community'
    }
  ];

  constructor(private router: Router) { }

  ngOnInit() {
    // Set initial route
    this.currentRoute = this.router.url;

    // Subscribe to route changes
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.url;
      });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  isActive(route: string): boolean {
    return this.currentRoute === route || this.currentRoute.startsWith(route + '/');
  }

  navigate(path: string) {
    if (!path.startsWith('/surveys')) {
      this.menuItems[1].expanded = false;
    }
    if (!path.startsWith('/admin')) {
      this.menuItems[5].expanded = false;
    }
    this.router.navigate([path]);

    if (window.innerWidth <= 1024) {
      this.layoutService.closeMobileSidebar();
    }
  }

  onMenuItemClick(item: any) {
    // If item has a submenu, toggle the submenu
    if (item.items) {
      this.toggleSubmenu(item);
      return;
    }
    // Otherwise, navigate
    this.navigate(item.route);
  }

  toggleSubmenu(item: any) {
    const isMobile = window.innerWidth <= 1024;
    if (isMobile && !this.layoutService.mobileSidebarOpen()) {

      this.layoutService.openMobileSidebar();
      item.expanded = true;
    } else {
      item.expanded = !item.expanded;
    }
  }

  toggleSidebar() {
    this.layoutService.toggleSidebar();
  }

  /** Arrow key navigation for menu items (WAI-ARIA menubar pattern) */
  onMenuKeyDown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    const menuItems = Array.from(
      (event.currentTarget as HTMLElement).querySelectorAll('[role="menuitem"]')
    ) as HTMLElement[];
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
  }
}
