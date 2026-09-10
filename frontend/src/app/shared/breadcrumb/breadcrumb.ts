import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface BreadcrumbItem {
  label: string;
  /** If true, the item is rendered as a clickable link and emits `itemClick` on click */
  isLink?: boolean;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.css'
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
  @Output() itemClick = new EventEmitter<number>();

  onItemClick(index: number): void {
    if (this.items[index]?.isLink) {
      this.itemClick.emit(index);
    }
  }
}
