import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ContentChild, TemplateRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';

export type Table1ColumnType = 'text' | 'checkbox' | 'status';

export interface Table1Column {
  field: string;
  header: string;
  type?: Table1ColumnType;
  sortable?: boolean;
}

export interface Table1CheckboxChangeEvent {
  row: any;
  field: string;
  checked: boolean;
}

export interface Table1Action {
  id: string;
  icon: string;
  tooltip: string;
  cssClass?: string;
  title?: string;
}

export interface Table1ActionEvent {
  actionId: string;
  row: any;
}

@Component({
  selector: 'app-table1',
  standalone: true,
  imports: [CommonModule, FormsModule, CheckboxModule, ButtonModule, TableModule],
  templateUrl: './table1.html',
  styleUrl: './table1.css'
})
export class Table1Component {
  @Input() rows: any[] = [];
  @Input() columns: Table1Column[] = [];
  @Input() emptyTitle: string = 'No Records Found!';
  
  // Pagination API
  @Input() paginator: boolean = false;
  @Input() rowsPerPage: number = 10;
  @Input() rowsPerPageOptions: number[] = [10, 25, 50];
  
  // Legacy actions (will keep for backward compatibility with roundtables)
  @Input() showEditAction: boolean = false;
  @Input() editAriaLabel: string = 'Edit row';
  @Input() showDeleteAction: boolean = false;
  @Input() deleteAriaLabel: string = 'Delete row';

  // New Dynamic Actions API
  @Input() rowActions: Table1Action[] = [];
  
  // Row Expansion API
  @Input() expandableRows: boolean = false;
  @Input() dataKey: string = 'id';
  @ContentChild('rowExpansionTemplate') rowExpansionTemplate!: TemplateRef<any>;

  @Input() isCheckboxDisabled: ((row: any, field: string) => boolean) | null = null;

  @Output() checkboxChange = new EventEmitter<Table1CheckboxChangeEvent>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() actionClick = new EventEmitter<Table1ActionEvent>();

  getTextValue(row: any, field: string): string {
    const value = row?.[field];
    if (value === null || value === undefined || value === '') return '-';
    return String(value);
  }

  getCheckboxValue(row: any, field: string): boolean {
    return !!row?.[field];
  }

  onCheckboxModelChange(row: any, field: string, checked: boolean): void {
    this.checkboxChange.emit({ row, field, checked });
  }

  onEditClick(row: any): void {
    this.edit.emit(row);
  }

  onDeleteClick(row: any): void {
    this.delete.emit(row);
  }

  onActionClick(actionId: string, row: any): void {
    this.actionClick.emit({ actionId, row });
  }

  isCellDisabled(row: any, field: string): boolean {
    return this.isCheckboxDisabled ? this.isCheckboxDisabled(row, field) : false;
  }
}
