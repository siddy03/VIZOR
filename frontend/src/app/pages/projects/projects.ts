import { Component, signal, computed } from '@angular/core';
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
import { ProjectService, Project } from '../../services/project.service';
import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/breadcrumb/breadcrumb';
import { SharedDropdownComponent } from '../../shared/shared-dropdown/shared-dropdown';
import { Table1Component, Table1Column, Table1Action, Table1ActionEvent } from '../../shared/table1/table1';
import { SharedSearchbarComponent } from '../../shared/shared-searchbar/shared-searchbar';

@Component({
    selector: 'app-projects',
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
    templateUrl: './projects.html',
    styleUrls: ['./projects.css']
})
export class ProjectsComponent {
    breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Admin' },
        { label: 'Projects' }
    ];

    projectTypeOptions = [
        { label: 'All', value: 'All' },
        { label: 'Internal', value: 'Internal' },
        { label: 'External', value: 'External' },
        { label: 'Research', value: 'Research' }
    ];

    statusOptions = [
        { label: 'All', value: 'All' },
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' }
    ];

    projectColumns: Table1Column[] = [
        { field: 'name', header: 'Project Name', sortable: true },
        { field: 'clientsWithAccess', header: 'Client(s) With Access', sortable: true },
        { field: 'directors', header: 'Director(s)', sortable: true },
        { field: 'associates', header: 'Associate(s)', sortable: true },
        { field: 'projectType', header: 'Project Type', sortable: true },
        { field: 'status', header: 'Status', sortable: true }
    ];

    projectActions: Table1Action[] = [
        { id: 'edit', icon: 'icon-edit-svg', tooltip: 'Edit Project' }
    ];

    // Local reactive state via Angular Signals
    selectedProjectType = signal<string>('All');
    selectedStatus = signal<string>('All');
    searchTerm = signal<string>('');

    // Computed filtered projects — reactively derived from signals
    filteredProjects = computed(() => {
        let filtered = [...this.projectService.getProjects()];

        if (this.selectedProjectType() !== 'All') {
            filtered = filtered.filter(p => p.projectType === this.selectedProjectType());
        }

        if (this.selectedStatus() !== 'All') {
            filtered = filtered.filter(p => p.status === this.selectedStatus());
        }

        if (this.searchTerm().trim()) {
            const search = this.searchTerm().toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(search) ||
                p.directors.toLowerCase().includes(search) ||
                p.associates.toLowerCase().includes(search) ||
                p.clientsWithAccess.toLowerCase().includes(search)
            );
        }

        return filtered;
    });

    constructor(
        private router: Router,
        private projectService: ProjectService
    ) { }

    onActionClick(event: Table1ActionEvent) {
        if (event.actionId === 'edit') {
            this.editProject(event.row);
        }
    }

    editProject(project: Project) {
        this.router.navigate(['/admin/projects/edit', project.id]);
    }

    addNewProject() {
        this.router.navigate(['/admin/projects/add']);
    }
}
