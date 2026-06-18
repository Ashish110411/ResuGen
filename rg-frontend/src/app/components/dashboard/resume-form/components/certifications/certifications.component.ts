import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-certifications',
  templateUrl: './certifications.component.html',
  styleUrls: ['./certifications.component.css']
})
export class CertificationsComponent {
  @Input() certificationsArray!: FormArray;
  @Input() visibleSections!: Set<string>;
  
  @Output() add = new EventEmitter<void>();
  @Output() remove = new EventEmitter<number>();

  isOpen = true;

  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  years: number[] = [];

  constructor() {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 50 }, (_, i) => currentYear - i);
  }

  getFormGroup(idx: number): FormGroup {
    return this.certificationsArray.at(idx) as FormGroup;
  }
}
