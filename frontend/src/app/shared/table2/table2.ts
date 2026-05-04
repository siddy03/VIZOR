import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-table2',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  templateUrl: './table2.html',
  styleUrl: './table2.css'
})
export class Table2Component {
  @Input() data: any[] = [];
  @Input() cols: { field: string; header: string; sortable?: boolean }[] = [];
  
  // Action toggles
  @Input() showEdit: boolean = true;
  @Input() showCopy: boolean = true;
  @Input() showDelete: boolean = true;

  // Action emitters
  @Output() onEdit = new EventEmitter<any>();
  @Output() onCopy = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();

  handleEdit(row: any) {
    this.onEdit.emit(row);
  }

  handleCopy(row: any) {
    this.onCopy.emit(row);
  }

  handleDelete(row: any) {
    this.onDelete.emit(row);
  }
}
