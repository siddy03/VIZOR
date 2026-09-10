import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

let sharedSearchbarIdCounter = 0;

@Component({
    selector: 'app-shared-searchbar',
    standalone: true,
    imports: [CommonModule, FormsModule, InputTextModule, ButtonModule],
    templateUrl: './shared-searchbar.html',
    styleUrl: './shared-searchbar.css',
})
export class SharedSearchbarComponent {
    @Input() placeholder: string = 'Search';
    @Input() ariaLabel: string = 'Search';
    @Input() value: string = '';
    @Input() id: string = `shared-searchbar-${++sharedSearchbarIdCounter}`;

    @Output() valueChange = new EventEmitter<string>();
    @Output() onSearch = new EventEmitter<string>();

    onInputChange(val: string) {
        this.value = val;
        this.valueChange.emit(val);
    }

    submitSearch() {
        this.onSearch.emit(this.value);
    }
}
