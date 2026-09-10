import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-benchmarks',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="page-container">
      <h2>Interactive Benchmarks</h2>
      <p>View and analyze interactive benchmarks.</p>
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
export class BenchmarksComponent { }
