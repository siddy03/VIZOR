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
import { RoundtableService, Roundtable } from '../../services/roundtable.service';
import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/breadcrumb/breadcrumb';
import { SharedDropdownComponent } from '../../shared/shared-dropdown/shared-dropdown';

@Component({
    selector: 'app-add-roundtable',
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
    templateUrl: './add-roundtable.html',
    styleUrls: ['./add-roundtable.css']
})
export class AddRoundtableComponent implements OnInit {
    breadcrumbItems = computed<BreadcrumbItem[]>(() => [
        { label: 'Admin' },
        { label: 'Roundtables', isLink: true },
        { label: this.isEditMode() ? 'Modify Roundtable' : 'Add New Roundtable' }
    ]);

    // Local reactive state via Angular Signals
    roundtableName = signal<string>('');
    roundtableAbbreviation = signal<string>('');
    selectedClients = signal<any[]>([]);
    selectedDirectors = signal<any[]>([]);
    primaryDirector = signal<any>(null);
    selectedAssociates = signal<any[]>([]);
    primaryAssociate = signal<any>(null);
    description = signal<string>('');
    isActive = signal<boolean>(true);
    showCancelDialog = signal<boolean>(false);
    isEditMode = signal<boolean>(false);
    roundtableId = signal<number | null>(null);

    // Validation flag
    submitted = signal<boolean>(false);

    // Options for dropdowns (static, no need for signals)
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
        return this.directorOptions.filter(option => dirs.includes(option.value));
    });

    // Computed: Primary Associate options filtered by selected associates
    primaryAssociateOptions = computed(() => {
        const assocs = this.selectedAssociates();
        if (!assocs || assocs.length === 0) return [];
        return this.associateOptions.filter(option => assocs.includes(option.value));
    });

    // Computed: Check if form has unsaved changes
    isDirty = computed(() => {
        return !!(this.roundtableName() ||
            this.roundtableAbbreviation() ||
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
        private roundtableService: RoundtableService
    ) { }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const idParam = params.get('id');
            if (idParam) {
                this.isEditMode.set(true);
                this.roundtableId.set(+idParam);
                this.loadRoundtableData(this.roundtableId()!);
            }
        });
    }

    loadRoundtableData(id: number) {
        const roundtable = this.roundtableService.getRoundtableById(id);
        if (roundtable) {
            this.roundtableName.set(roundtable.name);
            this.roundtableAbbreviation.set(roundtable.abbreviation);
            this.selectedClients.set(roundtable.clientIds || []);
            this.selectedDirectors.set(roundtable.directorIds || []);
            this.selectedAssociates.set(roundtable.associateIds || []);
            this.primaryDirector.set(roundtable.primaryDirector);
            this.primaryAssociate.set(roundtable.primaryAssociate);
            this.description.set(roundtable.description);
            this.isActive.set(roundtable.status === 'Active');
        }
    }

    // Clear primary director if it's no longer in the selected directors list
    onDirectorsChange() {
        if (this.primaryDirector() && !this.selectedDirectors().includes(this.primaryDirector())) {
            this.primaryDirector.set(null);
        }
    }

    // Clear primary associate if it's no longer in the selected associates list
    onAssociatesChange() {
        if (this.primaryAssociate() && !this.selectedAssociates().includes(this.primaryAssociate())) {
            this.primaryAssociate.set(null);
        }
    }

    async onSave() {
        this.submitted.set(true);


        // Basic Validation: Check Required Fields
        if (!this.roundtableName() || !this.roundtableAbbreviation()) {
            return;
        }

        const newRoundtable: Roundtable = {
            id: this.isEditMode() && this.roundtableId() ? this.roundtableId()! : 0,
            name: this.roundtableName(),
            abbreviation: this.roundtableAbbreviation(),
            clientsWithAccess: this.selectedClients().length,
            directors: this.getLabelsFromValues(this.selectedDirectors(), this.directorOptions),
            associates: this.getLabelsFromValues(this.selectedAssociates(), this.associateOptions),
            description: this.description(),
            status: this.isActive() ? 'Active' : 'Inactive',
            clientIds: this.selectedClients(),
            directorIds: this.selectedDirectors(),
            associateIds: this.selectedAssociates(),
            primaryDirector: this.primaryDirector(),
            primaryAssociate: this.primaryAssociate()
        };



        if (this.isEditMode()) {
            await this.roundtableService.updateRoundtable(newRoundtable);

        } else {
            await this.roundtableService.addRoundtable(newRoundtable);

        }

        // Navigate back to roundtables list (View Page)
        this.router.navigate(['/admin/roundtables']);
    }

    private getLabelsFromValues(values: any[], options: any[]): string {
        if (!values || values.length === 0) return '';
        return options
            .filter(opt => values.includes(opt.value))
            .map(opt => opt.label)
            .join(', ');
    }

    onCancel() {
        if (this.isDirty()) {
            this.showCancelDialog.set(true);
        } else {
            this.router.navigate(['/admin/roundtables']);
        }
    }

    onConfirmLeave() {
        this.showCancelDialog.set(false);
        this.router.navigate(['/admin/roundtables']);
    }

    onKeepEditing() {
        this.showCancelDialog.set(false);
    }

    navigateToRoundtablesList() {
        this.router.navigate(['/admin/roundtables']);
    }
}
