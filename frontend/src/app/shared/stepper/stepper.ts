import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepperModule } from 'primeng/stepper';

export interface StepItem {
  label: string;
}

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [CommonModule, StepperModule],
  templateUrl: './stepper.html',
  styleUrl: './stepper.css'
})
export class StepperComponent {
  @Input() steps: StepItem[] = [];
  @Input() currentStep = 0;
  @Input() allowFreeNavigation = false;
  @Output() stepChange = new EventEmitter<number>();

  onStepClick(index: number): void {
    if (this.allowFreeNavigation || index < this.currentStep) {
      this.stepChange.emit(index);
    }
  }
}
