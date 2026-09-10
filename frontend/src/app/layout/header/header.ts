import { Component, OnInit, inject, effect } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth';
import { LayoutService } from '../layout.service';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [
        CommonModule,
        InputTextModule,
        ButtonModule,
        AvatarModule,
        BadgeModule,
        MenuModule
    ],
    templateUrl: './header.html',
    styleUrl: './header.css'
})
export class HeaderComponent implements OnInit {
    pageTitle: string = 'Home';
    private routeTitle: string = 'Home';
    authService = inject(AuthService);
    private layoutService = inject(LayoutService);

    get displayName(): string {
        const user = this.authService.currentUser();
        if (!user) return 'User';
        return user.role === 'ar' ? 'Admin User' : 'Client User';
    }

    get avatarLabel(): string {
        const user = this.authService.currentUser();
        if (!user) return 'U';
        return user.role === 'ar' ? 'A' : 'C';
    }

    private titleEffect = effect(() => {
        const override = this.layoutService.pageTitleOverride();
        this.pageTitle = override ?? this.routeTitle;
    });

    userMenuItems: MenuItem[] = [
        {
            label: 'Profile',
            icon: 'pi pi-user'
        },
        {
            label: 'Settings',
            icon: 'pi pi-cog'
        },
        {
            separator: true
        },
        {
            label: 'Logout',
            icon: 'pi pi-sign-out',
            command: () => {
                this.authService.logout();
            }
        }
    ];

    constructor(private router: Router) { }

    ngOnInit() {
        // Update page title on route change
        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(() => {
                const currentRoute = this.router.routerState.root;
                let route = currentRoute;
                while (route.firstChild) {
                    route = route.firstChild;
                }
                this.routeTitle = route.snapshot.data['title'] || 'Home';
                if (!this.layoutService.pageTitleOverride()) {
                    this.pageTitle = this.routeTitle;
                }
            });

        // Set initial title
        const currentRoute = this.router.routerState.root;
        let route = currentRoute;
        while (route.firstChild) {
            route = route.firstChild;
        }
        this.routeTitle = route.snapshot.data['title'] || 'Home';
        this.pageTitle = this.routeTitle;
    }
}
