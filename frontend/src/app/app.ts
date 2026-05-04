import { Component, inject, OnInit, HostListener, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CommonModule, DOCUMENT } from '@angular/common';
import { filter, map } from 'rxjs/operators';
import { SidebarComponent } from './layout/sidebar/sidebar';
import { HeaderComponent } from './layout/header/header';
import { ToastModule } from 'primeng/toast';
import { LayoutService } from './layout/layout.service';
import { LiveAnnouncerService } from './services/live-announcer.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent, ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  layoutService = inject(LayoutService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  private announcer = inject(LiveAnnouncerService);
  private document = inject(DOCUMENT);

  isLoginPage = signal(false);

  ngOnInit() {
    this.handleResize();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => event as NavigationEnd)
    ).subscribe((event) => {
      this.isLoginPage.set(event.url === '/login' || event.url === '/');
      this.handleRouteChange(event.url);
    });
  }

  private handleRouteChange(url: string): void {
    const title = this.resolveRouteTitle();
    if (title) {
      this.titleService.setTitle(`${title} | VIZOR`);
      this.announcer.announce(`Navigated to ${title}`);
    }

    if (this.isLoginPage()) return;

    this.document.defaultView?.requestAnimationFrame(() => {
      const main = this.document.getElementById('main-content');
      if (main && this.document.activeElement?.tagName !== 'INPUT') {
        main.focus({ preventScroll: false });
      }
    });
  }

  private resolveRouteTitle(): string | null {
    let route = this.route.snapshot;
    while (route.firstChild) route = route.firstChild;
    return route.title ?? route.data?.['title'] ?? null;
  }
  
  @HostListener('window:resize')
  onResize() {
    this.handleResize();
  }

  private handleResize() {
    const width = window.innerWidth;
    if (width <= 768) {

      this.layoutService.setSidebarState(true);
      this.layoutService.closeMobileSidebar();
    } else if (width <= 1024) {

      this.layoutService.setSidebarState(true);
      this.layoutService.closeMobileSidebar();
    } else {

      this.layoutService.closeMobileSidebar();
    }
  }
}
