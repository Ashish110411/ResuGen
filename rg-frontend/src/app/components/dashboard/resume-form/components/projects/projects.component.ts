import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { SpacingSettings } from '../../../../../models/resume.models';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent {
  @Input() projectsArray!: FormArray;
  @Input() visibleSections!: Set<string>;
  @Input() vspaceSettings!: SpacingSettings;

  @Output() add = new EventEmitter<void>();
  @Output() remove = new EventEmitter<number>();
  @Output() addPt = new EventEmitter<{ projIdx: number }>();
  @Output() removePt = new EventEmitter<{ projIdx: number, ptIdx: number }>();
  @Output() vspaceChange = new EventEmitter<{ field: string, change: number }>();
  @Output() presetChange = new EventEmitter<{ afterTitle: number, betweenProjs: number }>();

  isOpen = true;
  vspaceOpen = false;

  constructor() { }

  getFormGroup(idx: number): FormGroup {
    return this.projectsArray.at(idx) as FormGroup;
  }

  getPoints(idx: number): FormArray {
    return this.getFormGroup(idx).get('description') as FormArray;
  }
}

