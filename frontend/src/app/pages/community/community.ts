import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { LayoutService } from '../../services/layout';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    InputGroupModule,
    InputGroupAddonModule
  ],
  templateUrl: './community.html',
  styleUrl: './community.css'
})
export class CommunityComponent {
  activeTab: string = 'discussion';
  participants: number = 9;

  constructor(private layout: LayoutService) {
    this.layout.setTitle('Community');
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
