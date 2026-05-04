import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';

interface PublishedSurvey {
    id: string;
    surveyName: string;
    datePublished: string;
    participantsInvited: number;
    participantsResponded: number;
    responseRate: string;
    status: string;
}

@Component({
    selector: 'app-published-surveys',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, TagModule],
    templateUrl: './published-surveys.html',
    styleUrl: './published-surveys.css',
})
export class PublishedSurveysComponent {
    surveys: PublishedSurvey[] = [
        { id: '1', surveyName: '2023 Annual Engagement', datePublished: '01/10/2024', participantsInvited: 150, participantsResponded: 120, responseRate: '80%', status: 'Published' },
        { id: '2', surveyName: 'Q4 Customer Feedback', datePublished: '12/15/2023', participantsInvited: 500, participantsResponded: 250, responseRate: '50%', status: 'Closed' },
        { id: '3', surveyName: 'New Product Interest', datePublished: '02/05/2024', participantsInvited: 200, participantsResponded: 45, responseRate: '22.5%', status: 'Open' },
        { id: '4', surveyName: 'Training Feedback', datePublished: '02/12/2024', participantsInvited: 30, participantsResponded: 28, responseRate: '93%', status: 'Open' },
    ];

    getSeverity(status: string) {
        switch (status) {
            case 'Published':
            case 'Open':
                return 'success';
            case 'Closed':
                return 'secondary';
            default:
                return undefined;
        }
    }
}
