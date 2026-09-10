import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Community -> Poll tab. Placeholder for now.
 */
@Component({
  selector: 'app-community-poll',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './poll.html',
  styleUrls: ['../community-shared.css', './poll.css'],
})
export class PollComponent {}
