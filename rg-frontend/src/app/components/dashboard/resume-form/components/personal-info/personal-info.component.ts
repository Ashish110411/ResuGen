import { Component, Input } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.css']
})
export class PersonalInfoComponent {
  @Input() personalInfoForm!: FormGroup;
  @Input() visibleSections!: Set<string>;

  constructor(private fb: FormBuilder) {}

  get hyperlinks(): FormArray {
    return this.personalInfoForm.get('hyperlinks') as FormArray;
  }

  addHyperlink(): void {
    this.hyperlinks.push(this.fb.group({
      name: ['', Validators.required],
      url: ['', Validators.required]
    }));
  }

  removeHyperlink(idx: number): void {
    this.hyperlinks.removeAt(idx);
  }
}

