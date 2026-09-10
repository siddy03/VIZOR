import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-tools',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="page-container">
      <h2>Tools</h2>
      <p>Access your tools and utilities here.</p>
    </div>
  `,
    styles: [`
    .page-container {
      padding: 24px;
    }
    h2 {
      font-size: 24px;
      font-weight: 400;
      color: #202124;
      margin-bottom: 16px;
    }
    p {
      font-size: 14px;
      color: #5f6368;
    }
  `]
})
export class ToolsComponent { }
