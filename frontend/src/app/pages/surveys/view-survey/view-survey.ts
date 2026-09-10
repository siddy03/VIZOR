import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../shared/breadcrumb/breadcrumb';
import { SharedDropdownComponent } from '../../../shared/shared-dropdown/shared-dropdown';
import { Table2Component } from '../../../shared/table2/table2';
import { SharedSearchbarComponent } from '../../../shared/shared-searchbar/shared-searchbar';
import { SurveyService, StoredSurvey } from '../../../services/survey.service';


@Component({
    selector: 'app-view-survey',
    standalone: true,
    imports: [
        CommonModule, 
        FormsModule, 
        ButtonModule, 
        InputTextModule, 
        IconFieldModule, 
        InputIconModule, 
        BreadcrumbComponent,
        SharedDropdownComponent, 
        Table2Component,
        SharedSearchbarComponent
    ],
    templateUrl: './view-survey.html',
    styleUrl: './view-survey.css',
})
export class ViewSurveyComponent implements OnInit, OnDestroy {
    private router = inject(Router);
    private surveyService = inject(SurveyService);
    private subscription?: Subscription;
    private allSurveys: StoredSurvey[] = [];

    breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Surveys' },
        { label: 'View Survey' }
    ];

    activeTab: 'roundtables' | 'projects' = 'roundtables';

    // Filters
    selectedContext: string = 'All';
    selectedSurveyType: string = 'All';
    searchQuery: string = '';

    contextOptions = [
        { label: 'All', value: 'All' }
    ];

    surveyTypeOptions = [
        { label: 'All', value: 'All' },
        { label: 'Benchmark', value: 'Benchmark' },
        { label: 'Ad Hoc', value: 'Ad Hoc' }
    ];

    // Table Data
    surveyData: any[] = [];
    surveyCols = [
        { field: 'name', header: 'Survey Name' },
        { field: 'type', header: 'Survey Type' },
        { field: 'timePeriod', header: 'Time Period' },
        { field: 'year', header: 'Year' },
        { field: 'surveyDates', header: 'Survey Dates' },
        { field: 'firstReminder', header: 'First Reminder' },
        { field: 'secondReminder', header: 'Second Reminder' },
        { field: 'status', header: 'Survey Status' }
    ];

    ngOnInit(): void {
        this.surveyService.loadSurveys();
        this.loadSurveys();
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
    }

    private loadSurveys(): void {
        this.subscription = this.surveyService.surveys$.subscribe(surveys => {
            this.allSurveys = surveys;
            this.updateContextOptions();
            this.applyFilters();
        });
    }

    private filterByTab(surveys: StoredSurvey[]): StoredSurvey[] {
        const sourceFilter = this.activeTab === 'roundtables' ? 'Roundtable' : 'Project';
        return surveys.filter(s => s.source === sourceFilter);
    }

    private mapToTableRow(s: StoredSurvey): any {
        const startDate = s.startDate ? this.formatDate(s.startDate) : '';
        const endDate = s.endDate ? this.formatDate(s.endDate) : '';
        const surveyDates = startDate && endDate ? `${startDate} - ${endDate}` : startDate || endDate;

        return {
            id: s.id,
            name: s.surveyName || '-',
            type: s.surveyType || '-',
            timePeriod: s.period ? (s.periodNumber ? `${s.period} ${s.periodNumber}` : s.period) : '-',
            year: s.year || '-',
            surveyDates: surveyDates || '-',
            firstReminder: s.firstAlertDate ? this.formatDate(s.firstAlertDate) : '-',
            secondReminder: s.reminderDate ? this.formatDate(s.reminderDate) : '-',
            status: s.status || 'Draft'
        };
    }

    private formatDate(isoDate: string): string {
        try {
            const d = new Date(isoDate);
            if (isNaN(d.getTime())) return '-';
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const year = d.getFullYear();
            return `${month}/${day}/${year}`;
        } catch {
            return '-';
        }
    }

    switchTab(tab: any) {
        if (tab !== 'roundtables' && tab !== 'projects') return;
        this.activeTab = tab;
        this.selectedContext = 'All';
        this.selectedSurveyType = 'All';
        this.searchQuery = '';
        this.updateContextOptions();
        this.applyFilters();
    }

    onContextChange(value: string): void {
        this.selectedContext = value || 'All';
        this.applyFilters();
    }

    onSurveyTypeChange(value: string): void {
        this.selectedSurveyType = value || 'All';
        this.applyFilters();
    }

    onSearch(): void {
        this.applyFilters();
    }

    onSearchInput(): void {
        this.applyFilters();
    }

    private updateContextOptions(): void {
        const entitySet = new Set(
            this.filterByTab(this.allSurveys)
                .map(s => s.entity?.trim())
                .filter((entity): entity is string => !!entity)
        );

        const entityOptions = Array.from(entitySet)
            .sort((a, b) => a.localeCompare(b))
            .map(entity => ({ label: entity, value: entity }));

        this.contextOptions = [{ label: 'All', value: 'All' }, ...entityOptions];
    }

    private applyFilters(): void {
        const sourceFiltered = this.filterByTab(this.allSurveys);
        const contextFiltered = this.selectedContext === 'All'
            ? sourceFiltered
            : sourceFiltered.filter(survey => survey.entity === this.selectedContext);

        const surveyTypeFiltered = this.selectedSurveyType === 'All'
            ? contextFiltered
            : contextFiltered.filter(survey =>
                this.normalizeSurveyType(survey.surveyType) === this.normalizeSurveyType(this.selectedSurveyType)
            );

        const query = this.searchQuery.trim().toLowerCase();
        const searched = !query
            ? surveyTypeFiltered
            : surveyTypeFiltered.filter(survey => {
                const haystack = [
                    survey.surveyName,
                    survey.entity,
                    survey.surveyType,
                    survey.period,
                    survey.periodNumber,
                    String(survey.year ?? ''),
                    survey.status
                ].join(' ').toLowerCase();
                return haystack.includes(query);
            });

        this.surveyData = searched.map(survey => this.mapToTableRow(survey));
    }

    private normalizeSurveyType(value: string | undefined): string {
        return (value || '')
            .toLowerCase()
            .replace(/\s+/g, '');
    }

    handleEdit(row: any) {
        if (row?.id) {
            this.router.navigate(['/surveys/edit', row.id]);
        }
    }

    handleCopy(row: any) {
        console.log('Copy clicked for', row);
    }

    async handleDelete(row: any) {
        if (!row?.id) return;
        const surveyName = row.name && row.name !== '-' ? row.name : 'this survey';
        const confirmed = window.confirm(`Delete survey "${surveyName}"? This cannot be undone.`);
        if (!confirmed) return;

        const ok = await this.surveyService.deleteSurvey(row.id);
        if (!ok) {
            window.alert(`Could not delete survey "${surveyName}". Please try again.`);
        }
    }
}
