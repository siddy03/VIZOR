import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-help',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './help.html',
    styleUrl: './help.css'
})
export class HelpComponent {
    faqs = [
        {
            question: 'How do I create a new survey?',
            answer: 'Navigate to Surveys > Add Survey from the sidebar menu. Fill in the required fields and click Submit.'
        },
        {
            question: 'How do I view survey results?',
            answer: 'Go to Surveys > View Survey to see all published surveys and their results.'
        },
        {
            question: 'How do I schedule a meeting?',
            answer: 'Click on Meetings in the sidebar, then select "Schedule New Meeting" to create a meeting.'
        },
        {
            question: 'How do I access the Discussion Board?',
            answer: 'Click on "Discussion Board/Chat" in the sidebar to participate in community discussions.'
        }
    ];

    contactInfo = {
        email: 'support@vizor.com',
        phone: '1-800-VIZOR-HELP'
    };
}
