import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';

import { ClientService, Client } from '../../services/client.service';
import { RoundtableService } from '../../services/roundtable.service';
import { ProjectService } from '../../services/project.service';
import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/breadcrumb/breadcrumb';
import { SharedDropdownComponent } from '../../shared/shared-dropdown/shared-dropdown';

// Cross-field validation for at least one roundtable or project
export function requireRoundtableOrProject(control: AbstractControl): ValidationErrors | null {
    const roundtables = control.get('roundtableIds')?.value;
    const projects = control.get('projectIds')?.value;
    
    if ((!roundtables || roundtables.length === 0) && (!projects || projects.length === 0)) {
        return { missingProjectOrRoundtable: true };
    }
    return null;
}

@Component({
    selector: 'app-add-client',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        SelectModule,
        MultiSelectModule,
        RadioButtonModule,
        CheckboxModule,
        ToastModule,
        DialogModule,
        BreadcrumbComponent,
        SharedDropdownComponent
    ],
    providers: [MessageService],
    templateUrl: './add-client.html',
    styleUrls: ['./add-client.css']
})
export class AddClientComponent implements OnInit {
    breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Admin' },
        { label: 'Clients', isLink: true },
        { label: 'Add New Client' }
    ];

    clientForm!: FormGroup;
    isEditMode = false;
    clientId: number | null = null;
    domains: string[] = [];
    isFormDirty = false;
    showCancelDialog = signal(false);

    parentClientOptions: { label: string; value: string }[] = [];

    peerGroupOptions = [
        { label: 'Peer Group 1', value: 1 },
        { label: 'Peer Group 2', value: 2 }
    ];

    roundtableOptions: { label: string; value: number }[] = [];
    projectOptions: { label: string; value: number }[] = [];

    private fb = inject(FormBuilder);
    private clientService = inject(ClientService);
    private roundtableService = inject(RoundtableService);
    private projectService = inject(ProjectService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private messageService = inject(MessageService);

    ngOnInit() {
        this.initForm();

        this.roundtableService.loadRoundtables();
        this.projectService.loadProjects();
        this.clientService.loadClients();

        this.roundtableService.roundtables$.subscribe(roundtables => {
            this.roundtableOptions = (roundtables || []).map(r => ({ label: r.name, value: r.id }));
        });

        this.projectService.projects$.subscribe(projects => {
            this.projectOptions = (projects || []).map(p => ({ label: p.name, value: p.id }));
        });

        this.clientService.clients$.subscribe(clients => {
            this.parentClientOptions = (clients || [])
                .filter(c => !this.isEditMode || c.id !== this.clientId)
                .map(c => ({ label: c.name, value: c.name }));
        });

        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.isEditMode = true;
                this.clientId = +id;
                this.breadcrumbItems[2].label = 'Modify Client';
                this.loadClientData(this.clientId);
            }
        });

        // Track changes for CanDeactivate guard
        this.clientForm.valueChanges.subscribe(() => {
            if (this.clientForm.dirty) {
                this.isFormDirty = true;
            }
        });
    }

    initForm() {
        this.clientForm = this.fb.group({
            name: ['', Validators.required],
            abbreviation: ['', Validators.required],
            parentClient: [null],
            peerGroupIds: [[]],
            roundtableIds: [[]],
            projectIds: [[]],
            domainInput: [''], // Used for the input field, not submitted directly
            identityProvider: ['AR Identity Provider'],
            active: [true],
            selfDatabase: [false]
        }, { validators: requireRoundtableOrProject });
    }

    loadClientData(id: number) {
        const client = this.clientService.getClientById(id);
        if (client) {
            this.domains = [...(client.domains || [])];
            this.clientForm.patchValue({
                name: client.name,
                abbreviation: client.abbreviation,
                parentClient: client.parentClient,
                peerGroupIds: client.peerGroupIds || [],
                roundtableIds: client.roundtableIds || [],
                projectIds: client.projectIds || [],
                identityProvider: client.identityProvider,
                active: client.active,
                selfDatabase: client.selfDatabase
            });
            // Reset dirty state after loading
            setTimeout(() => {
                this.isFormDirty = false;
                this.clientForm.markAsPristine();
            });
        }
    }

    // Domain Chip Management
    onDomainKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent form submission
            const inputCtrl = this.clientForm.get('domainInput');
            const value = inputCtrl?.value?.trim();
            
            if (value && !this.domains.includes(value)) {
                this.domains.push(value);
                inputCtrl?.setValue('');
                this.clientForm.markAsDirty();
                this.isFormDirty = true;
            }
        }
    }

    removeDomain(index: number) {
        this.domains.splice(index, 1);
        this.clientForm.markAsDirty();
        this.isFormDirty = true;
    }

    async onSubmit() {
        // Force validation on all fields
        this.clientForm.markAllAsTouched();
        
        // Custom validation check for domains
        if (this.domains.length === 0) {
            this.clientForm.get('domainInput')?.markAsTouched();
        }

        if (this.clientForm.invalid || this.domains.length === 0) {
            this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill out all required fields correctly.' });
            return;
        }

        const formValue = this.clientForm.value;
        
        // Map raw IDs to string representations for the table view
        const getLabels = (ids: number[], options: any[]) => 
            options.filter(opt => ids.includes(opt.value)).map(opt => opt.label).join(', ');

        const clientData: Client = {
            id: this.isEditMode && this.clientId ? this.clientId : Date.now(),
            name: formValue.name,
            abbreviation: formValue.abbreviation,
            parentClient: formValue.parentClient || '-',
            peerGroups: getLabels(formValue.peerGroupIds || [], this.peerGroupOptions),
            roundtables: getLabels(formValue.roundtableIds || [], this.roundtableOptions),
            projects: getLabels(formValue.projectIds || [], this.projectOptions),
            domains: this.domains,
            identityProvider: formValue.identityProvider,
            active: formValue.active,
            selfDatabase: formValue.selfDatabase,
            status: formValue.active ? 'Active' : 'Inactive',
            
            // Raw IDs
            peerGroupIds: formValue.peerGroupIds,
            roundtableIds: formValue.roundtableIds,
            projectIds: formValue.projectIds
        };

        if (this.isEditMode) {
            await this.clientService.updateClient(clientData);
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Client updated successfully.' });
        } else {
            await this.clientService.addClient(clientData);
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Client created successfully.' });
        }

        // Reset dirty flag to bypass unsaved changes guard
        this.isFormDirty = false;
        
        // Wait briefly for toast, then navigate
        setTimeout(() => {
            this.router.navigate(['/admin/clients']);
        }, 1000);
    }

    onCancel() {
        if (this.isFormDirty) {
            this.showCancelDialog.set(true);
        } else {
            this.router.navigate(['/admin/clients']);
        }
    }

    handleBreadcrumbClick(index: number) {
        if (index === 1) { // Index of 'Clients'
            this.onCancel();
        }
    }

    onKeepEditing() {
        this.showCancelDialog.set(false);
    }

    onConfirmLeave() {
        this.isFormDirty = false;
        this.showCancelDialog.set(false);
        this.router.navigate(['/admin/clients']);
    }

    // Required method for CanDeactivateGuard
    hasUnsavedChanges(): boolean {
        return this.isFormDirty;
    }
}
