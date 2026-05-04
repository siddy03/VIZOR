import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';

let sharedDropdownIdCounter = 0;

@Component({
  selector: 'app-shared-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule],
  templateUrl: './shared-dropdown.html',
  styleUrl: './shared-dropdown.css'
})
export class SharedDropdownComponent {
  @Input() label: string = '';
  @Input() options: any[] = [];
  @Input() optionLabel: string = 'label';
  @Input() optionValue: string = 'value';
  @Input() placeholder: string = '';
  @Input() filter: boolean = false;
  @Input() id: string = `shared-dropdown-${++sharedDropdownIdCounter}`;
  @Input() isInvalid: boolean = false;
  @Input() appendTo: any = 'body';
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() ariaLabel: string = '';
  
  // The selected value
  @Input() value: any;
  
  // Event emitter for changes
  @Output() valueChange = new EventEmitter<any>();
  @Output() onChange = new EventEmitter<any>();

  @ContentChild('selectedItem', { static: false }) selectedItemTemplate!: TemplateRef<any>;
  @ContentChild('item', { static: false }) itemTemplate!: TemplateRef<any>;

  onSelectChange(event: any): void {
    this.valueChange.emit(event);
  }

  onNativeChange(event: any): void {
    this.onChange.emit(event);
  }
}
