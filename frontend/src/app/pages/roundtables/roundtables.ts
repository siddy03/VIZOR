import { Component, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

import { Router } from '@angular/router';

import { RoundtableService, Roundtable } from '../../services/roundtable.service';
import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/breadcrumb/breadcrumb';
import { SharedDropdownComponent } from '../../shared/shared-dropdown/shared-dropdown';
import { Table1Column, Table1Component } from '../../shared/table1/table1';
import { SharedSearchbarComponent } from '../../shared/shared-searchbar/shared-searchbar';

@Component({
    selector: 'app-roundtables',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        SelectModule,
        InputGroupModule,
        InputGroupAddonModule,
        FloatLabelModule,
        IconFieldModule,
        InputIconModule,
        BreadcrumbComponent,
        SharedDropdownComponent,
        Table1Component,
        SharedSearchbarComponent
    ],
    templateUrl: './roundtables.html',
    styleUrl: './roundtables.css'
})
export class RoundtablesComponent {
    breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Admin' },
        { label: 'Roundtables' }
    ];

    statusOptions = [
        { label: 'All', value: 'All' },
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' }
    ];

    roundtableColumns: Table1Column[] = [
        { field: 'name', header: 'Roundtable Name' },
        { field: 'clientsWithAccess', header: 'Client(s) With Access' },
        { field: 'directors', header: 'Director(s)' },
        { field: 'associates', header: 'Associate(s)' },
        { field: 'status', header: 'Status' }
    ];

    // Local reactive state via Angular Signals
    selectedStatus= signal<string>('All');
    searchText = signal<string>('');

    // Live announcement for screen readers (aria-live region)
    liveAnnouncement = signal<string>('');

    // Computed filtered roundtables — reactively derived from signals
    filteredRoundtables = computed(() => {
        let filtered = [...this.roundtableService.getRoundtables()];

        // Apply status filter
        if (this.selectedStatus() !== 'All') {
            filtered = filtered.filter(r => r.status === this.selectedStatus());
        }

        // Apply search filter
        if (this.searchText().trim()) {
            const search = this.searchText().toLowerCase();
            filtered = filtered.filter(r =>
                r.name.toLowerCase().includes(search) ||
                r.directors.toLowerCase().includes(search) ||
                r.associates.toLowerCase().includes(search)
            );
        }

        return filtered;
    });

    // Debounce timer for search announcements
    private announceTimer: any;

    constructor(
        private router: Router,
        private roundtableService: RoundtableService
    ) {
        // Effect to announce filtered results count to screen readers
        effect(() => {
            const count = this.filteredRoundtables().length;
            const status = this.selectedStatus();
            const search = this.searchText();

            // Build descriptive announcement
            let announcement = '';
            if (count === 0) {
                announcement = 'No roundtables found';
            } else if (count === 1) {
                announcement = '1 roundtable found';
            } else {
                announcement = `${count} roundtables found`;
            }

            if (status !== 'All') {
                announcement += `, filtered by ${status}`;
            }
            if (search.trim()) {
                announcement += `, searching for "${search}"`;
            }

            // Debounce the announcement to avoid rapid-fire updates while typing
            clearTimeout(this.announceTimer);
            this.announceTimer = setTimeout(() => {
                this.liveAnnouncement.set(announcement);
            }, 300);
        });
    }

    /** Handle status filter change with screen reader announcement */
    onStatusChange(newStatus: any) {
        this.selectedStatus.set(newStatus);
    }

    /** Handle search text change */
    onSearchChange(newText: string) {
        this.searchText.set(newText);
    }

    editRoundtable(roundtable: Roundtable) {
        this.router.navigate(['/admin/roundtables/edit', roundtable.id]);
    }

    deleteRoundtable(roundtable: Roundtable) {
        const confirmed = window.confirm(`Delete roundtable "${roundtable.name}"?`);
        if (confirmed) {
            console.log('Delete roundtable', roundtable);
        }
    }

    addNewRoundtable() {
        this.router.navigate(['/admin/roundtables/add']);
    }
}
