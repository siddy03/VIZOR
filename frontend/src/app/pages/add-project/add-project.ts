import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { ProjectService, Project } from '../../services/project.service';
import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/breadcrumb/breadcrumb';
import { SharedDropdownComponent } from '../../shared/shared-dropdown/shared-dropdown';

@Component({
    selector: 'app-add-project',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        SelectModule,
        MultiSelectModule,
        CheckboxModule,
        DialogModule,
        BreadcrumbComponent,
        SharedDropdownComponent
    ],
    templateUrl: './add-project.html',
    styleUrls: ['./add-project.css']
})
export class AddProjectComponent implements OnInit {
    breadcrumbItems = computed<BreadcrumbItem[]>(() => [
        { label: 'Admin' },
        { label: 'Projects', isLink: true },
        { label: this.isEditMode() ? 'Modify Project' : 'Add New Project' }
    ]);

    // Local reactive state via Angular Signals
    projectName = signal<string>('');
    projectAbbreviation = signal<string>('');
    selectedProjectType = signal<any>(null);
    selectedClients = signal<any[]>([]);
    selectedDirectors = signal<any[]>([]);
    primaryDirector = signal<any>(null);
    selectedAssociates = signal<any[]>([]);
    primaryAssociate = signal<any>(null);
    description = signal<string>('');
    isActive = signal<boolean>(true);
    showCancelDialog = signal<boolean>(false);
    submitted = signal<boolean>(false);

    isEditMode = signal<boolean>(false);
    projectId = signal<number | null>(null);

    // Dropdown options (static, no need for signals)
    projectTypeOptions: any[] = [
        { label: 'Internal', value: 'Internal' },
        { label: 'External', value: 'External' },
        { label: 'Research', value: 'Research' }
    ];

    clientOptions: any[] = [
        { label: 'Client A', value: 'client_a' },
        { label: 'Client B', value: 'client_b' },
        { label: 'Client C', value: 'client_c' },
        { label: 'Client D', value: 'client_d' },
        { label: 'Client E', value: 'client_e' }
    ];

    directorOptions: any[] = [
        { label: 'Director A', value: 'director_a' },
        { label: 'Director B', value: 'director_b' },
        { label: 'Director C', value: 'director_c' },
        { label: 'Director D', value: 'director_d' },
        { label: 'Director E', value: 'director_e' }
    ];

    associateOptions: any[] = [
        { label: 'Associate A', value: 'associate_a' },
        { label: 'Associate B', value: 'associate_b' },
        { label: 'Associate C', value: 'associate_c' },
        { label: 'Associate D', value: 'associate_d' },
        { label: 'Associate E', value: 'associate_e' }
    ];

    // Computed: Primary Director options filtered by selected directors
    primaryDirectorOptions = computed(() => {
        const dirs = this.selectedDirectors();
        if (!dirs || dirs.length === 0) return [];
        return this.directorOptions.filter(o => dirs.includes(o.value));
    });

    // Computed: Primary Associate options filtered by selected associates
    primaryAssociateOptions = computed(() => {
        const assocs = this.selectedAssociates();
        if (!assocs || assocs.length === 0) return [];
        return this.associateOptions.filter(o => assocs.includes(o.value));
    });

    // Computed: Check if form has unsaved changes
    isDirty = computed(() => {
        return !!(this.projectName() ||
            this.projectAbbreviation() ||
            this.selectedProjectType() ||
            this.selectedClients().length > 0 ||
            this.selectedDirectors().length > 0 ||
            this.primaryDirector() ||
            this.selectedAssociates().length > 0 ||
            this.primaryAssociate() ||
            this.description());
    });

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private projectService: ProjectService
    ) { }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const idParam = params.get('id');
            if (idParam) {
                this.isEditMode.set(true);
                this.projectId.set(+idParam);
                this.loadProjectData(this.projectId()!);
            }
        });
    }

    loadProjectData(id: number) {
        const project = this.projectService.getProjectById(id);
        if (project) {
            this.projectName.set(project.name);
            this.projectAbbreviation.set(project.abbreviation);
            this.selectedProjectType.set(project.selectedProjectType || null);
            this.selectedClients.set(project.clientIds || []);
            this.selectedDirectors.set(project.directorIds || []);
            this.primaryDirector.set(project.primaryDirector || null);
            this.selectedAssociates.set(project.associateIds || []);
            this.primaryAssociate.set(project.primaryAssociate || null);
            this.description.set(project.description || '');
            this.isActive.set(project.status === 'Active');
        }
    }

    onDirectorsChange() {
        if (this.primaryDirector() && !this.selectedDirectors().includes(this.primaryDirector())) {
            this.primaryDirector.set(null);
        }
    }

    onAssociatesChange() {
        if (this.primaryAssociate() && !this.selectedAssociates().includes(this.primaryAssociate())) {
            this.primaryAssociate.set(null);
        }
    }

    private getLabels(values: any[], options: any[]): string {
        if (!values || values.length === 0) return '';
        return options.filter(o => values.includes(o.value)).map(o => o.label).join(', ');
    }

    async onSave() {
        this.submitted.set(true);
        if (!this.projectName() || !this.projectAbbreviation() || !this.selectedProjectType()) return;

        const project: Project = {
            id: this.isEditMode() && this.projectId() ? this.projectId()! : 0,
            name: this.projectName(),
            abbreviation: this.projectAbbreviation(),
            projectType: this.selectedProjectType(),
            clientsWithAccess: this.getLabels(this.selectedClients(), this.clientOptions),
            directors: this.getLabels(this.selectedDirectors(), this.directorOptions),
            associates: this.getLabels(this.selectedAssociates(), this.associateOptions),
            description: this.description(),
            status: this.isActive() ? 'Active' : 'Inactive',
            // Preserve raw selections for edit mode
            clientIds: this.selectedClients(),
            directorIds: this.selectedDirectors(),
            associateIds: this.selectedAssociates(),
            primaryDirector: this.primaryDirector(),
            primaryAssociate: this.primaryAssociate(),
            selectedProjectType: this.selectedProjectType()
        };

        if (this.isEditMode()) {
            await this.projectService.updateProject(project);
        } else {
            await this.projectService.addProject(project);
        }

        this.router.navigate(['/admin/projects']);
    }

    onCancel() {
        if (this.isDirty()) {
            this.showCancelDialog.set(true);
        } else {
            this.router.navigate(['/admin/projects']);
        }
    }

    onConfirmLeave() {
        this.showCancelDialog.set(false);
        this.router.navigate(['/admin/projects']);
    }

    onKeepEditing() 
    {
        this.showCancelDialog.set(false);
    }

    navigateToProjectsList() {
        this.router.navigate(['/admin/projects']);
    }
} 
