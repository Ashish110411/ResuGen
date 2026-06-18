import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-education',
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.css']
})
export class EducationComponent {
  @Input() educationArray!: FormArray;
  @Input() visibleSections!: Set<string>;
  @Output() add = new EventEmitter<void>();
  @Output() remove = new EventEmitter<number>();

  isOpen = true;

  getFormGroup(idx: number): FormGroup {
    return this.educationArray.at(idx) as FormGroup;
  }
}
