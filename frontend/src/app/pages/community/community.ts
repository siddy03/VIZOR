import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { LayoutService } from '../../services/layout';

/**
 * Community page shell. Holds the tab navigation (Discussion Board / Chat / Poll)
 * and renders the active child via <router-outlet>.
 *
 * Each child component owns its own real-time transport and lifecycle:
 *   - DiscussionComponent → raw WebSocket (postman echo)
 *   - ChatComponent       → Socket.IO server (backend :9092)
 *   - PollComponent       → placeholder
 *
 * Routes:
 *   /community                 -> redirects to /community/discussion
 *   /community/discussion
 *   /community/chat
 *   /community/poll
 */
@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule],
  templateUrl: './community.html',
  styleUrl: './community.css',
})
export class CommunityComponent {
  constructor(private layout: LayoutService) {
    this.layout.setTitle('Community');
  }
}
