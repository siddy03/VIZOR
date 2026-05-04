import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';

import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/breadcrumb/breadcrumb';
import { SharedDropdownComponent } from '../../shared/shared-dropdown/shared-dropdown';
import { Table1Component, Table1Column, Table1Action, Table1ActionEvent } from '../../shared/table1/table1';
import { SharedSearchbarComponent } from '../../shared/shared-searchbar/shared-searchbar';

@Component({
    selector: 'app-users',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        SelectModule,
        BadgeModule,
        RippleModule,
        BreadcrumbComponent,
        SharedDropdownComponent,
        Table1Component,
        SharedSearchbarComponent
    ],
    templateUrl: './users.html',
    styleUrls: ['./users.css']
})
export class UsersComponent {
    breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Admin' },
        { label: 'Users' }
    ];

    // Filter State
    selectedStatus: string = 'active'; // Default to active (lowercase)
    statusOptions = [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'All', value: 'all' }
    ];

    // Search State
    searchTerm: string = '';
    requestSearchTerm: string = '';

    allUsers: any[] = [];
    users: any[] = []; // Filtered users displayed in table

    activeTab: string = 'users';
    allUserRequests: any[] = [];
    userRequests: any[] = []; // Filtered requests displayed in table

    // Request Filter State
    selectedRoundtable: any = null; // Placeholder for now
    roundtableOptions: any[] = [
        { label: 'All Roundtables', value: null },
        { label: 'RONE', value: 'RONE' },
        { label: 'RTHIRD', value: 'RTHIRD' }
    ];

    selectedClient: any = null;
    clientOptions = [
        { label: 'All Clients', value: null },
        { label: 'c3', value: 'c3' },
        { label: 'c1', value: 'c1' },
        { label: 'c2', value: 'c2' }
    ];

    // Table Configurations
    usersColumns: Table1Column[] = [
        { field: 'email', header: 'Email', sortable: true },
        { field: 'firstName', header: 'First Name', sortable: true },
        { field: 'lastName', header: 'Last Name', sortable: true },
        { field: 'role', header: 'Role', sortable: true },
        { field: 'roundtables', header: 'Roundtable(s)', sortable: true },
        { field: 'client', header: 'Client', sortable: true },
        { field: 'status', header: 'Status', sortable: true, type: 'status' },
        { field: 'lastLoggedIn', header: 'Last Logged In', sortable: true }
    ];

    usersActions: Table1Action[] = [
        { id: 'mimic', icon: 'pi pi-shield', tooltip: 'Mimic', cssClass: 'btn-mimic' },
        { id: 'transfer', icon: 'pi pi-sitemap', tooltip: 'Transfer', cssClass: 'btn-transfer' },
        { id: 'resend', icon: 'pi pi-envelope', tooltip: 'Resend Invite', cssClass: 'btn-resend' },
        { id: 'edit', icon: 'icon-edit-svg', tooltip: 'Edit', cssClass: 'btn-edit' }
    ];

    requestsColumns: Table1Column[] = [
        { field: 'status', header: 'Request Status', sortable: true, type: 'status' },
        { field: 'email', header: 'Email', sortable: true },
        { field: 'firstName', header: 'First Name', sortable: true },
        { field: 'lastName', header: 'Last Name', sortable: true },
        { field: 'client', header: 'Client', sortable: true },
        { field: 'roundtables', header: 'Roundtable(s)', sortable: true },
        { field: 'requestedBy', header: 'Requested By', sortable: true }
    ];

    requestsActions: Table1Action[] = [
        { id: 'view', icon: 'pi pi-eye', tooltip: 'View', cssClass: 'btn-transfer' }
    ];

    constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private router: Router) { }

    ngOnInit() {
        this.fetchUsers();
        this.fetchUserRequests();
    }

    fetchUsers() {
        this.http.get<any>('/assets/users-data.json').subscribe({
            next: (response) => {
                if (response.success && response.data && response.data.records) {
                    this.allUsers = response.data.records.map((record: any) => ({
                        id: record.userId,
                        email: record.email,
                        firstName: record.firstName,
                        lastName: record.lastName,
                        role: record.roleName,
                        roundtables: record.abbrList ? record.abbrList.join(', ') : '',
                        client: record.clientName,
                        status: record.isActive ? 'Active' : 'Inactive',
                        lastLoggedIn: record.lastAccessed ? new Date(record.lastAccessed).toLocaleString() : ''
                    }));
                    this.applyFilters();
                    this.cdr.detectChanges();
                }
            },
            error: (err) => {
                console.error('UsersComponent: Error loading users:', err);
            }
        });
    }

    fetchUserRequests() {
        this.http.get<any>('/assets/user-requests-data.json').subscribe({
            next: (response) => {
                if (response.success && response.data && response.data.records) {
                    this.allUserRequests = response.data.records.map((record: any) => ({
                        id: record.userId,
                        email: record.email,
                        firstName: record.firstName,
                        lastName: record.lastName,
                        role: record.roleName,
                        roundtables: record.abbrList ? record.abbrList.join(', ') : '',
                        client: record.clientName,
                        status: record.status, // "Requested"
                        requestedBy: record.requestedBy,
                        requestStatus: record.requesteStatus
                    }));
                    this.applyRequestFilters();
                    this.cdr.detectChanges();
                }
            },
            error: (err) => {
                console.error('UsersComponent: Error loading user requests:', err);
            }
        });
    }

    setActiveTab(tab: string) {
        this.activeTab = tab;
    }

    onStatusChange() {
        this.applyFilters();
    }

    onRequestFilterChange() {
        this.applyRequestFilters();
    }

    applyFilters() {
        let filtered = [...this.allUsers];

        // 1. Status Filter
        if (this.selectedStatus !== 'all') {
            filtered = filtered.filter(user =>
                user.status.toLowerCase() === this.selectedStatus.toLowerCase()
            );
        }

        // 2. Search Filter
        if (this.searchTerm && this.searchTerm.trim() !== '') {
            const term = this.searchTerm.toLowerCase().trim();
            filtered = filtered.filter(user =>
                (user.firstName && user.firstName.toLowerCase().includes(term)) ||
                (user.lastName && user.lastName.toLowerCase().includes(term)) ||
                (user.email && user.email.toLowerCase().includes(term)) ||
                (user.role && user.role.toLowerCase().includes(term)) ||
                (user.client && user.client.toLowerCase().includes(term)) ||
                (user.roundtables && user.roundtables.toLowerCase().includes(term))
            );
        }

        this.users = filtered;
    }

    applyRequestFilters() {
        let filtered = [...this.allUserRequests];

        // 1. Dropdown Filters
        if (this.selectedRoundtable) {
            filtered = filtered.filter(req => req.roundtables && req.roundtables.includes(this.selectedRoundtable));
        }
        if (this.selectedClient) {
            filtered = filtered.filter(req => req.client === this.selectedClient);
        }

        // 2. Search Filter
        if (this.requestSearchTerm && this.requestSearchTerm.trim() !== '') {
            const term = this.requestSearchTerm.toLowerCase().trim();
            filtered = filtered.filter(req =>
                (req.firstName && req.firstName.toLowerCase().includes(term)) ||
                (req.lastName && req.lastName.toLowerCase().includes(term)) ||
                (req.email && req.email.toLowerCase().includes(term)) ||
                (req.client && req.client.toLowerCase().includes(term)) ||
                (req.roundtables && req.roundtables.toLowerCase().includes(term)) ||
                (req.requestedBy && req.requestedBy.toLowerCase().includes(term))
            );
        }

        this.userRequests = filtered;
    }

    navigateToAddUser() {
        this.router.navigate(['admin/users/add']);
    }

    onUserActionClick(event: Table1ActionEvent) {
        console.log(`Action ${event.actionId} clicked for user`, event.row);
        if (event.actionId === 'edit') {
            // Handle edit action
        }
    }

    onRequestActionClick(event: Table1ActionEvent) {
        console.log(`Action ${event.actionId} clicked for request`, event.row);
        if (event.actionId === 'view') {
            // Handle view action
        }
    }
}
