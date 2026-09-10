import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../shared/breadcrumb/breadcrumb';
import { SharedDropdownComponent } from '../../../shared/shared-dropdown/shared-dropdown';

@Component({
    selector: 'app-add-user',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        SelectModule,
        CheckboxModule,
        DatePickerModule,
        TableModule,
        BreadcrumbComponent,
        SharedDropdownComponent
    ],
    templateUrl: './add-user.html',
    styleUrls: ['./add-user.css']
})
export class AddUserComponent implements OnInit {
    breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Admin' },
        { label: 'Users', isLink: true },
        { label: 'Add New User' }
    ];

    // Form Fields
    email: string = '';
    firstName: string = '';
    lastName: string = '';
    title: string = '';
    countryCode: any = { name: 'United States', code: '+1', flag: 'us' };
    phone: string = '';
    salesforceCode: string = '';
    primaryContact: any = null;
    role: any = null;
    expiryDate: Date | null = null;

    // Status
    isActive: boolean = true;
    isLocked: boolean = false;
    isSuspended: boolean = false;
    enableNotifications: boolean = true;

    // Dropdown Options
    countryOptions: any[] = [
        { name: 'United States', code: '+1', flag: 'us' },
        { name: 'United Kingdom', code: '+44', flag: 'gb' },
        { name: 'Canada', code: '+1', flag: 'ca' }
    ];

    primaryContactOptions: any[] = [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
    ];

    roleOptions: any[] = [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
        { label: 'Manager', value: 'manager' }
    ];

    // Data Tables
    roundtablePermissions: any[] = [];
    projectPermissions: any[] = [];

    submitted: boolean = false;

    constructor(private router: Router) { }

    ngOnInit() { }

    onSave() {
        this.submitted = true;
        if (!this.email || !this.firstName || !this.lastName || !this.countryCode || !this.phone || !this.role) {
            return;
        }

        this.router.navigate(['/admin/users']);
    }

    onCancel() {
        this.router.navigate(['/admin/users']);
    }

    navigateToUsersList() {
        this.router.navigate(['/admin/users']);
    }
}
