import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';

import { ClientService, Client } from '../../services/client.service';
import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/breadcrumb/breadcrumb';
import { SharedDropdownComponent } from '../../shared/shared-dropdown/shared-dropdown';
import { SharedSearchbarComponent } from '../../shared/shared-searchbar/shared-searchbar';
import { Table1Component, Table1Column, Table1Action, Table1ActionEvent } from '../../shared/table1/table1';

@Component({
    selector: 'app-clients',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        BreadcrumbComponent,
        SharedDropdownComponent,
        SharedSearchbarComponent,
        Table1Component
    ],
    templateUrl: './clients.html',
    styleUrls: ['./clients.css']
})
export class ClientsComponent implements OnInit {
    breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Admin' },
        { label: 'Clients' }
    ];

    statusOptions = [
        { label: 'All', value: 'All' },
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' }
    ];

    clientColumns: Table1Column[] = [
        { field: 'name', header: 'Client Name', sortable: true },
        { field: 'parentClient', header: 'Parent Client', sortable: true },
        { field: 'status', header: 'Status', sortable: true }
    ];

    clientActions: Table1Action[] = [
        { id: 'edit', icon: 'icon-edit-svg', tooltip: 'Edit', cssClass: 'p-button-secondary' },
        { id: 'delete', icon: 'pi pi-trash', tooltip: 'Delete', cssClass: 'p-button-danger' }
    ];

    // State Signals
    searchTerm = signal('');
    selectedStatus = signal<string>('Active');
    selectedParentClient = signal<string>('All');
    clients = signal<Client[]>([]);

    private clientService = inject(ClientService);
    private router = inject(Router);

    ngOnInit() {
        this.clientService.loadClients();
        this.clientService.clients$.subscribe(clients => {
            this.clients.set(clients || []);
        });
    }

    // Dynamic dropdown options based on current clients
    parentClientOptions = computed(() => {
        const parents = new Set<string>();
        this.clients().forEach(c => {
            if (c.parentClient && c.parentClient !== '-') {
                parents.add(c.parentClient);
            }
        });
        return [
            { label: 'All', value: 'All' },
            ...Array.from(parents).map(p => ({ label: p, value: p }))
        ];
    });

    filteredClients = computed(() => {
        let result = this.clients();

        // Status Filter
        const status = this.selectedStatus();
        if (status !== 'All') {
            result = result.filter(c => c.status === status);
        }

        // Parent Client Filter
        const parent = this.selectedParentClient();
        if (parent !== 'All') {
            result = result.filter(c => c.parentClient === parent);
        }

        // Search Filter (by Name or Parent Client)
        const term = this.searchTerm().toLowerCase();
        if (term) {
            result = result.filter(c => 
                (c.name && c.name.toLowerCase().includes(term)) || 
                (c.parentClient && c.parentClient.toLowerCase().includes(term))
            );
        }

        return result;
    });

    navigateToAddClient() {
        this.router.navigate(['/admin/clients/add']);
    }

    onActionClick(event: Table1ActionEvent) {
        if (event.actionId === 'edit') {
            this.router.navigate(['/admin/clients/edit', event.row.id]);
        } else if (event.actionId === 'delete') {
            const confirmed = window.confirm(`Delete client "${event.row.name}"?`);
            if (confirmed) {
                this.clientService.deleteClient(event.row.id);
            }
        }
    }
}
