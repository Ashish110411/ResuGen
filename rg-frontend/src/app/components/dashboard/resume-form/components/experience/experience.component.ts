import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { SpacingSettings } from '../../../../../models/resume.models';

@Component({
  selector: 'app-experience',
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.css']
})
export class ExperienceComponent {
  @Input() experienceArray!: FormArray;
  @Input() visibleSections!: Set<string>;
  @Input() vspaceSettings!: SpacingSettings;
  @Output() add = new EventEmitter<void>();
  @Output() remove = new EventEmitter<number>();
  @Output() addAch = new EventEmitter<{ expIdx: number }>();
  @Output() removeAch = new EventEmitter<{ expIdx: number, achIdx: number }>();
  @Output() vspaceChange = new EventEmitter<{ field: string, change: number }>();
  @Output() presetChange = new EventEmitter<{ afterTitle: number, betweenExps: number }>();

  isOpen = true;
  vspaceOpen = false;

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
    return this.experienceArray.at(idx) as FormGroup;
  }

  getAchievements(idx: number): FormArray {
    return this.getFormGroup(idx).get('achievements') as FormArray;
  }
}

